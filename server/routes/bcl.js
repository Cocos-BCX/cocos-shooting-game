var express = require('express');
var router = express.Router();
var bclLibs = require('./../libs/bcx.min');
var async = require('async');

var BclLogic = function () {
    this.account = null;
    this.isLoginBcl = false;
    this.userId = null;
    this.init();
};

var BOMB_KEY = "bomb";          //炸弹key值
var WEAPON_KEY = "weapon";      //武器key值
var EMPLOYEE_KEY = "Employee";      //员工key值
var CONTRACT_NAME = "contract.ccshooter.lottery";         //合约名称

var CREATE_NUM = 30;        //一次性创建30个
var MIN_NUM = 10;           //小于10个开始创建
var MIN_LOTTERY_BOMB = 10;  //抽奖炸弹数量最少是10个

var bclService = BclLogic.prototype;

bclService.init = function () {
    var _configParams={
        default_ws_node:"ws://47.93.62.96:8049",
        ws_node_list:[
            {url:"ws://39.106.126.54:8049",name:"COCOS3.0节点2"},
            {url:"ws://47.93.62.96:8049",name:"COCOS3.0节点1"}
        ],
        networks:[{
            core_asset:"COCOS",
            chain_id:"b9e7cee4709ddaf08e3b7cba63b71c211c845e37c9bf2b865a7b2a592c8adb28" 
        }], 
        faucet_url:"http://47.93.62.96:8041",
        auto_reconnect:true,
        check_cached_nodes_data:false                     
    }

    this.arrLotteryBomb = [];
    this.arrLotteryWeapon = [];
    this.arrEmploy = [];

    var _this = this;
    this.count = 0;
    this.bcl = new BCX(_configParams);
    this.bcl.init({
        callback: function (res) {
        console.log('init finish:', res);
        _this.login();

    }});

    // this.bclCreate = new BlockChainLib(_configParams);
    // this.bclCreate.init(function (res) {
    //     // this.bcl.passwordLogin({
    //     //     account: "fly2018",
    //     //     password: "123456",
    //     //     callback: function (res) {
    //     //         console.info("bcl passwordLogin res",res);
    //     //     }
    //     // });
    //
    //     console.log('create init finish:', res);
    //     _this.loginCreate();
    //
    // });
};

bclService.startCheckTimer = function() {
    //启动定时器，每隔N秒扫描下物品是否充足，不充足则补货
    if (this.checkTimer) {
        clearInterval(this.checkTimer);
    }

    var _this = this;
    this.checkTimer = setInterval(function () {
        _this.getItem();
    }, 300*1000); //每5分钟检查一次
};

bclService.login = function() {
    var _this = this;
    this.bcl.passwordLogin({account: 'ccshooter', password:'bcx12345',  callback: function (result) {
        _this.account = null;
        if (result.code === 1) {
            _this.isLoginBcl = true;
            _this.account = result.data.account_name;
            _this.userId = result.data.account_id;

            _this.getItem();

            _this.startCheckTimer();

            //注册为开发者
            // _this.bcl.registerGameDeveloper({
            //     callback:function (res) {
            //         console.log('registerGameDeveloper:', res);
            //     }
            // });
            //
            // _this.bcl.createGameVersion({
            //     versionName: 'CCShooter',
            //     callback: function (res) {
            //         console.log('createGameVersion:', res);
            //     }
            // })

            // _this.createContract();
        }
        console.log('login result', result);
    }});
};

// bclService.loginCreate = function() {
//     var _this = this;
//     this.bcl.privateKeyLogin({privateKey: '5JJJWSYUgSjFgNPJ1B2SaVRPgxK2ZeKSkAJAL6f5dsWA3jJfKJP', callback: function (result) {
//
//         if (result.code === 1) {
//             _this.isLoginBclCreate = true;
//         }
//         console.log('login create result', result);
//     }});
// };

bclService.getItem = function () {
    var _this = this;
    console.error(this.account);
    this.bcl.queryAccountNHAssets({
        account: this.account,
        versions: ['CCShooter'],
        page: 1,
        pageSize: 1000,
        callback: function (res) {
            //更新playerData里头的道具列表
            if (res.code === 1) {
                _this.goods = res.data;

                console.log('item count:', _this.goods.length);
                _this.checkItem();
                _this.checkLotteryReward();
            } else {
                console.error('get items error:', res);
            }
        }
    });
};

bclService.putAllRewardToContract = function () {
    var arrBomb = [];
    var arrWeapon = [];
    var arrEmploy = [];
    this.goods.forEach(function (item) {
        var itemData = JSON.parse(item.base_describe);
        if (itemData.type === BOMB_KEY && itemData.isLottery) {
            arrBomb.push(item.id);
        } else if (itemData.type === WEAPON_KEY && itemData.isLottery) {
            arrWeapon.push(item.id);
        } else if (itemData.type === EMPLOYEE_KEY && itemData.isLottery) {
            arrEmploy.push(item.id);
        }
    }, this);

    var isNeedUpdate = false;
    if (this.arrLotteryBomb.length !== arrBomb.length) {
        isNeedUpdate = true;
    } else {
        //检查每个元素是否都一样，若是不一样也需要更新
        for (var idx = 0; idx < this.arrLotteryBomb.length; idx++) {
            var item = this.arrLotteryBomb[idx];
            if (arrBomb.indexOf(item) === -1) {
                isNeedUpdate = true;
                break;
            }
        }
    }

    if (!isNeedUpdate) {
        if (this.arrLotteryWeapon.length !== arrWeapon.length) {
            isNeedUpdate = true;
        } else {
            //检查每个元素是否都一样，若是不一样也需要更新
            for (var idxWeapon = 0; idxWeapon < this.arrLotteryWeapon.length; idxWeapon++) {
                if (arrWeapon.indexOf(this.arrLotteryWeapon[idxWeapon]) === -1) {
                    isNeedUpdate = true;
                    break;
                }
            }
        }
    }

    if (!isNeedUpdate) {
        if (this.arrEmploy.length !== arrEmploy.length) {
            isNeedUpdate = true;
        } else {
            //检查每个元素是否都一样，若是不一样也需要更新
            for (var idxEmployee = 0; idxEmployee < this.arrEmploy.length; idxEmployee++) {
                if (arrEmploy.indexOf(this.arrEmploy[idxEmployee]) === -1) {
                    isNeedUpdate = true;
                    break;
                }
            }
        }
    }

    if (isNeedUpdate) {
        var _this = this;
        async.waterfall([
            function (cb) {
                _this.putRewardToContract(1, arrBomb, function (res) {
                    cb(null, res);
                });
            },
            function (err, cb) {
                _this.putRewardToContract(2, arrWeapon, function (res) {
                    cb(null, res);
                });
            },
            function (err, cb) {
                _this.putRewardToContract(3, arrEmploy, function (res) {
                    cb(null, res);
                });
            }
        ], function (err, cb) {

        });

        // this.putRewardToContract(1, arrBomb, function (res) {
        //     _this.putRewardToContract(2, arrWeapon);
        // });

        this.arrLotteryBomb = arrBomb;
        this.arrLotteryWeapon = arrWeapon;
        this.arrEmploy = arrEmploy;
    }
};

bclService.checkLotteryReward = function () {
    if (this.isCreating) {
        //如果正在创建则不执行检查
        return;
    }

    if (!this.goods) {
        this.goods = [];
    }

    var cntLotteryBomb = 0;
    var cntWeapon = 0;
    var cntEmployee = 0;
    this.goods.forEach(function (item) {
        var itemData = JSON.parse(item.base_describe);
        if (itemData.type === BOMB_KEY && itemData.isLottery) {
            cntLotteryBomb++;
        } else if (itemData.type === WEAPON_KEY && itemData.isLottery) {
            cntWeapon++;
        } else if (itemData.type === EMPLOYEE_KEY && itemData.isLottery) {
            cntEmployee++;
        }
    });

    console.log('cnt lottery bomb:', cntLotteryBomb);
    console.log('cnt lottery weapon:', cntWeapon);
    console.log('cnt lottery employee:', cntEmployee);

    var _this = this;
    if (cntLotteryBomb < MIN_LOTTERY_BOMB) {
        //直接去创建用于存放的
        this.isCreating = true;

        console.log("lottery bomb creating...");
        this.createItem(JSON.stringify({
            type: BOMB_KEY,
            desc: "clear anything",
            name: "炸弹",
            icon: "bomb.png",
            attached: ++this.count,
            isLottery: true
        }), function (res) {
            console.log("create lottery bomb result:", res);
            _this.isCreating = false;

            //然后将所有的通过合约放入奖池中
            if (res.code === 1) {
                //创建成功，将奖品放入奖池
                // var arrItems = [];
                // for (var idx = 0; idx < res.data.length; idx++) {
                //     arrItems.push(res.data[idx].result);
                // }
                //
                // _this.putRewardToContract(1, arrItems);
                _this.getItem();
            }
        }, CREATE_NUM);
    }

    if (!this.isCreating && cntWeapon < MIN_LOTTERY_BOMB) {
        this.isCreating = true;

        console.log("lottery weapon creating...");
        this.createItem(JSON.stringify({
            type: WEAPON_KEY,
            desc: "weapon",
            name: "武器架",
            icon: "weapon.png",
            attached: ++this.count,
            isLottery: true
        }), function (res) {
            console.log("create lottery weapon result:", res);
            _this.isCreating = false;

            //然后将所有的通过合约放入奖池中
            if (res.code === 1) {
                //创建成功，将奖品放入奖池
                // var arrItems = [];
                // for (var idx = 0; idx < res.data.length; idx++) {
                //     arrItems.push(res.data[idx].result);
                // }
                //
                // _this.putRewardToContract(2, arrItems);

                _this.getItem();
            }
        }, CREATE_NUM);
    }

    if (!this.isCreating && cntEmployee < MIN_LOTTERY_BOMB) {
        this.isCreating = true;

        console.log("lottery employee creating...");
        this.createItem(JSON.stringify({
            type: EMPLOYEE_KEY,
            employeeId:551,
            level:1,
            star:1,
            quality:40,
            icon:"card_551.png",
            name:"宫崎骏",
            attr1:46,
            attr2:30,
            attr3:30,
            attr4:46,
            attr5:35,
            attr6:33,
            isLottery: true
        }), function (res) {
            console.log("create lottery employee result:", res);
            _this.isCreating = false;

            //然后将所有的通过合约放入奖池中
            if (res.code === 1) {
                //创建成功，将奖品放入奖池
                // var arrItems = [];
                // for (var idx = 0; idx < res.data.length; idx++) {
                //     arrItems.push(res.data[idx].result);
                // }
                //
                // _this.putRewardToContract(2, arrItems);

                _this.getItem();
            }
        }, CREATE_NUM);
    }

    if (!this.isCreating) {
        //表示均不需要创建，则更新下奖池
        this.putAllRewardToContract();
    }
};

bclService.checkItem = function () {
    //检查炸弹剩余数量，不够就去创建
    if (!this.goods) {
        this.goods = [];
    }

    var cntBomb = 0;
    this.goods.forEach(function (item) {
        var itemData = JSON.parse(item.base_describe);
        if (itemData.type === BOMB_KEY && !itemData.isLottery) {
            cntBomb++;
        }
    });

    console.log('cnt bomb:', cntBomb);

    if (cntBomb < MIN_NUM) {
        //小于5个道具，就去创建10个
        if (this.isCreating) {
            return;
        }

        this.isCreating = true;

        this.createBomb();
    }

};

bclService.createBomb = function () {
    console.log('create bomb...');
    var _this = this;
    this.createItem(JSON.stringify({
        type: BOMB_KEY,
        desc: "clear anything",
        name: "炸弹",
        icon: "bomb.png",
        attached: ++this.count,
    }), function (res) {
        console.log("create bomb result:", res);
        // if (res.code === 1) {
        //     //将炸弹信息加入到内存中
        //     _this.goods.push(res.data);
        // }
        _this.isCreating = false;
        _this.getItem();
    }, CREATE_NUM);
};

bclService.createItem = function (data, callback, count) {
    if (typeof (count) === "undefined") {
        count = 1;
    }

    this.bcl.creatNHAsset({
        worldView: "CCShooter",
        assetId: "COCOS",
        baseDescribe: data,
        ownerAccount: "ccshooter",
        NHAssetsCount: count,
        callback: function (res) {
            console.log(res);

            callback(res);
        }
    });
};

bclService.getBombItemAndDelete = function () {
    var idxFind = -1;
    for (var idx = 0; idx < this.goods.length; idx++) {
        var itemData = JSON.parse(this.goods[idx].base_describe);
        if (itemData.type === BOMB_KEY && !itemData.isLottery) {
            idxFind = idx;
        }
    }

    if (idxFind === -1) {
        return null;
    }

    return this.goods.splice(idxFind, 1)[0];
};

bclService.transferGameItem = function (itemId, who, cb) {
    var _this = this;
    console.info("transferGameItem:",itemId, who);
    this.bcl.transferNHAsset({
        toAccount:who,
        NHAssetIds:[itemId],
        type: 0,
        callback:function(res){
            console.info("transferGameItem",res);
            cb(res);


            _this.checkItem();
        }
    })
};

//原有的转账使用的是先创建一批等待使用，现在修改为需要就创建，免得出现问题
bclService.reqCreateBomb = function (req, res) {
    //先创建道具
    var item = this.getBombItemAndDelete();
    if (!item) {
        res.send({code: 3001, statusText: 'lack of item!'});
        return;
    }

    //再将道具转给指定玩家
    this.transferGameItem(item.id, req.params.user, function (retInfo) {
        if (retInfo.code !== 1) {
            res.send({code: retInfo.code, statusText: retInfo.message});
        } else {
            res.send({code: 200});
        }
    });

    // res.send('create bomb');

};

bclService.reqTransToGamer = function (req, response) {
    console.info('reqTransToGamer==='+this.account);
    console.info('reqTransToGamer==='+req.query.to);
    console.info('reqTransToGamer==='+req.query.token);
    this.bcl.transferAsset({
        fromAccount: this.account,
        toAccount:req.query.to,//query.to,
        amount:req.query.token,//query.token,
        assetId:"COCOS",
        memo:req.query.comment,
    }).then(function(res){
        console.info('bcl transferAsset',res);
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.write(JSON.stringify(res));
        response.end();
    }).catch(function(e){
        console.info('bcl error-',JSON.stringify(e));
    })
};

/**
 * 创建合约，一般执行一次就可以了
 */
bclService.createContract = function () {
    var fs = require('fs');
    var buff = fs.readFileSync('./../contract/lottery.lua');
    var contractContent = buff.toString('utf-8');

    var _this = this;
    this.bcl.createContract({
        name: CONTRACT_NAME,
        data: contractContent,
        authority: 'COCOS8HcqoXK26ydqPiWmuj2Ws8JgKTC5hibnKcPFHTjQ4g9xzNMtJq',
        callback:function(res){
            console.info("contract_create res:",res);

            if (res.code === 1) {
                _this.initContract();
            }
        }
    });
};

/**
 * 合约初始化，一般执行一次就可以了
 */
bclService.initContract = function () {
    this.bcl.callContractFunction({
        nameOrId: CONTRACT_NAME,
        functionName: 'init',//["1",1000001,'COCOS']
        valueList:[],////
        callback:function(res){
            console.info("initContract res",res);
        }
    });
};

/**
 * 将奖励放至奖池中
 */
bclService.putRewardToContract = function (type, itemIds, callback) {
    console.log('putRewardToContract: ', JSON.stringify((itemIds)));
    this.bcl.callContractFunction({
        nameOrId: CONTRACT_NAME,
        functionName: 'put_reward',//["1",1000001,'COCOS']
        valueList:[type, JSON.stringify(itemIds)],////
        callback:function(res){
            console.info("putReward res",res);

            if (callback) {
                callback(res);
            }
        }
    });
};

// bclService.reqCreateBomb = function (req, response) {
//     var _this = this;
//     this.createItem(JSON.stringify({
//         type: BOMB_KEY,
//         desc: "clear anything",
//         name: "炸弹",
//         icon: "bomb.png",
//         attached: ++this.count,
//     }), function (res) {
//         console.log("create bomb result:", res);
//
//         if(res.code==1){
//             _this.transferGameItem(res.trxData.result_id, req.params.user, function (retInfo) {
//                 if (retInfo.code !== 1) {
//                     response.send({code: retInfo.code, statusText: retInfo.message});
//                 } else {
//                     response.send({code: 200});
//                 }
//             });
//         }else{
//             // response.writeHead(200, { "Content-Type": "text/plain" });
//             // response.write(JSON.stringify(res));
//             // response.end();
//
//             response.send(res);
//         }
//     });
//
// };

var bclObj = new BclLogic();

router.all('/bomb', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

/* GET users listing. */
router.get('/bomb/:user', function(req, res, next) {
    //创建炸弹
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    bclObj.reqCreateBomb(req, res);
});

router.get('/money', function(req, res, next) {
    console.log("money--d---")
    //创建炸弹
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    bclObj.reqTransToGamer(req, res);
});

router.get('/test', function(req, res, next) {
    console.log("test--d---")
    //创建炸弹
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    res.send("ffaaddfa==");
});

router.get('/bomb', function (req, res) {
     res.send("hahaha");
});


module.exports = router;
