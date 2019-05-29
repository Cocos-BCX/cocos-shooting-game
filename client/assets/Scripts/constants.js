/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by lizhiyi on 2018/3/3.
 */

module.exports = {
    DATA_KEY: {
        SOUND: "sound",
        ACCOUNT: "account",
        PASSWORD: "password",
        WEAPON: "weapon",
        PILOT: "pilot",                     //飞行员
        CURRENT_WEAPON: "currentWeapon"     //当前选择的武器
    },

    FIGHT_EVENT: {
        UPDATE_SCORE: "updateScore",
        UPDATE_LIFE: "updateLife",
        UPDATE_CANDY: "updateCandy",
        UPDATE_TOUCH_POS: "updateTouchPos",
        UPDATE_BOMB: "updateBomb",
        RELEASE_BOMB: "releaseBomb"
    },

    ITEM_TYPE: {
        BULLET_LEVEL: 0,    //火力升级
        FOLLOW_NUM: 1,      //导弹数量
        BGold: 2,           //比特币
        CANDY: 3,           //candy券
        LIFE_UP: 4,         //生命值增加
        BOMB: 5             //炸弹
    },

    /*
     * name;
     */
    //线上版本"http://think.waitmeby.top/"
    // var urlTitle = "http://shooter.candy.one/";
    isDeBug: true,

    URL_DEBUG: "http://think.waitmeby.top/",
    URL_RELEASE: "http://shooter-admin.candy.one/",
    URL_LOCAL: "http://192.168.0.89/",

    PROTOCOL: {
        NEW_GAME: "froggame",                        //创建游戏
        SUBMIT_GAME_INFO: "submitGameInfoFromH5",   //游戏结束提交结果
        GET_RANKING: "getRankingList",                     //游戏排行列表
        BUY_TIMES: "buyTimes",                      //请求购买游戏次数
        IS_REVIVE: "isrevive",                      //向服务器请求复活
        NOTICE: "notice"                            //向服务器请求公告
    },

    ZORDER: {
        DRAW_RESULT: 80,         //开奖结果
        DIALOG: 100,        //弹窗的Z序
        REWARD: 900,        //奖励的弹窗
        WAITING: 998,      //等待界面弹窗
        TIPS: 999           //提示框
    },

    //总 Candy数量
    candyNumSum: 150,
    //金币数量
    BGoldNumSum: 100,

    //门票需要多少代币
    START_GAME_CONSUME: 10,

    PAGE_SIZE: 11,     //每一页多少项
    WEAPON_PAGE_SIZE: 7, //武器分页每页多少项

    WEAPON_MAX_LEVEL: 5,    //武器最高等级

    //炸弹KEY
    BOMB_KEY: "bomb",
    WEAPON_KEY: "weapon",
    PILOT: "Employee",

    ERROR_STR: {
        "ERR00018":"sorry, you need more candy.",
        "ERR0019":"sorry, you need more candy.",
        "ERR0007":"unknown error, don’t worry we can’t cost your candy."
    },

    //游戏发展国员工品质
    QUALITY: {
        WHITE: 0,
        GREEN: 10,
        GREEN_1: 11,
        GREEN_2: 12,
        BLUE: 20,
        PURPLE: 30,
        GOLD: 40
    }
};