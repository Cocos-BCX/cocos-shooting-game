/**
 * Copyright (c) 2018 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by lizhiyi on 2018/10/29.
 */


var GameLogic = cc.Class({

    properties: {
        
    },

    // use this for initialization
    start () {
        this.regNetEvent();
        this.regLogicEvent();
    },

    regNetEvent () {
        
    },

    regLogicEvent () {
        
    }
});

let sharedLogic = new GameLogic();
sharedLogic.start();
module.exports = sharedLogic;