var bcxAdapter = require("bcxAdapter");
var constants = require("constants");
var configuration = require("configuration");
var resourceUtil = require("resourceUtil");
var playerData = require("playerData");

cc.Class({
    extends: cc.Component,

    properties: {
        btnOpen: cc.Node,
        btnMute: cc.Node,
        txtCocos: cc.Label,
        txtLevel: cc.Label,

        btnChange: cc.Node,
        fightPlayer: cc.Node,

        imgWeaponUp: cc.SpriteFrame,
        imgWeaponDown: cc.SpriteFrame,

        headIcon: cc.Sprite,

        arrMap: [cc.Node]       //地图元素
    },

    // use this for initialization
    onLoad: function () {
        var winSize = cc.winSize;
        if (winSize.width > winSize.height) {
            this.node.getComponent(cc.Canvas).fitHeight = true;
        }

        this.isLoading = false;

        // cc.director.setDisplayStats(false);

        // bcxAdapter.sendNotice(function (respData) {
        //     //refreshUI
        //     console.log(respData);
        // }, this);


        this.isOpen = cc.gameSpace.audioManager.getConfiguration(true);
        this.btnOpen.active = this.isOpen;
        this.btnMute.active = !this.isOpen;

        this.refreshChangeBtn();

        this.refreshPilotInfo();
    },

    onEnable: function () {
        this.refreshMoney();
    },

    refreshMoney: function () {
        var _this = this;
        bcxAdapter.getBalance(function (err, result) {
            if (err) {
                cc.gameSpace.showTips(err);
            } else {
                _this.txtCocos.string = Number(result.data.COCOS).toFixed(1);
            }
        });
    },

    onBtnPlayClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.showLoading(cc.gameSpace.text.Requesting_info+'...');

        this.isGetItemFinished = false;
        this.isCostFinished = false;
        var _this = this;
        bcxAdapter.getItems(function (err, res) {
            _this.isGetItemFinished = true;
            _this.loadFightScene();
        });

        bcxAdapter.reqStartGame((err, respData) => {
            this.isCostFinished = true;
            if (!err) {
                console.log("reqStartGame1")
                //付费成功
                cc.gameSpace.showLoading(cc.gameSpace.text.deduct_Coin+"(" + constants.START_GAME_CONSUME + ")"+cc.gameSpace.text.success+cc.gameSpace.enter_battlefield);

                this.loadFightScene();
            } else {
                console.log("reqStartGame2")
                cc.gameSpace.hideLoading();
                cc.gameSpace.showTips(err);
            }
        });
    },

    loadFightScene: function () {
        console.log("this.isGetItemFinished"+this.isGetItemFinished)
        console.log("this.isCostFinished"+this.isCostFinished)
        if (!this.this.isCostFinished || !this.isCostFinished) {
            return;
        }

        cc.director.preloadScene("fight", function () {
            cc.gameSpace.hideLoading();

            cc.director.loadScene("fight", function () {
                //刷新界面
            });
        });
    },

    refreshChangeBtn: function () {
        // this.btnChange.getComponent(cc.Button).interactable = playerData.hasSuperWeapon();

        //更新按钮状态
        // this.btnChange.getComponent(cc.Sprite).spriteFrame = playerData.isUsedSuperWeapon() ? this.imgWeaponDown : this.imgWeaponUp;


        var weapon = playerData.getCurrentWeapon();
        if (weapon) {
            var level = playerData.getWeaponLevel(weapon);

            this.txtLevel.string = 'lv.' + level;
        } else {
            this.txtLevel.string = '';
        }

        //刷新飞机模型
        this.fightPlayer.getComponent("MainPlayer").refreshModel();
    },

    onBtnRefreshClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.showLoading(cc.gameSpace.text.refreshing+'...');

        var _this = this;
        bcxAdapter.getItems(function (err, res) {
            cc.gameSpace.hideLoading();

            if (!err) {
                _this.refreshChangeBtn();
            }
            
        });
    },

    onBtnChangeClick: function () {
        //改变状态
        // var isUsed = playerData.isUsedSuperWeapon();
        // isUsed = !isUsed;
        //
        // configuration.setGlobalData(constants.DATA_KEY.WEAPON, isUsed);
        //
        // this.refreshChangeBtn();

        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.uiManager.showSharedDialog('weapon', 'weapon', [this]);

    },

    onBtnQuestionClick: function () {
        // this.testBclFunction();
        cc.gameSpace.audioManager.playSound("click", false);
    },

    onBtnPilotClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.uiManager.showSharedDialog('pilot', 'pilot', [this]);
    },

    onBtnMarketClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.uiManager.showSharedDialog('market', 'market', []);
    },

    onBtnRankClick: function () {
        // cc.gameSpace.audioManager.playSound("click", false);

        // cc.gameSpace.showLoading(cc.gameSpace.text.loading);
        // cc.gameSpace.uiManager.showSharedDialog('showKey', 'showKey', []);

        bcxAdapter.test();
    },

    onBtnSoundClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.isOpen = false;
        this.changeMusicState();
    },

    onBtnMuteClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.isOpen = true;
        this.changeMusicState();
    },

    onBtnLotteryClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        cc.gameSpace.showLoading(cc.gameSpace.text.loading);

        cc.gameSpace.uiManager.showSharedDialog('lottery', 'lottery');
    },

    changeMusicState: function () {
        this.btnOpen.active = this.isOpen;
        this.btnMute.active = !this.isOpen;

        if (this.isOpen) {
            cc.gameSpace.audioManager.openMusic();
            cc.gameSpace.audioManager.openSound();
        } else {
            cc.gameSpace.audioManager.closeMusic();
            cc.gameSpace.audioManager.closeSound();
        }

        // cc.gameSpace.audioManager.setMusic(this.isOpen);
        // cc.gameSpace.audioManager.setSound(this.isOpen);
        // configuration.setGlobalData(constants.DATA_KEY.SOUND, this.isOpen);
    },

    refreshPilotInfo: function () {
        var currentPilot = playerData.getCurrentPilot();
        if (currentPilot) {
            var itemData = JSON.parse(currentPilot.base_describe);

            var _this = this;
            resourceUtil.getPilotIcon(itemData['icon'], function (err, spriteFrame) {
                if (!err && cc.isValid(_this.headIcon)) {
                    _this.headIcon.spriteFrame = spriteFrame;
                }
            });
        }
    },

    update: function(dt) {
        this.updateMap();
    },

    updateMap: function () {
        var speed = 1;

        for (var idx = 0; idx < this.arrMap.length; idx++) {
            var mapNode = this.arrMap[idx];

            mapNode.y = mapNode.position.y - speed;
        }

        for (var idxChk = 0; idxChk < this.arrMap.length; idxChk++) {
            var checkNode = this.arrMap[idxChk];
            var pos = checkNode.position;
            if (pos.y <= -cc.winSize.height/2 - mapNode.height / 2 - 100) {
                //已经超过最低边界，将位置调整到上面
                var lastIndex = idxChk - 1;
                lastIndex = lastIndex < 0 ? this.arrMap.length - 1: lastIndex;
                var preNode = this.arrMap[lastIndex];
                checkNode.y = preNode.position.y + checkNode.height;
                break;
            }
        }

    },

    testBclFunction: function () {
        // bcxAdapter.signUp('lizhiyi4', '123456', function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     } else {
        //         cc.gameSpace.showTips("Registered successfully");
        //     }
        // });

        // bcxAdapter.loginWithAccount("lizhiyi", "123456", function (result) {
        //     console.log(result);
        // });

        // bcxAdapter.getPrivateKey(function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     }
        // });



        // bcxAdapter.declaraionItem(function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     }
        // });

        // bcxAdapter.getItemVERs(function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     }
        // });
        //

        // bcxAdapter.getItems(function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     }
        // });

        // bcxAdapter.createItem("1.3.0", "Clear anything", function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     }
        // });

        // bcxAdapter.getPrivateKey(function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     } else {
        //         bcxAdapter.transfer("1.2.40", result.data.active_private_key, 10, "newGame", function (result) {
        //             console.log(result);
        //         });
        //     }
        // });

        // bcxAdapter.transferToDeveloper(10, "newGame", function (result) {
        //     if (result.status !== 1) {
        //         cc.gameSpace.showTips(result.statusText);
        //     }
        // });

        // bcxAdapter.transferToPlayer(2, "newGame", function (result) {
        //
        // });

        // bcxAdapter.deleteItem("7FB9hwzAu7NBNwkkVM7mj4AcpyLfEgwQgzhtxYTSURdzLsyVBk", function () {
        //
        // });

    }
});
