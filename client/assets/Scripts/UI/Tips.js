// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

        lbContent: {
            type: cc.Label,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    showTips: function (str, cb) {
        var scene = cc.director.getScene();

        var isFind = false;
        for (var idxChild = 0; idxChild < scene.children.length; idxChild++) {
            var child = scene.children[idxChild];
            if (child.getComponent(cc.Canvas)) {
                child.addChild(this.node, 999);
                this.node.position = cc.v2(0, 100);
                isFind = true;
                break;
            }
        }

        if (!isFind) {
            //没有找到合适的点，自我销毁
            this.node.destroy();
            return;
        }

        this.lbContent.string = str;

        var delayAction = cc.delayTime(0.8);
        var moveByAction = cc.moveBy(0.8, cc.v2(0, 150));
        var fadeAction = cc.fadeOut(0.8);
        var seqAction;
        if (cb) {
            seqAction = cc.sequence(delayAction, moveByAction, delayAction, fadeAction,
                cc.callFunc(cb), cc.removeSelf(true));
        } else {
            seqAction = cc.sequence(delayAction, moveByAction, delayAction, fadeAction, cc.removeSelf(true));
        }

        this.node.runAction(seqAction);
    }

    // update (dt) {},
});
