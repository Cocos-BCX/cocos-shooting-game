// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var constants = require("constants");
var configuration = require("configuration");

var GameData = cc.Class({
    ctor: function () {
        this.info = {
            "code": 1,
            "function": "newGame",
            "PlayingUID": "29042",
            "PlayingGameID": "1",
            "PlayingGameKey": "111a731261aeb2d55b214346e5b2eec2",
            "GameData": [{
                "level": 1,
                "enemy_num": 1000,
                "boss_num": 30000
            }, {
                "level": 2,
                "enemy_num": 800,
                "boss_num": 30000
            }, {
                "level": 3,
                "enemy_num": 600,
                "boss_num": 20000
            }],
            "cion_num": {
                "GCS": 0.576
            },
            "imgUrl": ["https://ofe0v4nhm.qnssl.com/candy/images/coin/GCS.png"],
            "Cost": 300,
            "reviveImg": "http://shooter-admin.candy.one/static/images/defeault.png",
            "candy": 253,
            "trans": [43],
            "isFreeGame": 1,
            "relifeCost": 100
        };

        this.relifeCost = constants.START_GAME_CONSUME;

        this.goods = [];

        this.goodsDel = [];

        this.goodsSelling = [];
    },

    getUid: function () {
        return this.info.PlayingUID;
    },

    parseNotice: function (dataObj) {
        this.isFree = dataObj["isFreeGame"] === 1;
        this.noticeList = dataObj["data"];
        this.playTimes = dataObj["times"];
        this.introduction = dataObj["info"];
        this.errCode = dataObj["errCode"];
        this.backUrl = dataObj["backUrl"];
    },

    /**
     * 获取炸弹列表
     */
    getBomb: function () {
        var ret = [];
        _.forEach(this.goods, function (good) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.BOMB_KEY) {
                ret.push(good);
            }
        });

        return ret;
    },

    costBomb: function() {
        var bombs = this.getBomb();
        if (bombs.length <= 0) {
            return false;
        }

        var bomb = null;
        var _this = this;
        _.forEach(this.goods, function (good, index) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.BOMB_KEY) {
                bomb = good;
                _this.goods.splice(index, 1);
                return false;
            }
        });

        if (!bomb) {
            return false;
        }

        this.goodsDel.push(bomb);

        return true;
    },

    /**
     * 移除物品
     * @param itemID
     */
    removeGoodItem: function (itemID) {
        _.remove(this.goods, function (good) {
            return good.id === itemID;
        });
    },

    hasSuperWeapon: function () {
        //检查道具里头是否有超级武器
        var isFind = false;
        _.forEach(this.goods, function (good) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.WEAPON_KEY) {
                isFind = true;
                return false;
            }
        });
        return isFind;
    },

    /**
     * 检查是否使用超级武器
     * @returns {*}
     */
    isUsedSuperWeapon: function () {
        if (!this.hasSuperWeapon()) {
            return false;
        }

        return configuration.getGlobalData(constants.DATA_KEY.WEAPON);
    },

    /**
     * 检查是否有飞行员
     * @returns {boolean}
     */
    hasPilot: function () {
        return this.getPilotList().length > 0;
    },

    /**
     * 根据物品id获得飞行员信息
     * @param itemId
     */
    getPilotByItemId: function (itemId) {
        var ret = null;
        _.forEach(this.goods, function (good) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.PILOT && good.id === itemId) {
                ret = good;
                return false;
            }
        });

        return ret;
    },

    /**
     * 获取当前飞行员
     */
    getCurrentPilot: function () {
        if (!this.hasPilot()) {
            return null;
        }

        var current = configuration.getGlobalData(constants.DATA_KEY.PILOT);
        if (!current) {
            return null;
        }

        return this.getPilotByItemId(current);
    },

    /**
     * 获取飞行员列表
     * @returns {Array}
     */
    getPilotList: function () {
        var arrRet = [];

        _.forEach(this.goods, function (good) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.PILOT) {
                arrRet.push(good);
            }
        });

        return arrRet;
    },

    /**
     * 获取武器列表
     * @returns {Array}
     */
    getWeaponList: function () {
        var arrRet = [];

        _.forEach(this.goods, function (good) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.WEAPON_KEY) {
                arrRet.push(good);
            }
        });

        return arrRet;
    },

    /**
     * 保存当前的飞行员
     * @param itemId
     */
    saveCurrentPilot: function (itemId) {
        configuration.setGlobalData(constants.DATA_KEY.PILOT, itemId);
    },

    /**
     * 获得当前的飞行员物品id
     * @returns {*}
     */
    getCurrentPilotItemId: function () {
        return configuration.getGlobalData(constants.DATA_KEY.PILOT);
    },

    /**
     * 保存当前的武器
     * @param itemId
     */
    saveCurrentWeapon: function (itemId) {
        configuration.setGlobalData(constants.DATA_KEY.CURRENT_WEAPON, itemId);
    },

    /**
     * 获得当前的武器物品id
     * @returns {*}
     */
    getCurrentWeaponItemId: function () {
        return configuration.getGlobalData(constants.DATA_KEY.CURRENT_WEAPON);
    },

    /**
     * 根据物品id获得武器信息
     * @param itemId
     */
    getWeaponByItemId: function (itemId) {
        var ret = null;
        _.forEach(this.goods, function (good) {
            var itemData = JSON.parse(good.base_describe);
            if (itemData["type"] === constants.WEAPON_KEY && good.id === itemId) {
                ret = good;
                return false;
            }
        });

        return ret;
    },

    /**
     * 获取当前武器
     */
    getCurrentWeapon: function () {
        if (this.getWeaponList().length <= 0) {
            return null;
        }

        var current = configuration.getGlobalData(constants.DATA_KEY.CURRENT_WEAPON);
        if (!current) {
            return null;
        }

        return this.getWeaponByItemId(current);
    },

    /**
     * 获得武器等级
     * @param weaponInfo
     */
    getWeaponLevel: function (weaponInfo) {
        var arrContractId = ['contract.ccshooter.upgrade'];

        if (!weaponInfo || !weaponInfo.describe_with_contract) {
            return 1;
        }

        var level = 1;
        for (var idx = 0; idx < arrContractId.length; idx++) {
            var contractId = arrContractId[idx];
            if (weaponInfo.describe_with_contract.hasOwnProperty(contractId)) {
                var objUpgrade = weaponInfo.describe_with_contract[contractId];

                if (objUpgrade.hasOwnProperty('level') && Number(objUpgrade['level']) > level) {
                    level = Number(objUpgrade['level']);
                }
            }
        }

        return level;
    },

    /**
     * 通过武器id获得武器等级
     * @param weaponId
     */
    getWeaponLevelById: function (weaponId) {
        var weapon = this.getWeaponByItemId(weaponId);
        if (!weapon) {
            return 0;
        }

        return this.getWeaponLevel(weapon);
    },

    isGoodsSelling: function (itemId) {
        for (var idx = 0; idx < this.goodsSelling.length; idx++) {
            if (this.goodsSelling[idx].id === itemId) {
                return true;
            }
        }

        return false;
    },

    getGoodsOrderId: function (itemId) {
        for (var idx = 0; idx < this.goodsSelling.length; idx++) {
            if (this.goodsSelling[idx].id === itemId) {
                return this.goodsSelling[idx].order;
            }
        }

        return null;
    }
});

var shareData = new GameData();
module.exports = shareData;