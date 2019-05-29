// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var constants = require('constants');
var resourceUtil = require('resourceUtil');
var playerData = require('playerData');
var bcxAdapter = require('bcxAdapter');
const i18n = require('LanguageData');

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

        nodeBtnSell: cc.Node,
        nodeSelling: cc.Node,

        imgWeapon: cc.SpriteFrame,
        imgBomb: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setCurLanguage();

    },

    start: function() {

    },
    setCurLanguage:function(){
        var type = cc.sys.localStorage.getItem('language');
        if(type == 1){
            i18n.init('en');
        }else{
            i18n.init('zh');
        }

        i18n.updateSceneRenderers();

    },

    show: function (parent, index, content) {
        this.parent = parent;
        this.index = index;
        this.content = content;
        var color = 'white';
        var _this = this;

        switch (content.info.type) {
            case constants.BOMB_KEY:
                this.spItem.spriteFrame = this.imgBomb;
                this.lbName.string = cc.gameSpace.text.bomb;
                this.spItem.node.width = 64;
                this.spItem.node.height = 82;
                break;
            case constants.WEAPON_KEY:
                this.spItem.spriteFrame = this.imgWeapon;
                this.spItem.node.width = 116;
                this.spItem.node.height = 116;

                var level = playerData.getWeaponLevel(content);
                this.lbName.string =cc.gameSpace.text.weapon+"+" + level;

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
                        _this.spItem.node.width = 200;
                        _this.spItem.node.height = 184;

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

        this.nodeSelling.active = playerData.isGoodsSelling(this.content.id);
        this.nodeBtnSell.active = !this.nodeSelling.active;

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
    
    onBtnSellClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        //发起出售弹窗
        // this.parent.showSellUI(this.content);
        cc.gameSpace.uiManager.showSharedDialog('marketSell', 'marketSell', [this.content, this.parent]);
    },
    
    onBtnCancelClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        var orderId = playerData.getGoodsOrderId(this.content.id);
        if (!orderId) {
            cc.gameSpace.showTips(cc.gameSpace.text.Incorrect_data);
            this.parent.refreshList();
            return;
        }

        cc.gameSpace.showLoading(cc.gameSpace.text.cancel_sell+'....');
        var _this = this;
        bcxAdapter.cancelGameItemOrder(orderId, function (err, res) {
            cc.gameSpace.hideLoading();
            if (err) {
                cc.gameSpace.showTips(err);
                return;
            }

            cc.gameSpace.showTips(cc.gameSpace.text.cancel_success);

            _this.parent.refreshList();
        });
    }

    // update (dt) {},
});
