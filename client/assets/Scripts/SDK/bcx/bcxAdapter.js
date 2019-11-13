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

var SERVER_URL = "http://shooter.cocosbcx.net/plane"; //服务器地址
if (cc.game.config.debugMode === cc.debug.DebugMode.INFO) {
    SERVER_URL = "http://127.0.0.1:3000";
}
console.log('>>>>>>>>cc.game.config.debugMode='+cc.game.config.debugMode);
console.log('>>>>>>>>SERVER_URL='+SERVER_URL);

// import BCX from 'bcx.min.js' 
require('./core.min')

require('./plugins.min')

//cocos配置
var _configParams = {
    ws_node_list:[
        {url:"ws://test.cocosbcx.net",name:"Cocos - China - Beijing"},   
     ],
     networks:[
        {
            core_asset:"COCOS",
            chain_id:"c1ac4bb7bd7d94874a1cb98b39a8a582421d03d022dfa4be8c70567076e03ad0" 
        }
     ], 
    faucet_url:"http://test-faucet.cocosbcx.net",
    auto_reconnect:true,
    real_sub:true,
    check_cached_nodes_data:false
    };


let BCXAdpater = cc.Class({

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        //console.info("window=1=",window.BcxWeb);
    },

    initSDK (callback) {
        this.isLoginBcl = false;
        this.account = null;
        this.userId = null;
        this.privateKey = null;
        this.contractName = "contract.ccshooter.lottery";         //合约名称
        this.upgradeContract = "contract.ccshooter.upgrade";  //升级的合约
        
        if (window.BcxWeb) {
            this.bcl =  window.BcxWeb;
            console.log("===bcl---")
            if (callback) {
                callback(null);
            }
        }else{
            
            console.log("===bcl--cocos-")
            let self = this
            self.bcl = new BCX(_configParams);
            Cocosjs.plugins(new CocosBCX())
            //connect pc-plugin between sdk
            Cocosjs.cocos.connect('My-App').then(connected => {
                console.log("connected=="+connected)
                if (!connected) {
                    //检测一下注入
                    self.checkWindowBcx(function(is_success){
                        console.log("is_success==",is_success)
                        if(is_success){
                            if (callback) {
                                console.log("is_success==222")
                                callback(null)
                            }
                        }else{
                            //此时基本可以认定没有cocospay 给用户提示
                            cc.gameSpace.showTips(cc.gameSpace.text.no_cocos_pay);
                        }
                    })
                    return false
                }

                //此时走的是coocspay客户端
                const cocos = Cocosjs.cocos
                self.bcl = cocos.cocosBcx(self.bcl);

                if (callback) {
                    callback(null);
                }
            }).catch(function(e){
                console.log("connect error---"+JSON.stringify(e))
            })

        }
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

    login(callback){
        if(this.bcl){
            try{
                console.log("login===adada=")
                this.bcl.getAccountInfo().then(res => {
                    console.log("res.account_name=="+res.account_name)
                    this.bcl.account_name = res.account_name
                    playerData.account =res.account_name
                    if (callback) {
                        callback(null);
                    }
                })
            }catch(e){
                console.log("login==e===="+e)
                console.log("his.bcl.account_name==="+this.bcl.account_name)
                if(this.bcl.account_name){
                    playerData.account = this.bcl.account_name
                    if (callback) {
                        callback(null);
                    }
                }
            }
            
        }
    },

    checkWindowBcx(callback){
        //目前进来的时候可能还没有吧bcx挂在window 需要个定时器
        let check_count = 0
        let self = this
        let sdk_intervral = setInterval(function(){
            console.log("checkWindowBcx",window.BcxWeb)
            if (window.BcxWeb){
                self.bcl = window.BcxWeb
                if(callback){
                    callback(true)
                }
                clearInterval(sdk_intervral);
            }
           
            if(check_count>=3){
                
                clearInterval(sdk_intervral);
                if(callback){
                    callback(false)
                }
            }
            check_count = check_count + 1


        }, 1000);
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
                res.data.COCOS = Number(res.data.COCOS)
                playerData.gold = res.data.COCOS 
                //console.info('playerData.gold==',playerData.gold);
            }

            callback(err, res);
        });
    },

    getBalanceByAccount (account, callback) {
        this.bcl.queryAccountBalances({
            assetId:'COCOS',
            account: account,
        
        }).then(function(res){
            console.info('getBalanceByAccount==',res);

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
        });
    },

    /**
     * 读取当前用户账户下所有可在对应游戏中使用的道具
     * @param callback
     */
    getItems: function (callback) {
        this.bcl.queryAccountNHAssets({
            account: playerData.account,
            worldViews: ['CCShooter'],
            page: 1,
            pageSize: 1000,
        }).then(function(res){
            console.log("res-getItems--"+JSON.stringify(res));

            //更新playerData里头的道具列表
            if (res.code == 1) {
                playerData.goods = res.data;
                callback(null, res);
            } else {
                callback(res.message, res);
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
            feeAssetId:'COCOS',
            memo: memo,
            onlyGetFee: false,
        }).then(function(res){
            if (res.code == 1) {
                callback(null, res);
            } else {
                callback(res.message, res);
            }
        })
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
            console.log("reqStartGame=")
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
                otcAccount:"otcaccount",
                orderFee:fee,
                NHAssetId:itemId,
                price:price,
                priceAssetId:'COCOS',
                expiration:expiration,
                memo:memo,
            }
        ).then(function(res){
            console.info('creatNHAssetOrder result',res);
            if (callback) {
                if (res.code === 1) {
                    callback(null, res);
                } else {
                    callback(res.message, res);
                }
            }
        })
    },

    cancelGameItemOrder:function(orderId, callback){
        this.bcl.cancelNHAssetOrder({
            orderId:orderId,
        }).then(function(res){
            console.info("cancelNHAssetOrder res",res);

            if (callback) {
                if (res.code === 1) {
                    callback(null, res);
                } else {
                    callback(res.message, res);
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
        }).then(function(res){
            console.info('res goodsSelling==',res);
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
        });
    },

    /**
     * 根据道具id查询道具详细信息
     * @param arrItemId
     * @param callback
     */
    queryGameItemInfo: function (arrItemId, callback) {
        console.info("arrItemId==-",arrItemId);
        this.bcl.queryNHAssets({
            NHAssetIds: arrItemId,
        }).then(function(res){
            if(res.code === 1){
                callback(null, res);
            } else {
                callback(res.message, res);
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