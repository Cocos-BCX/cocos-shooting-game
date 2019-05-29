// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var bcxAdapter = require("bcxAdapter");

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
        edtPrivateKey: cc.EditBox
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        cc.gameSpace.showLoading(cc.gameSpace.text.logining+'...');

        var _this = this;
        bcxAdapter.login(privateKey, function (err) {
            if (err) {
                cc.gameSpace.showTips(err);
                cc.gameSpace.hideLoading();
            } else {
                cc.gameSpace.showLoading(cc.gameSpace.text.loading_main+'...');

                //_this.onBtnCloseClick();

                //加载玩家数据
                _this.loginScene.loadPlayerInfo();
            }
        });
    },

    show: function (scene) {
        this.loginScene = scene;
        cc.gameSpace.hideLoading();
    },

    onBtnLoginClick: function () {
        // var privateKey = this.edtPrivateKey.string;
        // if (privateKey === '') {
        //     cc.gameSpace.showTips(cc.gameSpace.text.privatekey_null);
        //     return;
        // }

        // cc.gameSpace.showLoading(cc.gameSpace.text.logining+'...');

        // var _this = this;
        // bcxAdapter.loginWithPrivateKey(privateKey, function (err, result) {
        //     if (err) {
        //         cc.gameSpace.showTips(err);
        //         cc.gameSpace.hideLoading();
        //     } else {
        //         cc.gameSpace.showLoading(cc.gameSpace.text.loading_main+'...');

        //         _this.onBtnCloseClick();

        //         //加载玩家数据
        //         _this.loginScene.loadPlayerInfo();
        //     }
        // });
    },

    onBtnCloseClick: function () {
        this.node.destroy();
    }

    // update (dt) {},
});
