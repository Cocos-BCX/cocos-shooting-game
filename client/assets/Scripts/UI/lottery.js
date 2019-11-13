// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var bcxAdapter = require('bcxAdapter');
var resourceUtil = require('resourceUtil');
var playerData = require('playerData');
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

        arrRewardNode: [cc.Node],

        pfRewardItem: cc.Prefab,

        nodeTurnable: cc.Node,  //转盘用来旋转的

        btnStart: cc.Button,

        lbGold: cc.Label,

        nodeCocosIcon: cc.Node,

        imgWeapon: cc.SpriteFrame,
        imgBomb: cc.SpriteFrame,
        imgEmployee: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    ctor: function () {
        this.dictReward = {};
        this.arrRewardData = [
            {"type": "no", "amount": 0},
            {"type": "money", "amount": 80},
            {"type": "bomb", "amount": 1},
            {"type": "money", "amount": 120},
            {"type": "bomb", "amount": 2},
            {"type": "money", "amount": 200},
            {"type": "weapon", "amount": 1},
            {"type": "money", "amount": 300},
            {"type": "employee", "amount": 1},
            {"type": "money", "amount": 400}
        ];
    },

    start: function() {
        this.lbGold.string = '刷新中';
        this.gold = 0;
    },

    show () {
        cc.gameSpace.hideLoading();
    },

    onEnable: function () {
        this.refreshUI();
    },

    refreshUI: function () {
        //刷新COCOS币
        this.refreshGold();

        this.initReward();
    },

    refreshGold: function () {
        var _this = this;
        if(playerData.gold){
            _this.lbGold.string = playerData.gold
        }

        bcxAdapter.getBalance(function (err, result) {
            if (err) {
                cc.gameSpace.showTips(err);
            } else {
                _this.gold = result.data.COCOS.toFixed(1);
                _this.lbGold.string = result.data.COCOS.toFixed(1);
            }
        });
    },

    initReward: function() {
        for (var idx = 0; idx < this.arrRewardNode.length; idx++) {
            var parentNode = this.arrRewardNode[idx];
            var rewardItem = this.dictReward[idx];
            if (!this.dictReward.hasOwnProperty(idx)) {
                rewardItem = cc.instantiate(this.pfRewardItem);
                rewardItem.parent = parentNode;
                this.dictReward[idx] = rewardItem;
            }

            if (this.arrRewardData.length > idx) {
                var info = this.arrRewardData[idx];

                var script = rewardItem.getComponent('LotteryItem');
                script.setInfo(info);
            }
        }
    },
    
    onBtnCloseClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        this.node.destroy();
    },
    
    onBtnLotteryClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        if (this.gold < 100) {
            cc.gameSpace.showTips( cc.gameSpace.text.lottery_nocoin);
            return;
        }

        //将原有的重置掉
        for (var keyName in this.dictReward) {
            this.dictReward[keyName].getComponent("LotteryItem").setSelect(false);
        }

        this.btnStart.interactable  = false
        //开始抽奖
        cc.gameSpace.showLoading(cc.gameSpace.text.executing+' ' + bcxAdapter.contractName +' '+cc.gameSpace.text.contract+'...');
        var _this = this;
        bcxAdapter.lottery(function (err, res) {
            cc.gameSpace.hideLoading();
            //解析数据返回
            if (!err) {
                //模拟金币减100
                _this.gold -= 100;
                _this.lbGold.string = _this.gold;


                var arrAffect = res.data[0].contract_affecteds;
                for (var idx = 0; idx < arrAffect.length; idx++) {
                    if (arrAffect[idx].type === "contract_affecteds_log") {
                        var text = arrAffect[idx].raw_data.message;
                        var key = "##result##:";
                        var idxFind = text.indexOf(key);
                        if (idxFind !== -1) {
                            var jsonStr = text.slice(idxFind + key.length);
                            var dataObj = JSON.parse(jsonStr);

                            _this.randValue = Number(dataObj.pos) - 1;
                            _this.rewardType = dataObj.draw;
                            _this.rewardValue = Math.ceil(Number(dataObj.amount));
                            _this.startRun();
                            break;
                        }
                    }
                }
            } else {
                _this.refreshGold();
            }

        });
    },

    startRun: function() {
        //先开始第一轮，根据当前度数，将其旋转至360度
        var targetRotation = 360;
        this.nodeTurnable.angle = this.nodeTurnable.angle % 360;
        var offset = 360 - this.nodeTurnable.angle;
        // arrActions.push(cc.rotateTo(offset/360, targetRotation));

        var randTimes = 3 + Math.floor(Math.random() * 4);
        var rotationAction = cc.rotateTo(offset/360 + randTimes * 0.5, -(targetRotation + randTimes * 360 + 360 -this.randValue * 36)).easing(cc.easeCircleActionOut());
        var seqAction = cc.sequence(rotationAction, cc.callFunc(function(){
            this.showReward();
            this.btnStart.interactable  = true
        }, this));

        this.nodeTurnable.runAction(seqAction);
    },

    showReward: function () {
        var lotteryItem = this.dictReward[this.randValue].getComponent("LotteryItem");
        lotteryItem.setSelect(true);
        var worldPos = lotteryItem.getIconWorldPos();
        switch (this.rewardType) {
            case "money":
                this.showFlyReward(function () {
                    this.refreshGold();
                }, this);
                break;
            case "bomb":
                this.showItemReward(this.imgBomb, worldPos, function () {
                    // this.refreshItem();
                }, this);
                break;
            case "weapon":
                this.showItemReward(this.imgWeapon, worldPos, function () {
                    this.refreshItem();
                }, this);
                break;
            case "employee":
                this.showItemReward(this.imgEmployee, worldPos, function () {
                    this.refreshItem();
                }, this);
                break;
            case "no":
                this.refreshGold();
                break;
        }
    },

    refreshItem: function () {
        //刷新道具，，调用startScene的接口
        bcxAdapter.getItems(function (err, res) {
            if (!err) {
                //道具信息
                var startScene = cc.find("Canvas").getComponent("startScene");
                if (startScene) {
                    startScene.refreshChangeBtn();
                }
            }
        });



    },

    showItemReward: function (spriteFrame, worldPos, callback, target) {
        var _this = this;
        resourceUtil.createEffectWithPath('UI/showReward/showReward', null, function(err, node) {
            if (err) {
                if (callback) {
                    callback.apply(target, [err, node]);
                }
                return;
            }

            var nodePos = node.parent.convertToNodeSpaceAR(worldPos);
            node.position = nodePos;
            node.zIndex = 100;
            node.getChildByName('texture').getComponent(cc.Sprite).spriteFrame = spriteFrame;
            var ani = node.getComponent(cc.Animation);
            ani.on('finished', function () {
                node.destroy();

                if (callback) {
                    callback.apply(target);
                }
            }, _this);

            ani.play('showReward');
        });
    },

    showFlyReward: function(callback, target) {
        var _this = this;
        resourceUtil.createUI('flyReward', function(err, node) {
            if (err) {
                if (callback) {
                    callback.apply(target);
                }
                return;
            }

            node.zIndex = 100;
            var rewardScript = node.getComponent('flyReward');
            rewardScript.setInfo(_this.nodeCocosIcon.convertToWorldSpaceAR(cc.v2(0, 0)));
            rewardScript.setEndListener(callback, target);
        });
    },



    // update (dt) {},
});
