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
        fireLevel: 0,
        bulletPrefab: cc.Prefab,
        bulletGroup: cc.Node,

        spPlane: cc.Sprite,
        imgNormalPlane: cc.SpriteFrame,
        imgSuperPlane: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        this.refreshModel();

        this.bulletPool = new cc.NodePool();

        this.fireTime = 0;
        this.fireIndex = 0;

        this.schedule(this.changeWeaponLevel, 5);
    },

    changeWeaponLevel: function () {
        this.fireLevel++;
        if (this.fireLevel > 3) {
            this.fireLevel = 0;
        }

        this.fireTime = 0;
        this.fireIndex = 0;
    },

    update: function(dt) {
        this.fireUpdate(dt)
    },

    fireUpdate: function (dt) {
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

    //每100ms触发一次，1s中最大发送几次根据武器等级来
    fireBullet: function () {
        //单个子弹射击(基本射击)
        var playerPos = this.node.position;
        var bulletY = playerPos.y + 20;
        var bullet = this.getBullet();
        bullet.getComponent("FightBullet").initInfo(0, 20, 0, 1, this, this.weaponLevel);
        bullet.position = cc.v2(playerPos.x, bulletY);

        var bulletLeft = null;
        var bulletRight = null;

        if (this.fireLevel === 0) {
        } else if (this.fireLevel === 1) {
            //多排弹射击
            var sp = 20;
            bulletLeft = this.getBullet(this.bulletGroup);
            bulletLeft.getComponent("FightBullet").initInfo(0, 20, 0, 1, this, this.weaponLevel);
            bulletLeft.setPosition(playerPos.x - sp, bulletY);

            bulletRight = this.getBullet(this.bulletGroup);
            bulletRight.getComponent("FightBullet").initInfo(0, 20, 0, 1, this, this.weaponLevel);
            bulletRight.setPosition(playerPos.x + sp, bulletY);
        } else if (this.fireLevel >= 2) {
            //分叉射击
            var rotaSp = 10;
            bulletLeft = this.getBullet(this.bulletGroup);
            bulletLeft.getComponent("FightBullet").initInfo(-rotaSp, 20, 0, 1, this, this.weaponLevel);
            bulletLeft.setPosition(playerPos.x, bulletY);
            bulletLeft.angle = -rotaSp;

            bulletRight = this.getBullet(this.bulletGroup);
            bulletRight.getComponent("FightBullet").initInfo(rotaSp, 20, 0, 1, this, this.weaponLevel);
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

    getBullet: function () {
        var bullet = null;
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get();
        } else {
            bullet = cc.instantiate(this.bulletPrefab);
        }

        bullet.parent = this.bulletGroup;

        return bullet;
    },

    putBullet: function (bulletNode) {
        this.bulletPool.put(bulletNode);
    },

    refreshModel: function () {
        // if (playerData.isUsedSuperWeapon()) {
        //     this.spPlane.spriteFrame = this.imgSuperPlane;
        // } else {
        //     this.spPlane.spriteFrame = this.imgNormalPlane;
        // }

        var weapon = playerData.getCurrentWeapon();
        if (weapon) {
            this.spPlane.spriteFrame = this.imgSuperPlane;

            this.weaponLevel = playerData.getWeaponLevel(weapon);
        } else {
            this.spPlane.spriteFrame = this.imgNormalPlane;

            this.weaponLevel = 0;
        }
    },

    /**
     * 模拟穿上装备
     * @param itemInfo
     */
    equipWeapon: function (itemInfo) {
        if (itemInfo) {
            this.spPlane.spriteFrame = this.imgSuperPlane;

            this.weaponLevel = playerData.getWeaponLevel(itemInfo);
        } else {
            this.spPlane.spriteFrame = this.imgNormalPlane;
        }
    }
});
