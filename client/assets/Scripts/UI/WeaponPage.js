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
        this.arrWeapon = [];
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
            this.arrWeapon.push(item);
        }
    },

    setPageInfo: function (page, weaponPanel) {
        this.currentPage = page;
        this.weaponPanel = weaponPanel;
    },

    refreshPage: function () {
        if (this.arrWeapon.length <= 0) {
            return;
        }

        var weaponList = playerData.getWeaponList();
        for (var idx = 0; idx < this.arrWeapon.length; idx++) {
            var item = this.arrWeapon[idx];
            var weaponItemScript = item.getComponent('WeaponItem');

            var idxShift = this.currentPage * constants.WEAPON_PAGE_SIZE + idx;
            if (idxShift >= weaponList.length) {
                weaponItemScript.setInfo(null, this.currentPage, this.weaponPanel);
            } else {
                weaponItemScript.setInfo(weaponList[idxShift], this.currentPage, this.weaponPanel);
            }
        }
    },

    unSelectAll: function () {
        for (var idx = 0; idx < this.arrWeapon.length; idx++) {
            var item = this.arrWeapon[idx];
            var weaponItemScript = item.getComponent('WeaponItem');
            weaponItemScript.select(false);
        }
    },
    
    selectByItemId: function (itemId) {
        for (var idx = 0; idx < this.arrWeapon.length; idx++) {
            var item = this.arrWeapon[idx];
            var weaponItemScript = item.getComponent('WeaponItem');
            if (weaponItemScript.itemInfo && weaponItemScript.itemInfo.id === itemId) {
                weaponItemScript.select(true);
                break;
            }
        }
    },

    unLaunchAll: function () {
        for (var idx = 0; idx < this.arrWeapon.length; idx++) {
            var item = this.arrWeapon[idx];
            var weaponItemScript = item.getComponent('WeaponItem');
            weaponItemScript.launch(false);
        }
    },

    launchByItemId: function (itemId) {
        for (var idx = 0; idx < this.arrWeapon.length; idx++) {
            var item = this.arrWeapon[idx];
            var weaponItemScript = item.getComponent('WeaponItem');
            if (weaponItemScript.itemInfo && weaponItemScript.itemInfo.id === itemId) {
                weaponItemScript.launch(true);
                break;
            }
        }
    },

    refreshByItemId: function (itemId) {
        for (var idx = 0; idx < this.arrWeapon.length; idx++) {
            var item = this.arrWeapon[idx];
            var weaponItemScript = item.getComponent('WeaponItem');
            if (weaponItemScript.itemInfo && weaponItemScript.itemInfo.id === itemId) {
                weaponItemScript.refresh();
                break;
            }
        }
    }

    // update (dt) {},
});
