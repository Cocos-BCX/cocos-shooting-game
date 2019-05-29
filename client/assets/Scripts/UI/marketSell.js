// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var resourceUtil = require('resourceUtil');
var bcxAdapter = require("bcxAdapter");
var constants = require('constants');
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

        spFrame: cc.Sprite,
        spFront: cc.Sprite,

        spItem: cc.Sprite,
        lbName: cc.Label,
        edtPrice: cc.EditBox,
        edtTime: cc.EditBox,
        edtMemo: cc.EditBox,
        lbFee: cc.Label,

        imgWeapon: cc.SpriteFrame,
        imgBomb: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },
    
    show: function (content, parent) {
        this.content = content;
        this.parent = parent;
        var color = 'white';
        var _this = this;
        switch (content.info.type) {
            case constants.BOMB_KEY:
                this.spItem.spriteFrame = this.imgBomb;
                this.lbName.string = "炸弹";
                this.spItem.node.width = 128;
                this.spItem.node.height = 164;
                break;
            case constants.WEAPON_KEY:
                this.spItem.spriteFrame = this.imgWeapon;
                this.spItem.node.width = 232;
                this.spItem.node.height = 232;

                var level = playerData.getWeaponLevel(content);
                this.lbName.string = "武器+" + level;

                switch (level) {
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
                break;
            case constants.PILOT:
                resourceUtil.getPilotIcon(content.info["icon"], function (err, spriteFrame) {
                    if (!err && cc.isValid(_this.spItem)) {
                        _this.spItem.spriteFrame = spriteFrame;
                        _this.spItem.node.width = 454;
                        _this.spItem.node.height = 417;

                    }
                });

                this.lbName.string = content.info["name"];

                switch (content.info['quality']) {
                    case constants.QUALITY.WHITE:
                        color = 'white';
                        break;
                    case constants.QUALITY.GREEN:
                        color = 'green';
                        break;
                    case constants.QUALITY.GREEN_1:
                        color = 'green';
                        break;
                    case constants.QUALITY.GREEN_2:
                        color = 'green';
                        break;
                    case constants.QUALITY.BLUE:
                        color = 'blue';
                        break;
                    case constants.QUALITY.PURPLE:
                        color = 'purple';
                        break;
                    case constants.QUALITY.GOLD:
                        color = 'gold';
                        break;
                }
                break;
        }

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
    },

    onEdtTimeChange: function () {
        var time = Number(this.edtTime.string);
        if (time > 0) {
            time *= 3600;
            var fee = 1;
            if (time > 3600) {
                fee = 1 + Math.ceil(time / 3600) * 0.5;
            }

            this.lbFee.string = fee.toFixed(1);
        }
    },
    
    onBtnSellClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        var price = Number(this.edtPrice.string);
        if (price <= 0 || !price) {
            cc.gameSpace.showTips(cc.gameSpace.text.prive_error);
            return;
        }
        
        var time = Number(this.edtTime.string);
        if (time <= 0 || !time) {
            cc.gameSpace.showTips(cc.gameSpace.text.time_expiration_error);
            return;
        }

        if (time > 72) {
            cc.gameSpace.showTips(cc.gameSpace.text.time_max);
            return;
        }

        time *= 3600;
        var fee = 1;
        if (time > 3600) {
            fee = 1 + Math.ceil(time / 3600) * 0.5;
        }

        cc.gameSpace.showLoading(cc.gameSpace.text.in_the_list+'...');
        var _this = this;
        bcxAdapter.creatGameItemOrder(this.content.id, price, time, fee, this.edtMemo.string, function (err, res) {
            cc.gameSpace.hideLoading();
            if (err) {
                cc.gameSpace.showTips(err);
                return;
            }

            cc.gameSpace.showTips(cc.gameSpace.text.success_list);

            _this.onBtnCloseClick();
            _this.parent.refreshList();
        });
    },
    
    onBtnCloseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.node.destroy();
    }

    // update (dt) {},
});
