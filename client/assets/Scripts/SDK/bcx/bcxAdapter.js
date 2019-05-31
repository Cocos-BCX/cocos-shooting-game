// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const playerData = require('playerData');
const constants = require('constants');

var SERVER_URL = "http://shooter.cocosbcx.net/plane/"; //服务器地址
if (cc.game.config.debugMode === cc.debug.DebugMode.INFO) {
    SERVER_URL = "http://127.0.0.1:3000";
}
console.log('>>>>>>>>cc.game.config.debugMode='+cc.game.config.debugMode);
console.log('>>>>>>>>SERVER_URL='+SERVER_URL);

// import BCX from 'bcx.min.js' 
require('./core.min')

require('./plugins.min')


let BCXAdpater = cc.Class({

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        console.info("window=1=",window.BcxWeb);
        
        if (window.BcxWeb) {
            this.bcl =  window.BcxWeb;
        }else{
            var _configParams = {
                ws_node_list: [{
                    url: "ws://39.106.126.54:8049",
                    name: "COCOS3.0节点2"
                }],
                networks: [{
                    core_asset: "COCOS",
                    chain_id: 'b9e7cee4709ddaf08e3b7cba63b71c211c845e37c9bf2b865a7b2a592c8adb28'
                }],
                faucetUrl: 'http://47.93.62.96:8041',
                auto_reconnect: true,
                worker: false,
                real_sub: true,
                check_cached_nodes_data: true,
            };
            this.bcl = new BCX(_configParams);
        }
    },

    initSDK (callback) {
        this.isLoginBcl = false;
        this.account = null;
        this.userId = null;
        this.privateKey = null;
        this.contractName = "contract.ccshooter.lottery";         //合约名称
        this.upgradeContract = "contract.ccshooter.upgrade";  //升级的合约
        
        if (callback) {
            callback();
        }
       

        // this.bcl.init({
        //     autoReconnect:true,
        //     callback:function(){
        //         cc.log("init finished!");

        //         if (callback) {
        //             callback();
        //         }
        //     },
        //     //监听RPC连接状态改变
        //     subscribeToRpcConnectionStatusCallback:function(status){
        //         console.info("status",status);
        //     }
        // });
    },

    isLogin: function () {
        return this.isLoginBcl;
    },

    //使用账号密码登录
    loginWithAccount (account, pwd, callback) {
        // playerData.account = account;
        // let _this = this;
        // this.bcl.passwordLogin({account: account, password:pwd, callback: function (result) {
        //     console.log(">>>>>>>result=="+JSON.stringify(result))
        //     if (result.code === 1) {
        //         playerData.userId = result.data.account_id;
        //         _this.isLoginBcl = true;

        //         if (callback) {
        //             callback(null, result);
        //         }
        //     } else {
        //         playerData.account = null;
        //         playerData.userId = null;

        //         if (callback) {
        //             callback(result.message, result);
        //         }
        //     }
        // }});
    },

    //退出登录
    logout (callback){
        this.bcl.logout({callback:function(res){
            console.info("logout res",res);

            if (callback) {
                if (res.code === 1) {
                    callback(null, res);
                } else {
                    callback(res.message, res);
                }
            }
        }});
    },

    //使用privateKey登录
    loginWithPrivateKey: function (privateKey, callback) {
        // var _this = this;
        // this.bcl.privateKeyLogin({privateKey: privateKey, callback: function (result) {
        //     playerData.account = null;
        //     if (result.status === 1) {
        //         _this.isLoginBcl = true;
        //         playerData.account = result.data.userName;
        //         playerData.userId = result.data.userId;

        //         if (callback) {
        //             callback(null, result);
        //         }
        //     } else {
        //         if (callback) {
        //             callback(result.message, result);
        //         }
        //     }
        // }});
    },

    login:function(callback){
        //非客户端钱包 浏览器插件 android等 会直接挂到window上的
        console.info("window.BcxWeb==",window.BcxWeb);
        if (window.BcxWeb){
            if(this.bcl){
                console.info("account_name==",this.bcl.account_name);
                playerData.account = this.bcl.account_name;
                if (callback) {
                    callback(null);
                }
            }else{
                if (callback) {
                    callback("登录失败");
                }
            }
        }else{
            let self = this
            Cocosjs.plugins(new CocosBCX())
            //connect pc-plugin between sdk
            Cocosjs.cocos.connect('My-App').then(connected => {
                if (!connected) return false
                const cocos = Cocosjs.cocos
                self.bcl = cocos.cocosBcx(self.bcl);
                self.bcl.getAccountInfo().then(res => {
                    console.log("res.account_name=="+res.account_name)
                    self.bcl.account_name = res.account_name
                    playerData.account =res.account_name
                    if (callback) {
                        callback(null);
                    }
                }).catch(function(e){
                    if (callback) {
                        callback("登录失败");
                    }
                });
            })
        }
    },

    //注册
    signUp (account, pwd, callback) {
        this.bcl.createAccountWithPassword({
            account:account,
            password:pwd,
            autoLogin:true,
            callback: function (result) {
                if (result.code === 1) {
                    playerData.account = result.data.account_name;
                    playerData.userId = result.data.account_id;
                    // playerData.privateKey = result.data.activePrivateKey;

                    if (callback) {
                        callback(null, result);
                    }
                } else if (callback) {
                    callback(result.message, result);
                }   
            }
        });
    },

    /**
     * 删除钱包，暂时没用
     */
    deleteWallet (){
        this.bcl.deleteWallet({
            callback:function(res){
                console.info("deleteWallet res",res);
            }
        });
    },

    /**
     * 获取钱包模式下的账号
     */
    getAccounts:function(callback){
        this.bcl.getAccounts({
            callback:function(res){
                console.info("getAccounts res",res);

                // _this.deleteWallet();
                if (callback) {
                    if (res.code === 1) {
                        callback(null, res);
                    } else {
                        callback(res.message, res);
                    }
                }
            }
        });
    },

    //获取privateKey
    getPrivateKey: function (callback) {
        this.bcl.getPrivateKey({
            callback: function (res) {
                
                if (callback) {
                    if (res.code === 1) {
                        playerData.privateKey = res.data.active_private_key;
                        callback (null, res);
                    } else {
                        callback(res.message, res);
                    }
                }
            }
        });
    },

     //代币资产查询
    getBalance (callback) {
        this.getBalanceByAccount(playerData.account, function(err, res) {
            if (!err) {
                playerData.gold = res.data.COCOS;
            }

            callback(err, res);
        });
    },

    getBalanceByAccount (account, callback) {
        this.bcl.queryAccountBalances({
            assetId_or_symbol:'COCOS',
            account: account,
            callback: function(res){
                console.info('res',res);

                if (res.code === -25 || res.code === 125) {
                    //表示还没有这种代币，先给与赋值为0
                    res.code = 1;
                    res.data.COCOS = 0;
                }

                if (res.code === 1) {
                    if (callback) {
                        callback(null, res);
                    }
                } else if (callback) {
                    callback(res.message, res);
                }   
            }
        });
    },

    /**
     * 读取当前用户账户下所有可在对应游戏中使用的道具
     * @param callback
     */
    getItems: function (callback) {
        this.bcl.queryAccountNHAssets({
            account: playerData.account,
            versions: ['CCShooter'],
            page: 1,
            pageSize: 1000,
            callback: function (res) {
                console.log(res);

                //更新playerData里头的道具列表
                if (res.code === 1) {
                    playerData.goods = res.data;
                    callback(null, res);
                } else {
                    callback(res.message, res);
                }
            }
        });
    },

    /**
     * 删除道具
     * @param arrItemID
     * @param callback
     */
    deleteItem: function (arrItemID, callback) {
        this.bcl.deleteNHAsset({
            NHAssetIds: arrItemID,
            callback: function (res) {
                console.log(res);

                callback(res);
            }
        });
    },

    requestWithGet: function (url, callback, target) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                callback.apply(target, [xhr.responseText]);
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    },

    requestWithPost: function (url, data, callback, target) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                callback.apply(target, [xhr.responseText]);
            }
        };
        xhr.open("POST", url, true);
        xhr.send(data);
    },

    //转账给游戏开发者
    transferToDeveloper: function (amount, memo, callback) {
        this.bcl.transferAsset({
            fromAccount: playerData.account,
            toAccount: 'ccshooter',
            amount: amount,
            assetId: 'COCOS',
            memo: memo,
            onlyGetFee: false,
        }).then(function(res){
            console.log("transferToDeveloper=="+JSON.stringify(res));

            if (res.code === 1) {
                callback(null, res);
            } else {
                callback(res.message, res);
            }
        }).catch(function(e){
            console.log("transferToDeveloper=="+JSON.stringify(e));
        });
    },

    /**
     * 查询合约信息
     * @param {String} contractName 
     * @param {Function} callback 
     */
    queryContract (contractName, callback) {
        this.bcl.queryContract({
            nameOrId: contractName,
            callback: function (res) {
                if (res.code === 1) {
                    callback(null, res);
                } else {
                    callback(res.message, res);
                }
            }
        });
    },

    lottery: function (callback) {
        this.bcl.callContractFunction({
            nameOrId: this.contractName,
            functionName: 'draw',//["1",1000001,'COCOS']
            valueList:[playerData.account, 100],////
           
        }).then(function(res){
            console.info("draw res=",res);

            if (res.code === 1) {
                callback(null, res);
            } else {
                callback(res.message, res);
            }
        }).catch(function(e){
            console.info("draw lottery error=",JSON.stringify(e));
        });
    },


    //以下接口是由服务端来完成
    //转账给玩家
    transferToPlayer: function (token, comment, callback) {
        //http://pvp-t.592you.com:4020
        var transferUrl = SERVER_URL + "/bcl/money?to=" + playerData.account + "&token=" + token + "&comment=" + comment;

        // var transferUrl = "http://cs.592you.com/transfer?";  //username=1.2.42&token=1&memo=asdas&key=5KHuvcBFp9HtqWa6rV3faKjm9reEoGMV8WZNvVnbGekDwA42Hnz&blocking=head
        // transferUrl += 'username=' + this.userId + '&token='+ token +'&blocking=head&memo='+comment + '&key=5KHuvcBFp9HtqWa6rV3faKjm9reEoGMV8WZNvVnbGekDwA42Hnz';

        this.requestWithGet(transferUrl, function (res) {
            callback(res);
        }, this);
    },

    reqStartGame: function (callback) {
        this.transferToDeveloper(constants.START_GAME_CONSUME, "newGame", function (err, res) {
            callback(err, res);
        });
    },

    reqRelife: function (callback) {
        this.transferToDeveloper(playerData.relifeCost, "resurrection", function (err, res) {
            callback(err, res);
        });
    },

    /**
     * 创建炸弹
     * @param callback
     */
    reqCreateBomb: function (callback) {
        //创建炸弹接口改为调用服务端来处理
        var url = SERVER_URL + '/bcl/bomb/' + playerData.account;
        // var url = 'http://pvp-t.592you.com:4020/bcl/bomb/' + this.account;
        console.log(">>>>>>>>SERVER_URL=="+SERVER_URL);
        this.requestWithGet(url, function (res) {
            if (callback) {
                let objRes = JSON.parse(res);
                if (objRes.code === 200) {
                    callback(null, objRes);
                } else {
                    callback(objRes.statusText, objRes);
                }
            }   
        }, this);
    },

    /**
     * 移除炸弹
     * @param itemId
     * @param callback
     */
    reqDestroyBomb: function (itemId, callback) {
        playerData.removeGoodItem(itemId);

        this.deleteItem([itemId], function (res) {
            console.log(res);
            if (res.code === 1) {
                callback(null, res);
            } else {
                callback(res.message, res);
            }
        });
    },

    /**
     * 创建游戏出售单
     * @param itemId
     * @param price
     * @param expiration
     * @param fee
     * @param memo
     * @param callback
     */
    creatGameItemOrder: function(itemId, price, expiration, fee, memo, callback){
        this.bcl.creatNHAssetOrder(
            {
                otcAccount:"ccshooter",
                orderFee:fee,
                NHAssetId:itemId,
                price:price,
                priceAssetId:'COCOS',
                expiration:expiration,
                memo:memo,
                callback:function(res){
                    console.info('creatNHAssetOrder result',res);
                    if (callback) {
                        if (res.code === 1) {
                            callback(null, res);
                        } else {
                            callback(res.message, res);
                        }
                    }
                }
            }
        )
    },

    cancelGameItemOrder:function(orderId, callback){
        this.bcl.cancelNHAssetOrder({
            orderId:orderId,
            callback:function(res){
                console.info("cancelNHAssetOrder res",res);

                if (callback) {
                    if (res.code === 1) {
                        callback(null, res);
                    } else {
                        callback(res.message, res);
                    }   
                }
            }
        });
    },

    /**
     * 查询当前账号下所拥有的道具出售单
     */
    queryAccountGameItemOrders: function(callback){
        this.bcl.queryAccountNHAssetOrders({
            account:playerData.account,
            pageSize:100,
            page:1,
            callback:function(res){
                console.info('res',res);
                if (res.code === 1) {
                    playerData.goodsSelling = res.data;

                    if (callback) {
                        callback(null, res);
                    }
                } else {
                    if (callback) {
                        callback(res.message, res);
                    }
                }
            }
        });
    },

    /**
     * 根据道具id查询道具详细信息
     * @param arrItemId
     * @param callback
     */
    queryGameItemInfo: function (arrItemId, callback) {
        this.bcl.queryNHAssets({
            NHAssetHashOrIds: arrItemId,
            callback: function(res) {
                console.info("queryGameItemInfo res",res);
                if(res.code === 1){
                    callback(null, res);
                } else {
                    callback(res.message, res);
                }
            }
        })
    },

    /**
     * 升级武器
     * @param weaponId
     * @param callback
     */
    upgradeWeapon: function (weaponId, callback) {
        console.info("upgradeWeapon==-",playerData.getWeaponLevelById(weaponId));
        console.info("weaponId==-",weaponId);
        this.bcl.callContractFunction({
            nameOrId: this.upgradeContract,
            functionName: 'equipment_upgrade',//["1",1000001,'COCOS']
            valueList:[weaponId, playerData.getWeaponLevelById(weaponId)],////
            callback:function(res){
                
            }
        }).then(function(res){
            console.info("upgrade res",JSON.stringify(res));

            if (callback) {
                if (res.code === 1) {
                    callback(null, res);
                } else {
                    callback(res.message, res);
                }
            }
        }).catch(function(e){
            console.info("upgradeWeapon error-==",JSON.stringify(e));
        });
    },

    
    isPC: function() {
        const userAgentInfo = navigator.userAgent;
        const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
        let flag = true;
        for (const v of Agents) {
          if (userAgentInfo.indexOf(v) > 0) {
            flag = false;
            break;
          }
        }
        return flag;
    }
});

let bcxAdapter = new BCXAdpater();
bcxAdapter.start();
module.exports = bcxAdapter;