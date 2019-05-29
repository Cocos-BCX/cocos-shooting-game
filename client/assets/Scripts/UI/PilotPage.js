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

        arrItem: [cc.Node],
        prefabItem: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    ctor: function () {
        this.arrPilot = [];
    },

    start: function() {

        this.initPage();

        this.refreshPage();
    },

    initPage: function () {
        for (var idx = 0; idx < this.arrItem.length; idx++) {
            var item = cc.instantiate(this.prefabItem);
            item.parent = this.node;
            item.position = this.arrItem[idx].position;
            this.arrPilot.push(item);
        }
    },

    setPageInfo: function (page, pilotPanel) {
        this.currentPage = page;
        this.pilotPanel = pilotPanel;
    },

    refreshPage: function () {
        if (this.arrPilot.length <= 0) {
            return;
        }

        var pilotList = playerData.getPilotList();
        for (var idx = 0; idx < this.arrPilot.length; idx++) {
            var item = this.arrPilot[idx];
            var pilotItemScript = item.getComponent('PilotItem');

            var idxShift = this.currentPage * constants.PAGE_SIZE + idx;
            if (idxShift >= pilotList.length) {
                pilotItemScript.setInfo(null, this.currentPage, this.pilotPanel);
            } else {
                pilotItemScript.setInfo(pilotList[idxShift], this.currentPage, this.pilotPanel);
            }
        }
    },

    unSelectAll: function () {
        for (var idx = 0; idx < this.arrPilot.length; idx++) {
            var item = this.arrPilot[idx];
            var pilotItemScript = item.getComponent('PilotItem');
            pilotItemScript.select(false);
        }
    },
    
    selectByItemId: function (itemId) {
        for (var idx = 0; idx < this.arrPilot.length; idx++) {
            var item = this.arrPilot[idx];
            var pilotItemScript = item.getComponent('PilotItem');
            if (pilotItemScript.itemInfo && pilotItemScript.itemInfo.id === itemId) {
                pilotItemScript.select(true);
                break;
            }
        }
    },

    unLaunchAll: function () {
        for (var idx = 0; idx < this.arrPilot.length; idx++) {
            var item = this.arrPilot[idx];
            var pilotItemScript = item.getComponent('PilotItem');
            pilotItemScript.launch(false);
        }
    },

    launchByItemId: function (itemId) {
        for (var idx = 0; idx < this.arrPilot.length; idx++) {
            var item = this.arrPilot[idx];
            var pilotItemScript = item.getComponent('PilotItem');
            if (pilotItemScript.itemInfo && pilotItemScript.itemInfo.id === itemId) {
                pilotItemScript.launch(true);
                break;
            }
        }
    },

    // update (dt) {},
});
