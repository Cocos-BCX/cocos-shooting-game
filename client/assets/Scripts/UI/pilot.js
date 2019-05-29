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

        spHead: cc.Sprite,
        txtAdd: cc.Label,
        txtName: cc.Label,
        hpNode: cc.Node,
        nodeBtnUse: cc.Node,
        nodeName: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {
        this.currentSelect = null;
        this.refreshUI();
        this.refreshPilotInfo();
        this.setCurLanguage();
    },

    refreshUI: function () {
        var pilotList = playerData.getPilotList();
        if (pilotList.length <= 0) {
            this.nodeTips.active = true;
            this.nodeView.active = false;
        } else {
            this.nodeTips.active = false;
            this.nodeView.active = true;
            //
            // this.initList();

            this.initPage();
        }
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

    refreshPilotInfo: function () {
        var _this = this;
        if (!this.currentSelect) {
            resourceUtil.getPilotIcon("unknown", function (err, spriteFrame) {
                if (!err && cc.isValid(_this.spHead)) {
                    _this.spHead.spriteFrame = spriteFrame;
                }
            });

            this.txtName.string = cc.gameSpace.text.unselected;
            this.hpNode.active = false;
            this.nodeBtnUse.active = false;
        } else {
            var itemInfo = playerData.getPilotByItemId(this.currentSelect);

            var itemData = JSON.parse(itemInfo.base_describe);
            var addHp = 0;
            switch (itemData['quality']) {
                case constants.QUALITY.WHITE:
                    addHp = 1;
                    break;
                case constants.QUALITY.GREEN:
                    addHp = 2;
                    break;
                case constants.QUALITY.GREEN_1:
                    addHp = 3;
                    break;
                case constants.QUALITY.GREEN_2:
                    addHp = 4;
                    break;
                case constants.QUALITY.BLUE:
                    addHp = 5;
                    break;
                case constants.QUALITY.PURPLE:
                    addHp = 6;
                    break;
                case constants.QUALITY.GOLD:
                    addHp = 7;
                    break;
            }

            this.hpNode.active = true;
            this.txtAdd.string = '+' + addHp;
            this.txtName.string = itemData['name'];

            resourceUtil.getPilotIcon(itemData["icon"], function (err, spriteFrame) {
                if (!err && cc.isValid(_this.spHead)) {
                    _this.spHead.spriteFrame = spriteFrame;
                }
            });


            this.nodeBtnUse.active = true;//todo 判断已启用
        }
    },

    // initList: function () {
    //     var pilotList = playerData.getPilotList();
    //     var children = this.nodeContent.children;
    //     for (var idx = 0; idx < pilotList.length; idx++) {
    //         var node = null;
    //         if (idx < children.length) {
    //             node = children[idx];
    //         } else {
    //             node = cc.instantiate(this.prefabItem);
    //             node.parent = this.nodeContent;
    //         }
    //
    //         node.getComponent('PilotItem').setInfo(pilotList[idx]);
    //     }
    // },

    initPage: function () {
        var pilotList = playerData.getPilotList();
        this.pageCnt = Math.ceil(pilotList.length / constants.PAGE_SIZE);

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < this.pageCnt; idx++) {
            var curPage = null;
            if (idx < pages.length) {
                curPage = pages[idx];
            } else {
                curPage = cc.instantiate(this.prefabPage);
                this.pageView.addPage(curPage);
            }

            var PilotPage = curPage.getComponent('PilotPage');
            PilotPage.setPageInfo(idx, this);
            PilotPage.refreshPage();
        }
    },
    
    onBtnCloseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.node.destroy();
    },

    onItemSelect: function (itemId, owner) {
        this.currentSelect = itemId;
        this.currentSelectPageOwner = owner;

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx];
            var pageCmp = page.getComponent('PilotPage');
            pageCmp.unSelectAll();

            if (this.currentSelectPageOwner === idx) {
                pageCmp.selectByItemId(this.currentSelect);
            }
        }

        this.refreshPilotInfo();
    },
    
    onBtnUseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);
        if (!this.currentSelect) {
            return;
        }

        playerData.saveCurrentPilot(this.currentSelect);

        var pages = this.pageView.getPages();
        for (var idx = 0; idx < pages.length; idx++) {
            var page = pages[idx];
            var pageCmp = page.getComponent('PilotPage');
            pageCmp.unLaunchAll();

            if (this.currentSelectPageOwner === idx) {
                pageCmp.launchByItemId(this.currentSelect);
            }
        }

        this.node.destroy();

        this.startScene.refreshPilotInfo();
    },

    onBtnMarketClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);
        window.open("http://gpe.famegame.com.cn");
    },

    // update (dt) {},
});
