/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * 优化列表，列表动态显示，避免一次性加载出现卡顿(使用对象池)
 * Created by daisy on 2017/3/6.
 */

/**
 * !#en Enum for Layout type
 * !#zh 滚动类型
 * @enum Layout.Type
 */
var Type = cc.Enum({
    /**
     * !#en Horizontal Layout
     * !#zh 水平滚动
     * @property {Number} HORIZONTAL
     */
    HORIZONTAL: 1,

    /**
     * !#en Vertical Layout
     * !#zh 垂直滚动
     * @property {Number} VERTICAL
     */
    VERTICAL: 2
});

cc.Class({
    extends: cc.Component,

    properties: {
        prefab: {               //预置体
            default: null,
            type: cc.Prefab
        },
        scrollView: {           //滑动视图节点
            default: null,
            type: cc.Node
        },
        type: {
            default: Type.VERTICAL,
            type: Type
        },
        prefabScale: 1,         //prefab缩放大小
        paddingLeft: 10,        //左边距
        paddingRight: 10,       //右边距
        paddingTop: 10,         //上边距
        paddingBottom: 10,      //下边距
        spacingX: 5,           //行间距
        spacingY: 5,            //竖间距
        countPerRow: 5          //每行数量或每列数量
    },

    onLoad: function () {
        this.updateTimer = 0;
        this.updateInterval = 0.2;

        this.pool = new cc.NodePool();
        var initCount = this.countPerRow;
        for (var i = 0; i < initCount; ++i) {
            var item = cc.instantiate(this.prefab); // 创建节点
            this.pool.put(item); // 通过 putInPool 接口放入对象池
        }

        this.contents = [];
    },

    /**
     * 初始化列表
     * @param {Array} contents 内容
     */
    init: function (contents) {
        //清除节点
        // var children = this.node.children;
        // while (children.length) {
        //     this.remove(children[0]);
        // }
        this.isChange = true;
        this.positions = [];

        this.contents = contents instanceof Array ? contents : [];

        var size = this.node.getContentSize();
        if (this.type === Type.HORIZONTAL) {
            // this.countPerCol = (size.height - this.paddingTop - this.paddingBottom + this.spacingY) /
            //     (this.spacingY + this.getPrefabHeight());
            // this.countPerCol = Math.floor(this.countPerCol);
            this.countPerCol = this.countPerRow;
        }

        for (var i = 0; i < this.contents.length; i++) {
            var widthIndex;
            var heightIndex;
            if (this.type === Type.VERTICAL) {
                widthIndex = i % this.countPerRow;
                heightIndex = Math.floor(i / this.countPerRow);
            } else {
                widthIndex = Math.floor(i / this.countPerCol);
                heightIndex = i % this.countPerCol;
            }

            var width = this.getPrefabWidth();
            var height = this.getPrefabHeight();
            this.positions.push(cc.v2(this.paddingLeft + this.spacingX * widthIndex  + width * (widthIndex + 1 / 2),
                -(this.paddingTop + this.spacingY * heightIndex + height * (heightIndex + 1 / 2))));

        }

        //设置节点大小
        var sizeWidthIndex = Math.ceil(i / this.countPerCol);
        var sizeWidth = this.getPrefabWidth();
        var sizeHeightIndex = Math.ceil(i / this.countPerRow);
        var sizeHeight = this.getPrefabHeight();

        if (this.type === Type.VERTICAL) {
            this.node.setContentSize(
                cc.size(size.width, this.paddingTop + this.spacingY * sizeHeightIndex + sizeHeight * sizeHeightIndex)
            );
        } else {
            this.node.setContentSize(
                cc.size(this.paddingLeft + this.spacingX * sizeWidthIndex + sizeWidth * sizeWidthIndex, size.height)
            );
        }
    },

    addNode: function () {
        var child;
        var num = [];
        for (var i = 0; i < this.contents.length; i++) {
            var viewPos = this.getPositionInView(this.positions[i]);
            if (this.isOverBorder(viewPos)) {
                child = this.node.getChildByName(String(i));
                if (child) {
                    //超出边缘删除节点
                    this.remove(child);
                }

            } else {
                num.push(i);
                child = this.node.getChildByName(String(i));
                if (!child) {
                    //可视范围内显示节点
                    this.create(child, i);
                } else if (this.isChange) {
                    this.node.emit('show', { index: i, node: child, content: this.contents[i] });
                    child.setPosition(this.positions[i]);
                    child.name = String(i);
                }
            }
        }

        //清除多余节点
        if (this.isChange) {
            var children = this.node.children;
            cc.log('num' + num);
            for (let i = 0; i < children.length;) {
                child = children[i];
                if (num.indexOf(parseInt(child.name)) === -1) {
                    cc.log('remove' + child.name);
                    this.remove(child);
                } else {
                    i++;
                }
            }
        }

        this.isChange = false;
    },

    create: function (child, index) {
        if (this.pool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            child = this.pool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            child = cc.instantiate(this.prefab);
        }

        child.setScale(this.prefabScale, this.prefabScale);
        child.setPosition(this.positions[index]);
        this.node.addChild(child, 0, String(index));
        this.node.emit('show', { index: index, node: child, content: this.contents[index] });
    },

    remove: function (child) {
        this.pool.put(child);
        this.node.removeChild(child, false);
    },

    getPositionInView: function (position) { // get item position in scrollview's node space
        var worldPos = this.node.convertToWorldSpaceAR(position);
        var viewPos = this.scrollView.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },

    getPrefabHeight: function () {
        return this.prefab.data.height * this.prefabScale;
    },

    getPrefabWidth: function () {
        return this.prefab.data.width * this.prefabScale;
    },

    isOverBorder: function (viewPos) {
        var height = this.scrollView.height;
        var itemHeight = this.getPrefabHeight();
        var width = this.scrollView.width;
        var itemWidth = this.getPrefabWidth();
        var borderHeight = height / 2 + itemHeight / 2;
        var borderWidth = width + itemWidth / 2;
        if (this.type === Type.VERTICAL) {
            return viewPos.y > borderHeight || viewPos.y < -borderHeight;
        } else {
            return viewPos.x > borderWidth;
        }
    },

    update: function (dt) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) {
            return; // we don't need to do the math every frame
        }

        this.updateTimer = 0;
        this.addNode();

    },

    onDestory: function () {
        this.pool.clear();
    }
});
