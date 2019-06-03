// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const clientEvent = require('clientEvent');
const i18n = require('LanguageData');
const uiManager = require('uiManager');
const audioManager = require('audioManager');
const bcxAdapter = require('bcxAdapter');
// const localConfig = require('localConfig');
const gameLogic = require('gameLogic');

cc.gameSpace = {};
cc.gameSpace.TIME_SCALE = 1;
cc.gameSpace.isStop = false;
cc.gameSpace.SDK = 'bcx';

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
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        cc.debug.setDisplayStats(false);
        console.log("main----start")
        var winSize = cc.winSize;
        if (winSize.width > winSize.height || (winSize.width / winSize.height) < 1.4) {
            this.node.getComponent(cc.Canvas).fitHeight = true;
        }

        cc.gameSpace.isIphoneX = (cc.game.canvas.height / cc.game.canvas.width) > 2;
        cc.gameSpace.gameLogic = gameLogic;
        cc.gameSpace.audioManager = audioManager;
        cc.gameSpace.uiManager = uiManager;
        cc.gameSpace.showTips = uiManager.showTips.bind(uiManager);
        cc.gameSpace.showLoading = uiManager.showLoading.bind(uiManager);
        cc.gameSpace.hideLoading = uiManager.hideLoading.bind(uiManager);
        // cc.gameSpace.request = gameLogic.request.bind(gameLogic);
        cc.gameSpace.clientEvent = clientEvent;
        cc.gameSpace.bcxAdapter = bcxAdapter;
        cc.gameSpace.isInitFinished = false;
        cc.gameSpace.isConfigLoadFinished = true;

       

        cc.gameSpace.audioManager.playMusic('bgm', true);

        // localConfig.loadConfig(()=>{
        //     cc.gameSpace.isConfigLoadFinished = true;
        // });

        i18n.init('zh');
    }
    // update (dt) {},
});
