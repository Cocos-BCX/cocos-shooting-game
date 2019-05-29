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
        txtAdd: cc.Label,

        hpNode: cc.Node,
        spFrame: cc.Sprite,
        spFront: cc.Sprite,
        spSelect: cc.Sprite,
        nodeSelect: cc.Node,
        nodeCurrentFlag: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    setInfo: function (itemInfo, page, pilotPanel) {
        var _this = this;
        this.itemInfo = itemInfo;
        this.pilotPanel = pilotPanel;
        this.ownerPage = page;
        if (!itemInfo) {
            resourceUtil.getPilotIcon("unknown", function (err, spriteFrame) {
                if (!err && cc.isValid(_this.spHead)) {
                    _this.spHead.spriteFrame = spriteFrame;
                }
            });

            this.hpNode.active = false;
            this.nodeCurrentFlag.active = false;
            return;
        }

        var itemData = JSON.parse(itemInfo.base_describe);
        var addHp = 0;
        var color = 'white';
        switch (itemData['quality']) {
            case constants.QUALITY.WHITE:
                addHp = 1;
                color = 'white';
                break;
            case constants.QUALITY.GREEN:
                addHp = 2;
                color = 'green';
                break;
            case constants.QUALITY.GREEN_1:
                addHp = 3;
                color = 'green';
                break;
            case constants.QUALITY.GREEN_2:
                addHp = 4;
                color = 'green';
                break;
            case constants.QUALITY.BLUE:
                addHp = 5;
                color = 'blue';
                break;
            case constants.QUALITY.PURPLE:
                addHp = 6;
                color = 'purple';
                break;
            case constants.QUALITY.GOLD:
                addHp = 7;
                color = 'gold';
                break;
        }

        this.hpNode.active = true;
        this.txtAdd.string = '+' + addHp;
        // this.txtName.string = itemData["name"];


        resourceUtil.getPilotIcon(itemData["icon"], function (err, spriteFrame) {
            if (!err && cc.isValid(_this.spHead)) {
                _this.spHead.spriteFrame = spriteFrame;
            }
        });

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

        var itemId = playerData.getCurrentPilotItemId();
        this.launch(itemId === this.itemInfo.id);
    },

    launch: function (isLaunch) {
        this.nodeCurrentFlag.active = isLaunch;
    },

    select: function (isSelect) {
        this.nodeSelect.active = isSelect;
    },

    onItemClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        if (!this.itemInfo) {
            return;
        }

        this.pilotPanel.onItemSelect(this.itemInfo.id, this.ownerPage);
    }

    // update (dt) {},
});
