// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var playerData = require('playerData');
var constants = require('constants');
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

        nodeTips: cc.Node,
        nodeView: cc.Node,
        pageView: cc.PageView,
        prefabPage: cc.Prefab,

        fightPlayer: cc.Node,
        txtLevel: cc.Label,
        txtCocos: cc.Label,
        nodeBtnUse: cc.Node,
        nodeBtnUnUse: cc.Node,

        nodeCost: cc.Node,

        imgWeapon: cc.SpriteFrame,

        btnUpgrade: cc.Button
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        this.currentSelect = null;
        this.refreshUI();
        this.refreshWeaponInfo();
        this.setCurLanguage()
    },

    refreshUI: function () {
        var weaponList = playerData.getWeaponList();
        if (weaponList.length <= 0) {
            this.nodeTips.active = true;
            this.nodeView.active = false;
        } else {
            this.nodeTips.active = false;
            this.nodeView.active = true;
            //
            // this.initList();

            this.initPage();
        }

        this.refreshMoney();
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

    show: function (startScene) {
        this.startScene = startScene;
    },

    refreshWeaponInfo: function () {
        var itemInfo = null;
        if (!this.currentSelect) {
            this.txtLevel.string = cc.gameSpace.text.unselected;
            this.nodeBtnUse.active = true;
            this.nodeBtnUse.getComponent(cc.Button).interactable = false;
            this.nodeBtnUnUse.active = false;
        } else {
            itemInfo = playerData.getWeaponByItemId(this.currentSelect);

            var level = playerData.getWeaponLevel(itemInfo);
            this.currentLevel = level;

            this.txtLevel.string = 'lv.' + level;


            var itemId = playerData.getCurrentWeaponItemId();
            var isEquip = itemId === itemInfo.id;

            this.nodeBtnUse.getComponent(cc.Button).interactable = true;
            this.nodeBtnUse.active = !isEquip;
            this.nodeBtnUnUse.active = isEquip;
        }

        this.refreshUpgradeButton();

        this.fightPlayer.getComponent("MainPlayer").equipWeapon(itemInfo);
    },

    refreshUpgradeButton: function () {
        if (this.currentSelect) {
            var isMax = this.currentLevel >= constants.WEAPON_MAX_LEVEL;
            var isEnough = playerData.gold > 100;

            this.btnUpgrade.interactable = !isMax && isEnough;
        } else {
            this.btnUpgrade.interactable = false;
        }
    },

    refreshMoney: function () {
        var _this = this;
        bcxAdapter.getBalance(function (err, result) {
            if (!err) {
                _this.txtCocos.string = result.data.COCOS.toFixed(1);

                if (result.data.COCOS > 100) {
                    _this.nodeCost.color = cc.Color.WHITE;
                } else {
                    _this.nodeCost.color = cc.Color.RED;
                }

                _this.refreshUpgradeButton();
            }
        });
    },

    initPage: function () {
        var weaponList = playerData.getWeaponList();
        this.pageCnt = Math.ceil(weaponList.length / constants.WEAPON_PAGE_SIZE);

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < this.pageCnt; idx++) {
            var curPage = null;
            if (idx < pages.length) {
                curPage = pages[idx];
            } else {
                curPage = cc.instantiate(this.prefabPage);
                this.pageView.addPage(curPage);
            }

            var WeaponPage = curPage.getComponent('WeaponPage');
            WeaponPage.setPageInfo(idx, this);
            WeaponPage.refreshPage();
        }
    },

    onBtnCloseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.node.destroy();

        this.startScene.refreshChangeBtn();
        this.startScene.refreshMoney();
    },

    onItemSelect: function (itemId, owner) {
        this.currentSelect = itemId;
        this.currentSelectPageOwner = owner;

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx];
            var pageCmp = page.getComponent('WeaponPage');
            pageCmp.unSelectAll();

            if (this.currentSelectPageOwner === idx) {
                pageCmp.selectByItemId(this.currentSelect);
            }
        }

        this.refreshWeaponInfo();
    },

    onBtnUseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        if (!this.currentSelect) {
            return;
        }

        playerData.saveCurrentWeapon(this.currentSelect);

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx];
            var pageCmp = page.getComponent('WeaponPage');
            pageCmp.unLaunchAll();

            if (this.currentSelectPageOwner === idx) {
                pageCmp.launchByItemId(this.currentSelect);
            }
        }

        this.refreshWeaponInfo();

        // this.onBtnCloseClick();

        // this.startScene.refreshPilotInfo();
    },

    onBtnUnUseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        playerData.saveCurrentWeapon('');

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx];
            var pageCmp = page.getComponent('WeaponPage');
            pageCmp.unLaunchAll();
        }

        this.refreshWeaponInfo();
    },

    onBtnUpgradeClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        //做强化操作
        //开始抽奖
        cc.gameSpace.showLoading(cc.gameSpace.text.executing+" " + bcxAdapter.upgradeContract + cc.gameSpace.text.contract+"...");
        var _this = this;
        bcxAdapter.upgradeWeapon(this.currentSelect, function (err, res) {
            cc.gameSpace.hideLoading();

            _this.refreshMoney();
            //解析数据返回
            if (!err) {
                var arrAffect = res.data[0].contract_affecteds;
                for (var idx = 0; idx < arrAffect.length; idx++) {
                    if (arrAffect[idx].type === "contract_affecteds_log") {
                        var text = arrAffect[idx].raw_data.message;
                        var key = "##result##:";
                        var idxFind = text.indexOf(key);
                        if (idxFind !== -1) {
                            var jsonStr = text.slice(idxFind + key.length);
                            var dataObj = JSON.parse(jsonStr);

                            //显示升级成功特效？刷新下对应道具？？
                            _this.showUpgradeEffect();
                            _this.refreshItem(dataObj['equipmentId']);
                            break;
                        }
                    }
                }
            }

        });
    },

    onBtnMarketClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        window.open("http://gpe.famegame.com.cn");
    },

    showUpgradeEffect: function () {
        // cc.gameSpace.showTips("强化成功!");
        cc.gameSpace.audioManager.playSound("upgrade", false);

        resourceUtil.createEffect('upgrade', this.node, function (err, effectNode) {
            // effectNode.setScale(2);

            var posWorld = this.fightPlayer.convertToWorldSpaceAR(cc.v2(0, 0));
            effectNode.position = effectNode.parent.convertToNodeSpaceAR(posWorld);
            resourceUtil.playEffect(effectNode, function () {

            }, this, true);
        }, this);
    },

    refreshItem: function (upgradeId) {
        var _this = this;
        bcxAdapter.getItems(function (err, res) {
            if (!err) {
                if (upgradeId === _this.currentSelect) {
                    _this.refreshWeaponInfo();
                }

                var pages = _this.pageView.getPages();
                for (var idx = 0; idx < pages.length; idx++) {
                    var page = pages[idx];
                    var pageCmp = page.getComponent('WeaponPage');

                    pageCmp.refreshByItemId(upgradeId);
                }
            }
        });
    }

    // update (dt) {},
});
