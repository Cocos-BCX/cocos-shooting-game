// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var playerData = require("playerData");
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

        txtSecond: cc.Label,
        txtCost: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        this.second = 10;
        this.refreshSecond();
        this.countDownTimer = setInterval(function (self) {
            self.countDownTime();
        }, 1000, this);
        this.setCurLanguage();
        this.txtCost.string = cc.gameSpace.text.need_to_pay+' '+ playerData.relifeCost +' '+cc.gameSpace.text.cocos_coins;
    },

    show: function (fightScene) {
        this.fightScene = fightScene;
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


    countDownTime: function () {
        this.second --;
        if (this.second < 0) {
            this.second = 0;

            this.onBtnNoClick();
        }

        this.refreshSecond();
    },

    refreshSecond: function () {
        this.txtSecond.string = this.second + " s";
    },

    clear: function () {
        this.node.destroy();
        this.clearCountDown();
    },

    clearCountDown: function () {
        if (this.countDownTimer) {
            clearInterval(this.countDownTimer);
            this.countDownTimer = null;
        }
    },

    onBtnYesClick: function () {
        if (this.isPaying) {
            return;
        }

        this.isPaying = true;
        this.clearCountDown();

        cc.gameSpace.showLoading(cc.gameSpace.text.paying+'...');
        // cc.director.getScheduler().setTimeScale(1);
        bcxAdapter.reqRelife((err, respData) => {
            this.isPaying = false;
            cc.gameSpace.hideLoading();
            if (!err) {
                //付费成功
                //复活
                this.onCompleteYes();

                this.clear();
            } else {
                cc.gameSpace.showTips(err, function () {
                    // cc.director.getScheduler().setTimeScale(0);
                });
            }
        });
    },

    onBtnNoClick: function () {
        //gameOver界面，并且提交数据
        this.clear();

        this.fightScene.showGameOver();
    },

    onCompleteYes: function () {
        //当复活请求回调时
        // cc.director.getScheduler().setTimeScale(1);
        this.fightScene.resume();
        this.fightScene.reLife();
    }

    // update (dt) {},
});
