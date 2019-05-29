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
var playerData = require("playerData");
var resourceUtil = require("resourceUtil");
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

        txtCocos: cc.Label,
        txtBomb: cc.Label,
        txtScore: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        this.setCurLanguage();
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

    reqCloseLoading: function () {
        if (this.isReqCocosFinished && this.currentCreate >= this.cntCreateBomb) {
            //最后将没有真正删除的还原回去
            playerData.goods = playerData.goodsDel.concat(playerData.goods);
            playerData.goodsDel = [];//记得要删除

            cc.gameSpace.hideLoading();
        }
    },

    clearFightScene: function () {
        this.fightScene.unCreate();
        this.fightScene.clear();

        this.fightScene.resume();
        // cc.director.getScheduler().setTimeScale(1);
    },

    show: function (cocosAmount, bombAmount, score, fightScene) {
        this.fightScene = fightScene;
        this.clearFightScene();

        //发奖励
        cc.gameSpace.showLoading(cc.gameSpace.text.submit_data);
        var _this = this;
        this.isReqCocosFinished = true;
        if (cocosAmount > 0) {
            this.isReqCocosFinished = false;
            this.txtCocos.string = cocosAmount.toString();

            //TODO 处于安全性考虑,后续奖励其实应该移到服务端去的
            bcxAdapter.transferToPlayer(cocosAmount, "Reward", function (res) {
                var obj = JSON.parse(res);
                if (obj.state === 1) {
                    console.log(res);
                    console.log("reward succeed!");
                    cc.gameSpace.showTips(cc.gameSpace.text.success_rewards);
                }

                _this.isReqCocosFinished = true;
                _this.reqCloseLoading();
            });
        }

        this.currentCreate = 0;
        this.cntCreateBomb = 0;

        //炸弹的策略 为先内存操作，最后做总结
        //多出的 就增加 变少了就 去删除物品

        var addBomb = bombAmount - playerData.goodsDel.length;
        this.txtBomb.string = addBomb;
        this.cntCreateBomb = Math.abs(addBomb);

        if (addBomb < 0) {
            //表示要去销毁道具
            this.destroyBomb();
        } else if (addBomb > 0) {
            //表示不用销毁道具，并且增加道具
            //创建道具
            this.createBomb();
        }

        //分数
        this.txtScore.string = score;

        this.reqCloseLoading();
    },

    onBtnYesClick: function () {
        //回到主场景
        this.fightScene.exitFightScene();
    },

    createBomb: function () {
        if (this.currentCreate >= this.cntCreateBomb) {
            bcxAdapter.getItems(function () {

            });
            return;
        }

        var _this = this;
        bcxAdapter.reqCreateBomb(function (err, res) {
            if (!err) {
                console.log("create bomb succeed(" + _this.currentCreate + ")");
            } else {
                cc.gameSpace.showTips(err);
            }

            _this.currentCreate++;
            _this.createBomb();
            _this.reqCloseLoading();
        });
    },

    destroyBomb: function () {
        if (this.currentCreate >= this.cntCreateBomb) {
            return;
        }

        var _this = this;
        var item = playerData.goodsDel.shift();
        bcxAdapter.reqDestroyBomb(item.id, function (err, res) {
            if (err) {
                cc.gameSpace.showTips(err);
            }

            _this.currentCreate++;
            _this.destroyBomb();
            _this.reqCloseLoading();
        });
    }

    // update (dt) {},
});
