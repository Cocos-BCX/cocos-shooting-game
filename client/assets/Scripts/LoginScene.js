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
var resourceUtil = require("resourceUtil");
var configuration = require("configuration");
var constants = require("constants");
const clientEvent = require('clientEvent');


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
        select_node:cc.Node,
        select_prefab:cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

        console.log("login----start")

        // var account = configuration.getGlobalData(constants.DATA_KEY.ACCOUNT);
        // if (account) {
        //     this.edtAccount.string = account;
        // }

        // //TODO 正式的时候需要去除这个
        // var password = configuration.getGlobalData(constants.DATA_KEY.PASSWORD);
        // if (password) {
        //     this.edtPassword.string = password;
        // }

        // console.log("==cc==",cc)
        var prefab = cc.instantiate(this.select_prefab);
        this.select_node.addChild(prefab);
      
        this.login()
    },
   
    onBtnLoginClick: function () {
        // cc.gameSpace.audioManager.playSound("click", false);

        // var account = this.edtAccount.string;
        // var password = this.edtPassword.string;

        // if (account === "") {
        //     cc.gameSpace.showTips(cc.gameSpace.text.account_null);
        //     return;
        // }

        // if (password === "") {
        //     cc.gameSpace.showTips(cc.gameSpace.text.password_null);
        //     return;
        // }

        // this.login(account, password);
    },

    /**
     * 登录接口
     * @param account
     * @param password
     */
    login: function () {
        //显示loading界面
        cc.gameSpace.showLoading(cc.gameSpace.text.logining);

        console.log("login====")
    
        var _this = this;
        if (cc.gameSpace.SDK === 'eos') {
            const eosAdapter = require('eosAdapter');
            eosAdapter.initSDK(()=>{
                cc.gameSpace.isInitFinished = true;
                eosAdapter.login(function (err) {
                    if (err) {
                        cc.gameSpace.showTips(err);
                        cc.gameSpace.hideLoading();
                    } else {
                        // configuration.setGlobalData(constants.DATA_KEY.ACCOUNT, account);
                        // configuration.setGlobalData(constants.DATA_KEY.PASSWORD, password); //TODO 正式的时候需要去除这个
    
                        cc.gameSpace.showLoading(cc.gameSpace.text.loading_main+'...');
    
                        //加载玩家数据
                        _this.loadPlayerInfo();
                    }
                });
            });
        } else {
            bcxAdapter.initSDK(()=>{
                //SDK初始华完毕
                cc.gameSpace.isInitFinished = true;
                console.log("bcxAdapter.initSDK====")
                bcxAdapter.login(function (err) {
                    console.log("bcxAdapter.initSDK=1==",err)
                    if (err) {
                        cc.gameSpace.showTips(err);
                        cc.gameSpace.hideLoading();
                    } else {
                        console.log("bcxAdapter.initSDK222")
                        // configuration.setGlobalData(constants.DATA_KEY.ACCOUNT, account);
                        // configuration.setGlobalData(constants.DATA_KEY.PASSWORD, password); //TODO 正式的时候需要去除这个
    
                        cc.gameSpace.showLoading(cc.gameSpace.text.loading_main+'...');
    
                        //加载玩家数据
                        _this.loadPlayerInfo();
                    }
                });
                
            });
        }

        
    },

    loadPlayerInfo: function () {
        //获取玩家数据
        var _this = this;
        bcxAdapter.getItems(function (err, res) {
            _this.loadMainScene();
        });
    },

    loadMainScene: function () {
        //登录成功，切换至主场景
        cc.director.preloadScene("start", function () {
            //关闭loading界面
            cc.gameSpace.hideLoading();

            cc.director.loadScene("start");
        });
    },

    onBtnRegisterClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.showLoading("loading...");

        cc.gameSpace.uiManager.showSharedDialog('regist', 'regist', [this]);
    },

    /**
     * PrivateKey登录
     */
    onBtnPrivateKeyClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);
        cc.gameSpace.showLoading('loading...');

        cc.gameSpace.uiManager.showSharedDialog('keyLogin', 'keyLogin', [this]);
    }

    // update (dt) {},
});
