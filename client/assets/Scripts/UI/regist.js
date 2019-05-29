// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var resourceUtil = require("resourceUtil");
var bcxAdapter = require("bcxAdapter");
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

        edtAccount: cc.EditBox,
        edtPassword: cc.EditBox,
        edtPassword2: cc.EditBox,
        edtPrivateKey: cc.EditBox,

        frameReg: cc.Node,
        frameKey: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       this.setCurLanguage();
    },

    start: function() {
        bcxAdapter.logout(function () {

        });
    },

    show: function (loginScene) {
        this.loginScene = loginScene;
        cc.gameSpace.hideLoading();
    },

    onBtnCloseClick: function () {
        this.node.destroy();
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

    onBtnRegistClick: function () {
        var account = this.edtAccount.string;
        var password = this.edtPassword.string;
        var password2 = this.edtPassword2.string;

        if (account === "") {
            cc.gameSpace.showTips(cc.gameSpace.text.account_null);
            return;
        }

        if (password === "" || password2 === "") {
            cc.gameSpace.showTips(cc.gameSpace.text.password_null);
            return;
        }

        if (password !== password2) {
            cc.gameSpace.showTips(cc.gameSpace.text.password_confirm_error);
            return;
        }

        cc.gameSpace.showLoading(cc.gameSpace.text.registering+'...');

        bcxAdapter.signUp(account, password, (err, result) => {
            if (err) {
                cc.gameSpace.showTips(err);
            } else {
                // this.frameReg.active = false;
                // this.frameKey.active = true;

                // _this.privateKey = result.data["active_private_key"];
                // _this.edtPrivateKey.string = _this.privateKey;

                
                this.onBtnConfirmClick();
            }

            cc.gameSpace.hideLoading();
        });
    },

    onPrivateKeyChanged: function (text) {
        if (text !== this.privateKey) {
            this.edtPrivateKey.string = this.privateKey;
        }
    },

    onBtnConfirmClick: function () {
        this.node.destroy();

        cc.gameSpace.showLoading(cc.gameSpace.text.register_loading+'...');
        this.loginScene.loadMainScene();
    }

    // update (dt) {},
});
