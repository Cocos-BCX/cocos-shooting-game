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
        speed: 0,

        imgSprite: cc.Sprite,
        arrBigMapObj: [cc.SpriteFrame],
        arrLowMapObj: [cc.SpriteFrame],
        arrLine: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    setFightScene: function (objScript) {
        this.fightScene = objScript; //主要用于放回对象池使用
    },
    
    initInfo: function (type, speed, isFirst) {
        this.speed = speed;

        //选取最合适的图片
        var scale = 1;
        var arrSpriteFrame = null;
        switch (type) {
            case "Low":
                arrSpriteFrame = this.arrLowMapObj;
                break;
            case "Big":
                arrSpriteFrame = this.arrBigMapObj;
                scale = Math.random()*0.5 + 0.3;
                break;
            case "Line":
                arrSpriteFrame = this.arrLine;
                break;
        }

        var randId = Math.floor(Math.random() * arrSpriteFrame.length);

        this.imgSprite.spriteFrame = arrSpriteFrame[randId];
        this.node.scale = scale;


        var randomX = Math.random() * cc.winSize.width;
        var y = cc.winSize.height + this.imgSprite.spriteFrame.getOriginalSize().height * scale;
        this.node.position = this.node.parent.convertToNodeSpaceAR(cc.v2(randomX, y));
    },

    update: function(dt) {
        if (window.isPauseFight) {
            return;
        }

        this.node.y = this.node.position.y - this.speed;

        var pos = this.node.convertToWorldSpace(cc.v2(0, 0));
        if (pos.y < - this.node.height) {
            this.recover();
        }
    },

    recover: function () {
        this.node.removeFromParent();
        this.fightScene.putMapObj(this.node);
    }
});
