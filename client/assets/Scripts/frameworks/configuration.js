/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 */
var KEY_CONFIG = "PlaneConfig";
const utils = require('utils');

var Configuration = cc.Class({

    // use this for initialization
    onLoad () {
        this.jsonData = {
            "userId": ""
        };

        this.path = this.getConfigPath();
        var content;
        if (cc.sys.isNative) {
            var valueObject = jsb.fileUtils.getValueMapFromFile(this.path);

            content = valueObject[KEY_CONFIG];
        } else {

            content = cc.sys.localStorage.getItem(KEY_CONFIG);

        }

        // // 解密代码
        // if (cc.game.config["encript"]) {
        //     var newContent = new Xxtea("upgradeHeroAbility").xxteaDecrypt(content);
        //     if (newContent && newContent.length > 0) {
        //         content = newContent;
        //     }
        // }

        if (content && content.length) {
            if (content.startsWith('@')) {
                content = content.substring(1);
                content = utils.decrypt(content);
            }

            try {
                //初始化操作
                var jsonData = JSON.parse(content);
                this.jsonData = jsonData;
                console.log(">>>>>>>>>>>>>>content=="+JSON.stringify(jsonData));

            }catch (excepaiton) {

            }

        }

        this.markSave = false;
        //启动无限定时器，每1秒保存一次数据，而不是无限保存数据
        this.saveTimer = setInterval(() =>{
            this.scheduleSave();
        }, 500);
    },

    setConfigDataWithoutSave (key, value) {
        var account = this.jsonData.userId;
        if (this.jsonData[account]) {
            this.jsonData[account][key] = value;
        } else {
            console.error("no account can not save");
        }
    },

    setConfigData (key, value) {
        this.setConfigDataWithoutSave(key, value);

        // this.save();
        this.markSave = true; //标记为需要存储，避免一直在写入，而是每隔一段时间进行写入
    },

    getConfigData (key) {
        var account = this.jsonData.userId;
        if (this.jsonData[account]) {
            var value = this.jsonData[account][key];
            return value ? value : "";
        } else {
            cc.log("no account can not load");
            return "";
        }
    },

    setGlobalData (key, value) {
        this.jsonData[key] = value;
        this.save();
    },

    getGlobalData (key) {
        return this.jsonData[key];
    },

    setUserId (userId) {
        this.jsonData.userId = userId;
        if (!this.jsonData[userId]) {
            this.jsonData[userId] = {};
        }

        this.save();
    },

    getUserId () {
        return this.jsonData.userId;
    },

    scheduleSave () {
        if (!this.markSave) {
            return;
        }

        this.save();
    },

    /**
     * 标记为已修改
     */
    markModified () {
        this.markSave = true;
    },

    save () {
        // 写入文件
        var str = JSON.stringify(this.jsonData);

        // // 加密代码
        // if (cc.game.config["encript"]) {
        //     str = new Xxtea("upgradeHeroAbility").xxteaEncrypt(str);
        // }

        let zipStr = '@' + utils.encrypt(str);

        this.markSave = false;
        
        if (!cc.sys.isNative) {
            var ls = cc.sys.localStorage;
            ls.setItem(KEY_CONFIG, zipStr);
            return;
        }

        var valueObj = {};
        valueObj[KEY_CONFIG] = zipStr;
        jsb.fileUtils.writeToFile(valueObj, configuration.path);

    },

    getConfigPath () {

        var platform = cc.sys;

        var path = "";

        if (platform === cc.sys.OS_WINDOWS) {
            path = "src/conf";
        } else if (platform === cc.sys.OS_LINUX) {
            path = "./conf";
        } else {
            if (cc.sys.isNative) {
                path = jsb.fileUtils.getWritablePath();
                path = path + "conf";
            } else {
                path = "src/conf";
            }
        }

        return path;
    },

    parseUrl (paramStr) {
        if (!paramStr || (typeof paramStr === 'string' && paramStr.length <= 0)) {
            // 没有带参数，直接忽略
            return;
        }

        var dictParam = {};
        if (typeof paramStr === 'string') {
            paramStr = paramStr.split('?')[1]; // 去除掉 ？号
            var arrParam = paramStr.split("&");
            arrParam.forEach(function (paramValue) {
                var idxEqual = paramValue.indexOf("=");
                if (idxEqual !== -1) {
                    var key = paramValue.substring(0, idxEqual);
                    dictParam[key] = paramValue.substring(idxEqual + 1);
                }
            });
        } else {
            dictParam = paramStr;
        }

        if (dictParam.action) {
            this.setGlobalData('urlParams', dictParam);
        }

        // todo：记录来源，以后用到
        if (dictParam.source) {
            this.setGlobalData('source', dictParam.source);
        }

        if (dictParam.adchannelid) {
            this.setGlobalData('adchannelid', dictParam.adchannelid);
        }
    },
});

var configuration = new Configuration();
configuration.onLoad();
module.exports = configuration;