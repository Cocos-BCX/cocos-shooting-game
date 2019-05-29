/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by lizhiyi on 2018/3/14.
 */

var SHOW_STR_INTERVAL_TIME = 800;

var resourceUtil = cc.Class({

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },
    
    onLoad: function () {
        this.showTipsTime = 0;

        this.isShow = false;

        this.loading = null;
    },

    loadRes: function (url, type, cb) {
        cc.loader.loadRes(url, type, function (err, res) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            cb(err, res);
        });
    },
    
    createEffect: function (effectName, parent, createCallback, thisArg) {
        this.loadRes("effects/" + effectName + "/" + effectName, cc.Prefab, function (err, prefab) {
            if (err) {
                createCallback.apply(thisArg, [err]);
                return;
            }

            var node = cc.instantiate(prefab);
            node.position = cc.v2(0, 0);
            if (!parent) {
                parent = cc.director.getScene().getChildByName("Canvas");
            }

            node.parent = parent;
            createCallback.apply(thisArg, [null, node]);
        });
    },

    createEffectWithPath: function (path, parent, cb, thisArg) {
        this.loadRes("effects/" + path, cc.Prefab, function(err, prefab) {
            if (err) {
                cb('err', null);
                return;
            }

            var node = cc.instantiate(prefab);
            if (!parent) {
                parent = cc.find("Canvas");
            }

            parent.addChild(node);
            cb.apply(thisArg, [null, node]);
        });
    },

    getUIPrefabRes (prefabPath, cb) {
        this.loadRes("prefabs/ui/" + prefabPath, cc.Prefab, cb);
    },

    createUI: function (path, cb, parent) {
        this.loadRes("prefabs/ui/" + path, cc.Prefab, function (err, prefab) {
            if (err) return;
            var node = cc.instantiate(prefab);
            node.setPosition(cc.v2(0, 0));
            if (!parent) {
                parent = cc.find("Canvas");
            }

            parent.addChild(node);
            cb(null, node);
        });
    },

    playEffect: function (effectNode, playOverCallback, thisArg, isAutoDestroy) {
        //开始监听播放完毕回调
        var ani = effectNode.getComponent(cc.Animation);
        ani.play(effectNode.name);
        ani.once('finished', function () {
            if (isAutoDestroy) {
                effectNode.destroy(); //播放完毕后自动释放
            }

            playOverCallback.apply(thisArg);
        }, thisArg);
    },

    getPilotIcon: function (iconName, cb) {
        var arr = iconName.split('.');

        this.loadRes('Textures/Head/' + arr[0], cc.SpriteFrame, cb);
    }
});

var utils = new resourceUtil();
utils.onLoad();
module.exports = utils;