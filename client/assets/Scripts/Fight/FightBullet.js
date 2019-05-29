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

        typeBullet: {
            default: 1,
            tooltip: "自己的子弹:1  敌人的子弹:0"
        },

        rota: 0,
        speed: 0,
        fireType: {
            default: 0,
            tooltip: "普通子弹:0 跟踪子弹:1"
        },

        imgPlayerBullet: cc.SpriteFrame,
        arrImgSuperBullet: [cc.SpriteFrame],
        imgEnemyBullet: cc.SpriteFrame,
        imgMissile: cc.SpriteFrame,

        spBullet: cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    initInfo: function (rota, speed, fireType, typeBullet, owner, weaponLevel) {
        this.rota = rota;
        this.speed = speed;
        this.fireType = fireType;
        this.typeBullet = typeBullet;
        this.target = null;

        var imgFrame = this.imgPlayerBullet;
        if (this.typeBullet === 1) {
            this.node.group = "playerBullet";
            if (this.fireType === 1) {
                imgFrame = this.imgMissile;
            } else if (weaponLevel) {
                //表示使用了武器，并且有等级
                imgFrame = this.arrImgSuperBullet[weaponLevel - 1];
            }
        } else {
            this.node.group = "bullet";

            imgFrame = this.imgEnemyBullet;
        }

        this.spBullet.spriteFrame = imgFrame;

        this.fightScene = owner;

        this.node.getComponent(cc.BoxCollider).size = cc.size(imgFrame.getOriginalSize());
    },

    moveByRotation: function(speed) {
        var pos = cc.v2(this.node.position);
        pos.x += speed * Math.cos((90 - this.rota) * Math.PI / 180);
        pos.y += speed * Math.sin((90 - this.rota) * Math.PI / 180);
        this.node.angle = -this.rota;
        this.node.position = pos;
    },

    getRotation: function(curPos,targetPos) {
        var atanValue = Math.atan2(curPos.y - targetPos.y, curPos.x - targetPos.x);
        return (270 - atanValue * 180 / Math.PI) % 360;
    },

    update: function(dt) {
        if (window.isPauseFight) {
            return;
        }

        if (this.typeBullet) {
            //玩家发出的子弹
            if (this.fireType === 0) {
                //普通子弹
                this.moveByRotation(this.speed);
            } else if (this.fireType === 1) {
                //追踪子弹
                if (!this.target) {
                    var enemyList = this.fightScene.enemyGroup.children;
                    var num = Math.round(Math.random() * 100 % enemyList.length);
                    this.target = enemyList[num];
                }


                if (this.target && this.target.parent && this.target.position.y < cc.winSize.height) {
                    this.rota = this.getRotation(this.node.position, this.target.position);
                } else {
                    this.rota = this.getRotation(this.node.position,
                        cc.v2(this.node.position.x, this.node.position.y + 100));
                }

                this.moveByRotation(this.speed / 2);
            }
        } else {
            //敌人发出来的子弹
            //敌机跟踪子弹
            if (this.fireType === 1) {
                this.moveByRotation(this.speed /2);
            }
        }

        var pos = this.node.convertToWorldSpace(cc.v2(0, 0));
        if (pos.x < -20 || pos.x > cc.winSize.width + 20 || pos.y < -20 || pos.y > cc.winSize.height + 20) {
            this.recover();
        }
    },

    recover: function () {
        this.node.angle = 0;
        this.target = null;
        this.node.removeFromParent();

        if (this.fightScene.isValid) {
            this.fightScene.putBullet(this.node);
        } else {
            //直接删除
            this.node.destroy();
        }
    }
});
