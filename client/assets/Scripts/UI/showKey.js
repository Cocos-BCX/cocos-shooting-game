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
       
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    onLoad: function() {
        // cc.gameSpace.showLoading(cc.gameSpace.text.getting_key);

        // var _this = this;
        // bcxAdapter.getPrivateKey(function (err, res) {
        //     if (err) {
        //         cc.gameSpace.showTips(err);
        //     } else {
        //         //获取成功，设置值
        //         _this.privateKey = res.data.active_private_key;
        //         _this.edtPrivateKey.string = _this.privateKey;
        //     }

        //     cc.gameSpace.hideLoading();
        // });
        this.setCurLanguage();
    },

    show () {
        //cc.gameSpace.hideLoading();
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

    // onPrivateKeyChanged: function (text) {
    //     if (text !== this.privateKey) {
    //         this.edtPrivateKey.string = this.privateKey;
    //     }
    // },

    onBtnConfirmClick: function () {
        this.node.destroy();
    }

    // update (dt) {},
});
