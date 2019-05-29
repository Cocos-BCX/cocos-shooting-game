// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var resourceUtil = require("resourceUtil");

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
        arrImg: [cc.SpriteFrame],

        type: {default: 0},
        scale: {default: 0.6},
        maxHp: {default: 3},
        hp: {default: 1},
        fireInterval: {default: 1000},
        speed: {default: 3},

        imgSprite: cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    initInfo: function (fightScene) {
        // this.type = type;
        this.fightScene = fightScene;
        // var arrSpriteFrame = [];
        // switch (type) {
        //     case 0:
        //         arrSpriteFrame = this.arrSmallImg;
        //         this.speed = 3;
        //         break;
        //     case 1:
        //         arrSpriteFrame = this.arrMediumImg;
        //         this.speed = 2;
        //         break;
        //     case 2:
        //         arrSpriteFrame = this.arrBigImg;
        //         this.speed = 1;
        //         break;
        // }

        this.imgSprite.spriteFrame = this.arrImg[Math.floor(Math.random() * this.arrImg.length)];
        this.node.scale = this.scale;

        var originSize = this.imgSprite.spriteFrame.getOriginalSize();
        var width = originSize.width*this.node.scale;
        var x = Math.random()*(cc.winSize.width - width + 1) + width / 2;
        var y = cc.winSize.height + originSize.height * this.node.scale;
        this.node.position = this.node.parent.convertToNodeSpaceAR(cc.v2(x, y));

        this.hp = this.maxHp*this.fightScene.level;

        this.schedule(this.fire, 4/this.fightScene.level);

    },

    update: function(dt) {
        if (window.isPauseFight) {
            return;
        }

        this.move();
    },

    move: function () {
        var pos = this.node.convertToWorldSpace(cc.v2(0, 0));
        if (this.type == 2 && pos.y < cc.winSize.height - this.node.height) {
            return;
        }

        this.node.y = this.node.position.y - 2;
        if (pos.y <= -this.node.height) {
            //回收
            this.recover();
        }
    },

    recover: function () {
        this.node.removeFromParent();
        this.node.active = true;
        this.unscheduleAllCallbacks();
        this.fightScene.putEnemy(this.node);
    },

    clear: function () {
        if (this.hitEffect) {
            this.hitEffect.getComponent(cc.Animation).stop();
        }

        if (this.missileEffect) {
            this.missileEffect.getComponent(cc.Animation).stop();
        }
    },

    playHitEffect: function (isMissile) {
        if (this.isPlayingHitEffect) {
            return;
        }

        this.isPlayingHitEffect = true;

        var effectName = 'hit';
        var nodeEffect = this.hitEffect;
        if (isMissile) {
            effectName = 'missile';
            nodeEffect = this.missileEffect;
        }

        if (!nodeEffect) {
            resourceUtil.createEffect(effectName, this.node, function (err, node) {
                if (err) {
                    this.isPlayingHitEffect = false;
                    return;
                }

                if (!isMissile) {
                    this.hitEffect = node;
                } else {
                    this.missileEffect = node;
                }

                resourceUtil.playEffect(node, function () {
                    node.active = false;
                    this.isPlayingHitEffect = false;
                }, this);
            }, this);
        } else {
            nodeEffect.active = true;
            resourceUtil.playEffect(nodeEffect, function () {
                nodeEffect.active = false;
                this.isPlayingHitEffect = false;
            }, this);
        }
    },

    playDieEffect: function (callback) {
        cc.gameSpace.audioManager.playSound("dieSound", false);

        resourceUtil.createEffect("die2", this.fightScene.effectGroup, function (err, node) {
            if (err) {
                return;
            }

            node.position = this.node.position;

            resourceUtil.playEffect(node, callback, this, true);
        }, this);
    },

    getRotation: function(curPos,targetPos) {
        var atanValue = Math.atan2(curPos.y - targetPos.y, curPos.x - targetPos.x);
        return (270 - atanValue * 180 / Math.PI) % 360;
    },

    fire: function () {
        var pos = this.node.position;
        if (pos.y < 0 || this.fightScene.gameStageOver) {
            return;
        }

        var bullet = this.fightScene.getBullet();
        var bulletScript = bullet.getComponent("FightBullet");
        bulletScript.initInfo(0, 10, 1, 0, this.fightScene);
        bullet.position = this.node.position;
        bulletScript.rota = this.getRotation(bullet.position, this.fightScene.player.position);
    },

    loseHP: function (damage, isMissile) {
        this.hp -= damage;
        this.playHitEffect(isMissile);
        if (this.hp <= 0) {
            //通知主场景加分
            var worldPos = this.node.convertToWorldSpace(cc.v2(0, 0));
            this.fightScene.onEnemyKilled(this.type, worldPos);

            this.node.active = false;

            this.playDieEffect(this.recover);
        }
    },

    onCollisionEnter: function (other, self) {
        if (other.node.group === "playerBullet") {
            //被玩家子弹打中
            var bullet = other.getComponent("FightBullet");
            bullet.recover(); //子弹消失回收

            //自己扣血
            this.loseHP(1, bullet.fireType);
        } else if (other.node.group === "player") {
            this.loseHP(this.hp, 0);
        }
    }
});
