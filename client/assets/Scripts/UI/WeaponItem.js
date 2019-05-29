// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var resourceUtil = require("resourceUtil");
var constants = require("constants");
var playerData = require('playerData');

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

        spHead: cc.Sprite,
        // txtName: cc.Label,
        txtLevel: cc.Label,

        spFrame: cc.Sprite,
        spFront: cc.Sprite,
        spSelect: cc.Sprite,
        nodeSelect: cc.Node,
        nodeCurrentFlag: cc.Node,

        imgWeapon: cc.SpriteFrame,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    setInfo: function (itemInfo, page, weaponPanel) {
        var _this = this;
        this.itemInfo = itemInfo;
        this.weaponPanel = weaponPanel;
        this.ownerPage = page;
        if (!itemInfo) {
            this.spHead.spriteFrame = null;
            this.txtLevel.string = '';

            this.nodeCurrentFlag.active = false;
            return;
        }

        var level = playerData.getWeaponLevel(itemInfo);
        var color = 'white';
        switch (level) {
            case 1:
                color = 'white';
                break;
            case 2:
                color = 'green';
                break;
            case 3:
                color = 'blue';
                break;
            case 4:
                color = 'purple';
                break;
            case 5:
                color = 'gold';
                break;
        }

        this.txtLevel.string = 'lv.' + level;
        this.spHead.spriteFrame = this.imgWeapon;

        resourceUtil.loadRes('Textures/Frame/' + color + '01', cc.SpriteFrame, function (err, spriteFrame) {
            if (!err && cc.isValid(_this.spFrame)) {
                _this.spFrame.spriteFrame = spriteFrame;
            }
        });

        resourceUtil.loadRes('Textures/Frame/' + color + '02', cc.SpriteFrame, function (err, spriteFrame) {
            if (!err && cc.isValid(_this.spFront)) {
                _this.spFront.spriteFrame = spriteFrame;
            }
        });

        resourceUtil.loadRes('Textures/Frame/' + color + '03', cc.SpriteFrame, function (err, spriteFrame) {
            if (!err && cc.isValid(_this.spSelect)) {
                _this.spSelect.spriteFrame = spriteFrame;
            }
        });

        var itemId = playerData.getCurrentWeaponItemId();
        this.launch(itemId === this.itemInfo.id);
    },

    launch: function (isLaunch) {
        this.nodeCurrentFlag.active = isLaunch;
    },

    select: function (isSelect) {
        this.nodeSelect.active = isSelect;
    },

    refresh: function () {
        var weaponInfo = playerData.getWeaponByItemId(this.itemInfo.id);

        this.setInfo(weaponInfo, this.ownerPage, this.weaponPanel);
    },

    onItemClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        if (!this.itemInfo) {
            return;
        }

        this.weaponPanel.onItemSelect(this.itemInfo.id, this.ownerPage);
    }

    // update (dt) {},
});
