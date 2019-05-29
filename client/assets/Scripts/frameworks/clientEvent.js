/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 */
var eventListener = require("eventListener");
var clsListener = eventListener.getBaseClass("multi");
// var i18n = require("LanguageData");

var ClientEvent = cc.Class({
    extends: clsListener,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        this._EVENT_TYPE = [
            "testEvent",
            "onAppShow",
            "onNetworkConnect",
            "hideNetLoading",
            "showNetLoading",
            "showWaiting",          //展示waiting界面
            "hideWaiting",          //隐藏waiting界面
            "showSharedDialog",      //显示单例界面
            "hideSharedDialog",     //隐藏单例弹窗
            "showTips",
            "showGetMoneyTips",
            "activeScene",          //设置场景是否可用
            "pushToPopupSeq",           //创建对话框弹出队列
            "popFromPopupSeq",            //从弹出框队列移除

            //游戏逻辑相关
            "onSomeoneJoined",          //当有人加入房间时触发
            "onSomeoneLeft",            //当某人从房间离开时触发
            "onSomeoneEmit",            //当有人广播消息时触发
            "onSomeoneBet",             //主要为更新玩家下注值
            "onSomeoneReady",           //当有人准备时触发
            "onDiceResult",             //当开奖时会触发该消息
            "updateMoney",              //更新当前钱数
            "updateRound",              //更新回合
           
            "submitShareResult",     
        ];

        this.setSupportEventList(this._EVENT_TYPE);
    },

    //TODO 应该考虑再加个事件？
    // showTipByTextKey: function (textKey) {
    //     return this.dispatchEvent("showTips", i18n.t(textKey));
    // }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});

var sharedClientEvent = new ClientEvent();
sharedClientEvent.onLoad();
module.exports = sharedClientEvent;
