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
var playerData = require("playerData");
var resourceUtil = require("resourceUtil");

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
        fightScene: cc.Node,
        nodeHead: cc.Node,

        txtScore: cc.Label,
        txtLife: cc.Label,
        txtCandy: cc.Label,
        headIcon: cc.Sprite,
        txtName: cc.Label,
        spFrame: cc.Sprite,

        txtBomb: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function () {
        this.regEvent();
        this.fightSceneScript = this.fightScene.getComponent("FightScene");

        this.txtLife.string = "X " + this.fightSceneScript.fightPlayer.hp;

        var currentPilot = playerData.getCurrentPilot();
        if (currentPilot) {
            this.nodeHead.active = true;

            var itemData = JSON.parse(currentPilot.base_describe);

            var _this = this;
            resourceUtil.getPilotIcon(itemData['icon'], function (err, spriteFrame) {
                if (!err && cc.isValid(_this.headIcon)) {
                    _this.headIcon.spriteFrame = spriteFrame;
                }
            });

            this.txtName.string = itemData["name"];
        }

        this.refreshBomb();
    },

    regEvent: function () {
        this.fightScene.on(constants.FIGHT_EVENT.UPDATE_SCORE, this.updateScore, this);
        this.fightScene.on(constants.FIGHT_EVENT.UPDATE_LIFE, this.updateLife, this);
        this.fightScene.on(constants.FIGHT_EVENT.UPDATE_CANDY, this.updateCandy, this);
        this.fightScene.on(constants.FIGHT_EVENT.UPDATE_BOMB, this.updateBomb, this);

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    },

    updateScore: function (event) {
        this.txtScore.string = "SCORE: " + event.value;
    },

    updateLife: function (event) {
        this.txtLife.string = "X " + event.value;
    },

    updateCandy: function (event) {
        this.txtCandy.string = "X " + event.value;
    },

    updateBomb: function (event) {
        this.refreshBomb();
    },
    
    onTouchStart: function (event) {
        this.emitTouchPos(event);
    },
    
    onTouchMove: function (event) {
        this.emitTouchPos(event);
    },
    
    onTouchEnd: function (event) {
        this.emitTouchPos(event);
    },

    onTouchCancel: function (event) {
        this.emitTouchPos(event);
    },

    onBombClick: function () {
        cc.gameSpace.audioManager.playSound("click", false);

        if (window.isPauseFight) {
            return;
        }

        var bombTmpCnt = this.fightSceneScript.bombTmp;
        var boomId = null;
        if (bombTmpCnt > 0) {
            this.fightSceneScript.bombTmp --;
        } else {
            if (!playerData.costBomb()) {
                return;
            }
        }

        this.refreshBomb();

        //使用道具，通知战斗场景释放特效
        this.fightScene.emit(constants.FIGHT_EVENT.RELEASE_BOMB, {

        });
    },

    refreshBomb: function () {
        var bombs = playerData.getBomb();
        var tmp = this.fightSceneScript.bombTmp;
        this.txtBomb.string = bombs.length + tmp;
    },

    emitTouchPos: function (event) {
        var pos = event.getLocation();
        this.fightScene.emit(constants.FIGHT_EVENT.UPDATE_TOUCH_POS, {
            pos: pos,
            type: event.type
        });
    }

    // update (dt) {},
});
