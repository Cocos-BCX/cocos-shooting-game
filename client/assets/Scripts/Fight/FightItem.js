// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var constants = require("constants");

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

        imgBullet: cc.SpriteFrame,
        imgCandy: cc.SpriteFrame,
        imgGold: cc.SpriteFrame,
        imgFollow: cc.SpriteFrame,
        imgLifeUp: cc.SpriteFrame,
        imgBomb: cc.SpriteFrame,

        spItem: cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    initInfo: function (type, worldPos, fightScene) {
        this.fightScene = fightScene;
        this.type = type;
        this.node.angle = 0;

        this.goldIndex = 0;
        var imgFrame = null;
        switch (type) {
            case constants.ITEM_TYPE.BULLET_LEVEL:
                imgFrame = this.imgBullet;
                break;
            case constants.ITEM_TYPE.FOLLOW_NUM:
                imgFrame = this.imgFollow;
                break;
            case constants.ITEM_TYPE.BGold:
                imgFrame = this.imgGold;
                // this.goldIndex =
                break;
            case constants.ITEM_TYPE.CANDY:
                imgFrame = this.imgCandy;
                break;
            case constants.ITEM_TYPE.LIFE_UP:
                imgFrame = this.imgLifeUp;
                break;
            case constants.ITEM_TYPE.BOMB:
                imgFrame = this.imgBomb;
                break;
        }

        this.spItem.spriteFrame = imgFrame;

        this.speed = 5;
        if (type === 4) {
            this.speed = 2;
        }

        if (worldPos) {
            this.node.position = this.node.parent.convertToNodeSpaceAR(worldPos);
        } else {
            //随机坐标
            var imgWidth = imgFrame.getOriginalSize().width;
            var imgHeight = imgFrame.getOriginalSize().height;
            var posX = Math.random()*(cc.winSize.width - imgWidth + 1) + imgWidth/2;
            this.node.position = this.node.parent.convertToNodeSpaceAR(cc.v2(posX, cc.winSize.height + imgHeight));
        }

    },

    update: function(dt) {
        if (window.isPauseFight) {
            return;
        }

        this.move();
    },

    getRotation: function(curPos,targetPos) {
        var atanValue = Math.atan2(curPos.y - targetPos.y, curPos.x - targetPos.x);
        return (270 - atanValue * 180 / Math.PI) % 360;
    },

    moveByRotation: function(speed, rota) {
        var pos = cc.v2(this.node.position);
        pos.x += speed * Math.cos((90 - rota) * Math.PI / 180);
        pos.y += speed * Math.sin((90 - rota) * Math.PI / 180);
        // this.node.angle = rota;
        this.node.position = pos;
    },

    move: function () {
        if (!this.targetNode) {
            this.node.y = this.node.position.y - this.speed;

            var worldPos = this.node.convertToWorldSpace(cc.v2(0, 0));
            if (worldPos.y < -this.node.height) {
                this.recover();
            }
        } else {
            var rota = this.getRotation(this.node.position, this.targetNode.position);
            this.moveByRotation(this.speed*2, rota);
        }
    },

    //打完BOSS后所有掉落都收集回来
    flyToPlayer: function (playerNode) {
        this.targetNode = playerNode;
    },

    recover: function () {
        this.targetNode = null;

        this.unscheduleAllCallbacks();

        this.node.removeFromParent();

        this.fightScene.putItem(this.node);
    }

});
