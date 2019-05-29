// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

// var TAG_MOVE_ACTION = 10001;   //移动动作
var constants = require("constants");
var resourceUtil = require("resourceUtil");
var playerData = require("playerData");

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

        speed: 15,
        hp: 1,
        followBulletNum: 1,
        fireLevel: 0,

        shieldNode: cc.Node,

        spPlane: cc.Sprite,
        imgSuperPlane: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        // this.hp = 100;
        this.playFlyAni(cc.v2(this.node.position.x, -150), 0, true);

        cc.gameSpace.audioManager.playSound("startGameSound", false);

        this.fireTime = 0;
        this.fireIndex = 0;

        //检查是否使用超级武器
        var weapon = playerData.getCurrentWeapon();
        if (weapon) {
            this.spPlane.spriteFrame = this.imgSuperPlane;

            this.weaponLevel = playerData.getWeaponLevel(weapon);

            this.fireLevel = 2;
        } else {
            this.weaponLevel = 0;
        }

        var currentPilot = playerData.getCurrentPilot();
        if (currentPilot) {
            var itemData = JSON.parse(currentPilot.base_describe);
            var addHp = 0;
            switch (itemData['quality']) {
                case constants.QUALITY.WHITE:
                    addHp = 1;
                    break;
                case constants.QUALITY.GREEN:
                    addHp = 2;
                    break;
                case constants.QUALITY.GREEN_1:
                    addHp = 3;
                    break;
                case constants.QUALITY.GREEN_2:
                    addHp = 4;
                    break;
                case constants.QUALITY.BLUE:
                    addHp = 5;
                    break;
                case constants.QUALITY.PURPLE:
                    addHp = 6;
                    break;
                case constants.QUALITY.GOLD:
                    addHp = 7;
                    break;
            }

            this.hp += addHp;
        }
    },

    playFlyAni: function (targetPos, keepTime, isPauseFire, callback) {
        if (typeof (keepTime) === "undefined") {
            keepTime = 0;
        }

        if (this.node.active) {
            if (isPauseFire) {
                this.unschedule(this.fireBulletNum);

                this.isPauseFire = true;
            }

            this.isAutoFlyFinished = false;
            // this.sprintNode.active = true;
            var moveAction = cc.moveTo(1, targetPos).easing(cc.easeOut(3.0));
            var moveToCenter = cc.moveTo(1, 0, -400);
            var seqAction = cc.sequence(moveAction, cc.delayTime(keepTime), cc.callFunc(function () {
                // this.sprintNode.active = false;
            }, this), moveToCenter, cc.callFunc(function () {
                this.isAutoFlyFinished = true;

                if (isPauseFire) {
                    this.schedule(this.fireBulletNum, 1);
                }

                this.isPauseFire = false;

                if (callback) {
                    callback.apply(this);
                }
            }, this));

            this.node.runAction(seqAction);
        } else {
            if (callback) {
                callback.apply(this);
            }
        }


    },

    setFightScene: function (objScript) {
        this.fightScene = objScript;
    },

    moveToPos: function (pos) {
        if (this.isAutoFlyFinished) {
            this.targetPos = pos;
        }
    },

    fireUpdate: function (dt) {
        if (this.isPauseFire) {
            return;
        }

        //攻击相关，为保证稳定按频率进行设计
        this.fireTime += dt;
        var maxNum = 2;
        if(this.fireLevel >2) {
            maxNum = this.fireLevel;
        }
        var ratio = 1.0 / (maxNum + 1);
        var fireIndex = Math.ceil(this.fireTime / ratio);
        if (fireIndex !== this.fireIndex) {
            this.fireIndex = fireIndex;

            this.fireBullet();
        }
    },

    moveUpdate: function () {
        //移动相关
        if (this.targetPos) {
            var pos = this.node.position;
            var posTarget = this.targetPos;
            //超出屏幕右边界
            if (pos.x > (cc.winSize.width - this.node.width) / 2 && posTarget.x > (cc.winSize.width - this.node.width) / 2) {
                this.node.x = (cc.winSize.width - this.node.width) / 2 + 1;
                return;
            }

            //超出屏幕左边界
            if (pos.x < (-cc.winSize.width + this.node.width) / 2 && posTarget.x < (-cc.winSize.width + this.node.width) / 2) {
                this.node.x = (-cc.winSize.width + this.node.width) / 2 - 1;
                return;
            }

            //超出上边界
            if (pos.y > (cc.winSize.height - this.node.height) / 2 && posTarget.y > (cc.winSize.height - this.node.height) / 2) {
                this.node.y = (cc.winSize.height - this.node.height) / 2 + 1;
                return;
            }

            if (Math.abs(posTarget.x - pos.x) < this.speed && Math.abs(posTarget.y - pos.y) < this.speed) {
                this.node.position = this.targetPos;
                return;
            }

            // var distance = this.targetPos.sub(pos).mag();
            // if (distance < this.speed) {
            //     this.node.position = this.targetPos;
            //     return;
            // }

            pos.x += this.speed * Math.cos(Math.atan2(this.targetPos.y - pos.y,this.targetPos.x - pos.x));
            pos.y += this.speed * Math.sin(Math.atan2(this.targetPos.y - pos.y,this.targetPos.x - pos.x));

            this.node.position = pos;
        }
    },

    update : function(dt) {
        if (window.isPauseFight) {
            return;
        }

        if(this.hp <= 0){
            return;
        }

        this.fireUpdate(dt);

        this.moveUpdate();
    },

    //每1s发射一枚导弹
    fireBulletNum: function () {
        if(this.hp <= 0)
            return;

        var playerPos = this.node.position;
        var bulletY = playerPos.y + 20;
        // 跟踪子弹
        for(let i = 0; i < this.followBulletNum; i++){
            var bullet = this.fightScene.getBullet();
            bullet.getComponent("FightBullet").initInfo((i - (this.followBulletNum - 1)/2)*20, 10, 1, 1, this.fightScene, this.weaponLevel);
            bullet.position = cc.v2(playerPos.x, bulletY);
        }
    },

    //每100ms触发一次，1s中最大发送几次根据武器等级来
    fireBullet: function () {
        if(this.hp <= 0){
            return;
        }

        //单个子弹射击(基本射击)
        var playerPos = this.node.position;
        var bulletY = playerPos.y + 20;
        var bullet = this.fightScene.getBullet();
        bullet.getComponent("FightBullet").initInfo(0, 20, 0, 1, this.fightScene, this.weaponLevel);
        bullet.position = cc.v2(playerPos.x, bulletY);

        var bulletLeft = null;
        var bulletRight = null;

        if (this.fireLevel === 0) {
            cc.gameSpace.audioManager.playSound("attack02", false);
        } else if (this.fireLevel === 1) {
            cc.gameSpace.audioManager.playSound("attack02", false);
            //多排弹射击
            var sp = 20;
            bulletLeft = this.fightScene.getBullet(this.fightScene.bulletGroup);
            bulletLeft.getComponent("FightBullet").initInfo(0, 20, 0, 1, this.fightScene, this.weaponLevel);
            bulletLeft.setPosition(playerPos.x - sp, bulletY);

            bulletRight = this.fightScene.getBullet(this.fightScene.bulletGroup);
            bulletRight.getComponent("FightBullet").initInfo(0, 20, 0, 1, this.fightScene, this.weaponLevel);
            bulletRight.setPosition(playerPos.x + sp, bulletY);
        } else if (this.fireLevel >= 2) {
            cc.gameSpace.audioManager.playSound("attack02", false);
            //分叉射击
            var rotaSp = 10;
            bulletLeft = this.fightScene.getBullet(this.fightScene.bulletGroup);
            bulletLeft.getComponent("FightBullet").initInfo(-rotaSp, 20, 0, 1, this.fightScene, this.weaponLevel);
            bulletLeft.setPosition(playerPos.x, bulletY);
            bulletLeft.angle = -rotaSp;

            bulletRight = this.fightScene.getBullet(this.fightScene.bulletGroup);
            bulletRight.getComponent("FightBullet").initInfo(rotaSp, 20, 0, 1, this.fightScene, this.weaponLevel);
            bulletRight.setPosition(playerPos.x, bulletY);
            bulletRight.angle = rotaSp;
        }

        // this.fireIndex ++;
        // var maxNum = 2;
        // if(this.fireLevel >2) {
        //     maxNum = this.fireLevel;
        // }
        // if(this.fireIndex > maxNum){
        //     this.unschedule(this.fireBullet);
        // }
    },

    onCollisionEnter: function (other, self) {
        if (other.node.group === "bullet") {
            //敌方子弹
            this.loseHP(1);

            other.node.getComponent("FightBullet").recover();
        } else if (other.node.group === "enemy") {
            this.loseHP(this.hp);
        } else if (other.node.group === "item") {
            //捡到物品了
            var item = other.node.getComponent("FightItem");
            this.pickupItem(item.type);

            //物品消失回收掉
            item.recover();
        }

        // console.log(other);
        // console.log();
    },

    playGetItemEffect: function () {
        cc.gameSpace.audioManager.playSound("pickup", false);

        if (this.isPlayingItemEffect) {
            return;
        }

        this.isPlayingItemEffect = true;
        if (!this.itemEffect) {
            resourceUtil.createEffect("collect", this.node, function (err, node) {
                if (err) {
                    this.isPlayingItemEffect = false;
                    return;
                }

                this.itemEffect = node;
                resourceUtil.playEffect(node, function () {
                    this.itemEffect.active = false;
                    this.isPlayingItemEffect = false;
                }, this);
            }, this);
        } else {
            this.itemEffect.active = true;
            resourceUtil.playEffect(this.itemEffect, function () {
                this.itemEffect.active = false;
                this.isPlayingItemEffect = false;
            }, this);
        }

    },

    playDieEffect: function (callback) {
        cc.gameSpace.audioManager.playSound("playerDie", false);

        resourceUtil.createEffect("die1", this.fightScene.effectGroup, function (err, node) {
            if (err) {
                return;
            }

            node.position = this.node.position;

            resourceUtil.playEffect(node, callback, this, true);
        }, this);
    },

    pickupItem: function (type) {
        //播放特效
        this.playGetItemEffect();

        switch (type) {
            case constants.ITEM_TYPE.BULLET_LEVEL:
                this.bulletLevel();
                break;
            case constants.ITEM_TYPE.FOLLOW_NUM:
                this.followNum();
                break;
            case constants.ITEM_TYPE.BGold:
                this.getBGold();
                break;
            case constants.ITEM_TYPE.CANDY:
                this.getCandy();
                break;
            case constants.ITEM_TYPE.LIFE_UP:
                this.lifeUp();
                break;
            case constants.ITEM_TYPE.BOMB:
                this.pickBomb();
                break;
        }
    },

    pickBomb: function () {
        //炸弹应直接在内存中控制，最后结算时在做道具创建
        this.fightScene.onPickupBomb();
    },

    lifeUp: function () {
        this.hp ++;
        this.fightScene.node.emit(constants.FIGHT_EVENT.UPDATE_LIFE, {
            value: this.hp
        });
    },

    bulletLevel: function () {
        if (this.fireLevel < 10) {
            this.fireLevel ++;

            this.fireTime = 0;
            this.fireIndex = 0;
        }
    },

    followNum: function () {
        if (this.followBulletNum < 5) {
            this.followBulletNum++;
        }
    },

    getBGold: function () {
        //todo 货币逻辑后续补充
    },

    getCandy: function () {
        this.fightScene.addCandy();
    },

    loseHP: function (damage) {
        if (this.shieldNode.active) { //开着护盾无敌着呢
            return;
        }

        if (this.hp <= 0) {
            return;//已经死掉了，不需要再进入
        }

        this.fightScene.playDamageEffect();
        this.hp -= damage;

        if (this.hp <= 0) {
            this.hp = 0;
            this.onKilled();
        }

        this.fightScene.node.emit(constants.FIGHT_EVENT.UPDATE_LIFE, {
            value: this.hp
        });
    },

    onKilled: function () {
        //gameOver
        this.node.active = false;

        this.playDieEffect(function () {
            this.fightScene.pause();

            // cc.director.getScheduler().setTimeScale(0);

            //展示gameover界面
            this.fightScene.onPlayerKilled();
        });
    },

    reLife: function () {
        this.hp = 1;
        this.node.active = true;

        this.shieldNode.active = true;
        this.node.position = cc.v2(0, -cc.winSize.height/2 - 400);

        this.isAutoFlyFinished = false;
        var moveAction = cc.moveTo(1, cc.v2(0, -50)).easing(cc.easeOut(3.0));
        var seqAction = cc.sequence(moveAction, cc.callFunc(function () {
             this.isAutoFlyFinished = true;
             this.targetPos = cc.v2(0, -400);
        }, this));

        this.node.runAction(seqAction);

        this.scheduleOnce(function () {
            this.shieldNode.active = false;
        }, 4);

        // this.node.position = cc.v2(0, -400);
    }
});
