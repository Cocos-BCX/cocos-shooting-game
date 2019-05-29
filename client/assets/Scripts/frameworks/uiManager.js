// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const clientEvent = require('clientEvent');
const constants = require('constants');
const resourceUtil = require('resourceUtil');
const poolManager = require('poolManager');

const SHOW_STR_INTERVAL_TIME = 800;
const TAG_TIPS_ACTION = 10000;

let UIManager = cc.Class({

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.dictSharedPanel = {};
        this.dictLoading = {};

        this.arrPopupDialog = [];
        this.showTipsTime = 0;
    },

    regEvent () {
        //显示单例界面
        var _this = this;
        clientEvent.on('showSharedDialog', function() {
            let panelPath = arguments[0];
            let scriptName = arguments[1];
            let args = [];
            for (let idx = 2; idx < arguments.length; idx++) {
                args.push(arguments[idx]);
            }

            _this.showSharedDialog(panelPath, scriptName, args);
        });

        clientEvent.on('hideSharedDialog', (panelPath) => {
            this.hideSharedDialog(panelPath);
        });

        clientEvent.on('pushToPopupSeq', this.pushToPopupSeq, this);
        clientEvent.on('popFromPopupSeq', this.popFromPopupSeq, this);
    },

    /**
     * 显示单例界面
     * @param {String} panelPath 
     * @param {String} scriptName 
     * @param {Array} args 
     */
    showSharedDialog (panelPath, scriptName, args) {
        if (this.dictLoading[panelPath]) {
            return;
        }

        if (!args) {
            args = [];
        }

        if (this.dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this.dictSharedPanel[panelPath];
            if (cc.isValid(panel)) {
                panel.parent = cc.find("Canvas");
                panel.active = true;
                let script = panel.getComponent(scriptName);
                if (script.show) {
                    script.show.apply(script, args);
                }
                
                return;
            }
        }

        this.dictLoading[panelPath] = true;
        resourceUtil.createUI(panelPath, (err, node)=> {
            //判断是否有可能在显示前已经被关掉了？
            let isCloseBeforeShow = false;
            if (!this.dictLoading[panelPath]) {
                //已经被关掉
                isCloseBeforeShow = true;
            }

            this.dictLoading[panelPath] = false;
            if (err) {
                console.error(err);
                return;
            }

            node.zIndex = constants.ZORDER.DIALOG;
            this.dictSharedPanel[panelPath] = node;

            let script = node.getComponent(scriptName);
            if (script.show) {
                script.show.apply(script, args);
            }

            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.hideSharedDialog(panelPath);
            }
        });
    },

    /**
     * 隐藏单例界面
     * @param {String} panelPath 
     */
    hideSharedDialog (panelPath) {
        if (this.dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this.dictSharedPanel[panelPath];
            panel.parent = null;
        }

        this.dictLoading[panelPath] = false;
    },

    /**
     * 将弹窗加入弹出窗队列
     * @param {string} panelPath 
     * @param {string} scriptName 
     * @param {*} param 
     */
    pushToPopupSeq (panelPath, scriptName, param) {
        let popupDialog = {
            panelPath: panelPath,
            scriptName: scriptName,
            param: param,
            isShow: false
        };

        this.arrPopupDialog.push(popupDialog);

        this.checkPopupSeq();
    },

    /**
     * 将弹窗从弹出窗队列中移除
     * @param {string} panelPath 
     */
    popFromPopupSeq (panelPath) {
        if (this.arrPopupDialog[0].panelPath === panelPath) {
            this.arrPopupDialog.shift();

            this.checkPopupSeq();
        }
    },

    /**
     * 检查当前是否需要弹窗
     */
    checkPopupSeq () {
        if (this.arrPopupDialog.length > 0) {
            let first = this.arrPopupDialog[0];

            if (!first.isShow) {
                clientEvent.dispatchEvent('showSharedDialog', first.panelPath, first.scriptName, first.param);
                this.arrPopupDialog[0].isShow = true;
            }
        }
    },

    /**
     * 显示提示
     * @param {String} content 
     * @param {Function} cb 
     */
    showTips (content, cb) {
        var now = Date.now();
        if (now - this.showTipsTime < SHOW_STR_INTERVAL_TIME) {
            var spareTime = SHOW_STR_INTERVAL_TIME - (now - this.showTipsTime);
            setTimeout(function (tipsLabel, callback) {
                this._showTipsAni(tipsLabel, callback);
            }.bind(this, content, cb), spareTime);

            this.showTipsTime = now + spareTime;
        } else {
            this._showTipsAni(content, cb);
            this.showTipsTime = now;
        }
    },

    /**
     * 内部函数
     * @param {String} content 
     * @param {Function} cb 
     */
    _showTipsAni (content, cb) {
        //todo 临时添加方案，后期需要将这些代码移到具体界面
        resourceUtil.getUIPrefabRes('common/tips', function (err, prefab) {
            if (err) {
                return;
            }

            let tipsNode = poolManager.getNode(prefab, cc.find("Canvas"));

            tipsNode.zIndex = constants.ZORDER.TIPS;
            tipsNode.setPosition(cc.v2(0, 100));
            tipsNode.opacity = 255;
            tipsNode.stopActionByTag(TAG_TIPS_ACTION);
            
            let txtLabel = tipsNode.getChildByName("txtValue").getComponent(cc.RichText);
            txtLabel.maxWidth = 0;
            txtLabel.string = content;

            //修改底图大小
            let width = txtLabel._linesWidth;
            if (width.length && width[0] < 500) {
                txtLabel.maxWidth = width[0];
            } else {
                txtLabel.maxWidth = 500;
                txtLabel.node.setContentSize(500, txtLabel.node.getContentSize().height);
            }

            let size = txtLabel.node.getContentSize();
            if (!cc.isValid(size)) {//size不存在，自我销毁
                // tipsNode.destroy();
                poolManager.putNode(tipsNode);
                return;
            }
            tipsNode.setContentSize(size.width + 136 < 240 ? 240 : size.width + 136, size.height + 50);
            let delayAction = cc.delayTime(0.8);
            let moveByAction = cc.moveBy(0.8, cc.v2(0, 150));
            let fadeAction = cc.fadeOut(0.8);
            let recycleAction = cc.callFunc((node)=>{
                poolManager.putNode(node);
            }, this);
            var seqAction;
            if (cb) {
                seqAction = cc.sequence(delayAction, moveByAction, delayAction, fadeAction,
                    cc.callFunc(cb), recycleAction);
            } else {
                seqAction = cc.sequence(delayAction, moveByAction, delayAction, fadeAction, recycleAction);
            }

            seqAction.setTag(TAG_TIPS_ACTION);
            tipsNode.runAction(seqAction);
        });
    },

    showLoading (tips, cb) {
        this.showSharedDialog('common/loading', 'loading', [tips, cb]);
    },

    hideLoading () {
        this.hideSharedDialog('common/loading');
    },

    /**
     * 在指定位置显示获取金币的效果
     * @param {cc.Vex2} worldPos 
     * @param {Number} value 
     * @param {Function} cb 
     */
    showGetMoneyTips (worldPos, value, cb) {
        resourceUtil.createUI('common/getTips', function (err, tipsNode) {
            if (err) {
                return;
            }

            let posTips = tipsNode.parent.convertToNodeSpaceAR(worldPos);
            tipsNode.setPosition(posTips);
            let str = '+' + value;
            let color = cc.Color.GREEN;
            if (value < 0) {
                str = value;
                color = cc.Color.RED;
            }

            let nodeTxtValue = tipsNode.getChildByName("txtValue");
            nodeTxtValue.color = color;
            nodeTxtValue.getComponent(cc.Label).string = str;
            tipsNode.setScale(0);
            
            var scaleAction = cc.scaleTo(0.5, 1).easing(cc.easeBackInOut());
            var delayAction = cc.delayTime(0.5);
            // var moveByAction = cc.moveBy(0.8, cc.v2(0, 150));
            var fadeAction = cc.fadeOut(0.8);
            // var spawnAction = cc.spawn(moveByAction, fadeAction);
            var seqAction;
            if (cb) {
                seqAction = cc.sequence(scaleAction, delayAction, fadeAction,
                    cc.callFunc(cb), cc.removeSelf(true));
            } else {
                seqAction = cc.sequence(scaleAction, delayAction, fadeAction, cc.removeSelf(true));
            }

            tipsNode.runAction(seqAction);
        });
    },

    // update (dt) {},
});


var uiManager = new UIManager();
uiManager.start();
module.exports = uiManager;