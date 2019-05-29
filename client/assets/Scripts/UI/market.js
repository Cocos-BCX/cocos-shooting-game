// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var gridView = require('gridView');
var bcxAdapter = require('bcxAdapter');
var playerData = require('playerData');
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

        inviteGridView: {
            default: null,
            type: gridView
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setCurLanguage();
    },

    start: function() {
        this.arrSelling = [];
    },

    onEnable: function() {
        // clientEvent.on('updateBuyTimes', this.updatePrice, this);
        this.inviteGridView.node.on('show', this.initGridView, this);

        this.refreshList();
    },

    onDisable: function() {
        this.inviteGridView.node.off('show', this.initGridView, this);
        // clientEvent.off('updateBuyTimes', this.updatePrice, this);
    },

    initGridView: function(event) {
        var index = event.index;
        var node = event.node;
        var content = event.content;
        console.log(">>>>>>>>>>>content>>>"+JSON.stringify(content))
        node.getComponent('marketItem').show(this, index, content);
    },

    refreshList: function() {
        // var contents = [];
        // var invitee = playerData.getInvitee();
        // var len = Math.floor(invitee.length / constants.INVITE_MAX) * 10 + 20;
        // for (let index = 0; index < len; index++) {
        //     let invite = playerData.getInviteByIndex(index);
        //
        //     let inviteContent = {};
        //     inviteContent.invite = invite;
        //     inviteContent.index = index;
        //     inviteContent.hasGetReward = true;
        //     if (invite) {
        //         inviteContent.hasGetReward = playerData.hasGetInviteReward(index);
        //     }
        //
        //
        //     contents.push(inviteContent);
        // }
        //
        // contents.sort(function (a, b) {
        //     if (a.hasGetReward !== b.hasGetReward) {
        //         return Number(a.hasGetReward) - Number(b.hasGetReward);
        //     }
        //
        //     return a.index - b.index;
        // });

        this.isAllBack = false;
        var _this = this;
        //获取道具列表
        bcxAdapter.getItems(function () {
            if (_this.isAllBack) {
                _this.afterGetData();
            } else {
                _this.isAllBack = true;
            }
        });

        //获取账号下的出售单
        bcxAdapter.queryAccountGameItemOrders(function (err, res) {
            //根据返回的订单查询道具信息
            if (playerData.goodsSelling.length > 0) {
                var arrItemId = [];
                for (var idxSell = 0; idxSell < playerData.goodsSelling.length; idxSell++) {
                    var itemSell = playerData.goodsSelling[idxSell];
                    arrItemId.push(itemSell.id);
                }

                _this.arrSelling = [];
                bcxAdapter.queryGameItemInfo(arrItemId, function (err, res) {
                    if (err) {
                        cc.gameSpace.showTips(err);
                        console.error(res);
                        return;
                    }

                    _this.arrSelling = res.data;

                    if (_this.isAllBack) {
                        _this.afterGetData();
                    } else {
                        _this.isAllBack = true;
                    }
                });
            } else {
                _this.arrSelling = [];

                if (_this.isAllBack) {
                    _this.afterGetData();
                } else {
                    _this.isAllBack = true;
                }
            }

        });
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


    afterGetData: function () {
        var arrItems = [];
        for (var idx = 0; idx < playerData.goods.length; idx++) {
            var item = playerData.goods[idx];
            item.info = JSON.parse(item.base_describe);

            arrItems.push(item);
        }

        for (var idxSell = 0; idxSell < this.arrSelling.length; idxSell++) {
            var itemSell = this.arrSelling[idxSell];
            itemSell.info = JSON.parse(itemSell.base_describe);
            arrItems.push(itemSell);
        }

        arrItems.sort(function (a, b) {
            if (a.info.type > b.info.type) {
                return 1;
            } else if (a.info.type === b.info.type) {
                if (a.order && !b.order) {
                    return -1;
                } else if (!a.order && b.order) {
                    return 1;
                } else {
                    return 0;
                }
            }

            return -1;
        });

        this.inviteGridView.init(arrItems);
    },

    onBtnCloseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.node.destroy();
    },
    
    onBtnMarketClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        window.open("http://gpe.famegame.com.cn");
    }

    // update (dt) {},
});
