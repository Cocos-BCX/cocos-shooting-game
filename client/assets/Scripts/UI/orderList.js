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
const i18n = require('LanguageData');
var bcxAdapter = require('bcxAdapter');

cc.Class({
    extends: cc.Component,

    properties: {
        inviteGridView: {
            default: null,
            type: gridView
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

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
        node.getComponent('orderItem').show(this, index, content);
    },

    refreshList: function() {
        //获取账号下的出售单
        // bcxAdapter.queryAccountGameItemOrders(function (err, res) {
        //     //根据返回的订单查询道具信息
        //     if (playerData.goodsSelling.length > 0) {
        //         var arrItemId = [];
        //         for (var idxSell = 0; idxSell < playerData.goodsSelling.length; idxSell++) {
        //             var itemSell = playerData.goodsSelling[idxSell];
        //             arrItemId.push(itemSell.id);
        //         }

        //         _this.arrSelling = [];
        //         bcxAdapter.queryGameItemInfo(arrItemId, function (err, res) {
        //             if (err) {
        //                 cc.gameSpace.showTips(err);
        //                 console.error(res);
        //                 return;
        //             }

        //             _this.arrSelling = res.data;

        //             if (_this.isAllBack) {
        //                 _this.afterGetData();
        //             } else {
        //                 _this.isAllBack = true;
        //             }
        //         });
        //     } else {
        //         cc.log("-queryAccountGameItemOrders-")
        //         _this.arrSelling = [];

        //         if (_this.isAllBack) {
        //             _this.afterGetData();
        //         } else {
        //             _this.isAllBack = true;
        //         }
        //     }

        // });

        let self = this

        bcxAdapter.queryAccountGameItemOrders(function (err, res) {
            self.afterGetData(res);
        })
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


    afterGetData: function (res) {
        //res.data
        var arrItems = [];
        for (var idx = 0; idx < res.data.length; idx++) {
            var item = res.data[idx];
            item.info = JSON.parse(item.base_describe);

            arrItems.push(item);
        }

        this.inviteGridView.init(arrItems);
    },

    onBtnCloseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.node.destroy();
    },
});
