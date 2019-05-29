// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var playerData = require("playerData");
var constants = require("constants");
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
        spBoss: cc.Sprite,

        arrImgBoss: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function() {
    },
    
    initInfo: function (level, fightScene) {
        this.level = level;
        this.fightScene = fightScene;
        this.maxHp = [100, 200, 300];

        this.node.opacity = 255;

        var img = this.arrImgBoss[this.level - 1];
        this.hp = this.maxHp[this.level - 1];

        this.spBoss.spriteFrame = img;
        this.node.position = cc.v2(0, cc.winSize.height / 2 + img.getOriginalSize().height);

        this.node.getComponent(cc.BoxCollider).size = cc.size(img.getOriginalSize());
        this.show();

        cc.gameSpace.audioManager.playSound("bossComing", false);
    },

    show: function () {
        var moveAction = cc.moveTo(3, cc.v2(0, cc.winSize.height / 2 - 100));

        var seqAction = cc.sequence(moveAction, cc.callFunc(function () {
            this.startFire();
        }, this));

        this.node.runAction(seqAction);
    },

    getRotation: function(curPos,targetPos) {
        var atanValue = Math.atan2(curPos.y - targetPos.y, curPos.x - targetPos.x);
        return (270 - atanValue * 180 / Math.PI) % 360;
    },

    startFire: function () {
        this.schedule(this.createCandy, 5);

        if (this.level === 1) {
            this.schedule(this.fire1, 2);
        } else if (this.level === 2) {
            this.schedule(this.fire2, 2);
        } else if (this.level === 3) {
            this.schedule(this.fire1, 2);
            this.scheduleOnce(this.fire3, 3);
        }
    },

    createCandy: function () {
        for(let i = 0; i < 5; i++){
            if(this.fightScene.allCandyNum >= playerData.info.candy){
                break;
            }

            var item = this.fightScene.getItem();
            var itemScript = item.getComponent("FightItem");
            var worldPos = cc.v2(i*120 + 50, cc.winSize.height / 2 + this.node.position.y);
            itemScript.initInfo(constants.ITEM_TYPE.CANDY, worldPos, this.fightScene);
        }
    },

    fire1: function () {
        if (this.fightScene.gameStageOver) {
            this.unscheduleAllCallbacks();
            return;
        }

        var bossPos = this.node.position;
        for (var i = 0; i < 20; i++) {
            var bulletY = bossPos.y - this.node.height / 2;
            var bullet = this.fightScene.getBullet();
            var bulletScript = bullet.getComponent("FightBullet");
            bulletScript.initInfo(0, 10, 1, 0, this.fightScene);
            bullet.position = cc.v2(i * 64 - cc.winSize.width / 2, bulletY);
            bulletScript.rota = this.getRotation(bullet.position, this.fightScene.player.position);
        }
    },

    fire2: function () {
        if (this.fightScene.gameStageOver) {
            this.unscheduleAllCallbacks();
            return;
        }

        var bullet = null;
        var bulletScript = null;
        var bossPos = this.node.position;
        for(let i = 0 ; i < 10; i++){
            bullet = this.fightScene.getBullet();
            bulletScript = bullet.getComponent("FightBullet");
            bulletScript.initInfo(0,10,1,0, this.fightScene);
            bullet.position = cc.v2(0,bossPos.y - this.node.height / 2);
            bulletScript.rota = 180 + i*14;

            bullet = this.fightScene.getBullet();
            bulletScript = bullet.getComponent("FightBullet");
            bulletScript.initInfo(0,10,1,0,this.fightScene);
            bullet.position = cc.v2(0, bossPos.y - this.node.height / 2);
            bulletScript.rota = 180 - i*14;
        }
    },

    fire3: function () {
        if (this.fightScene.gameStageOver) {
            this.unscheduleAllCallbacks();
            return;
        }

        this.schedule(this.fire2, 2);
    },

    loseHP: function (damage) {
        if (this.hp <= 0) {
            return;
        }

        this.playHitEffect();

        this.hp -= damage;
        if (this.hp <= 0) {
            var seqAction = cc.sequence(cc.fadeOut(2), cc.delayTime(0.5), cc.callFunc(this.bossDie, this));
            this.node.runAction(seqAction);
        }
    },

    bossDie: function () {
        cc.gameSpace.audioManager.playSound("bossDie", false);
        this.unscheduleAllCallbacks();
        this.fightScene.onBossKilled(this.node);
    },

    onCollisionEnter: function (other, self) {
        if (other.node.group === "playerBullet") {
            //被玩家子弹打中
            var bullet = other.getComponent("FightBullet");
            bullet.recover(); //子弹消失回收

            //自己扣血
            this.loseHP(1);
        }
    },

    playHitEffect: function () {
        if (this.isPlayingHitEffect) {
            return;
        }

        this.isPlayingHitEffect = true;

        var effectName = 'damage3';
        var nodeEffect = this.hitEffect;
        var randomScale = Math.ceil(Math.random()*4)*0.5 + 1.5;
        var randomPos = cc.v2(_.random(-this.node.width/4, this.node.width/4), _.random(0, this.node.height/2));

        if (!nodeEffect) {
            resourceUtil.createEffect(effectName, this.node, function (err, node) {
                if (err) {
                    this.isPlayingHitEffect = false;
                    return;
                }

                node.setScale(randomScale);
                node.position = randomPos;
                this.hitEffect = node;
                resourceUtil.playEffect(node, function () {
                    node.active = false;
                    this.isPlayingHitEffect = false;
                }, this);
            }, this);
        } else {
            nodeEffect.active = true;
            nodeEffect.setScale(randomScale);
            nodeEffect.position = randomPos;
            resourceUtil.playEffect(nodeEffect, function () {
                nodeEffect.active = false;
                this.isPlayingHitEffect = false;
            }, this);
        }
    }

    // update (dt) {},
});
