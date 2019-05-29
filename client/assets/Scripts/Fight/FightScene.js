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

        player: cc.Node,
        bulletGroup: cc.Node,
        mapObjGroup: cc.Node,
        enemyGroup: cc.Node,
        bossGroup: cc.Node,
        itemGroup: cc.Node,
        effectGroup: cc.Node,

        levelUpNode: cc.Node,
        fightUINode: cc.Node,

        mapObjPrefab: cc.Prefab,  //地图物件预设
        speedScale: 1,              //
        bgSpeed: 5,

        enemySmall: cc.Prefab,
        enemyMedium: cc.Prefab,
        enemyBig: cc.Prefab,
        bossPrefab: cc.Prefab,

        itemPrefab: cc.Prefab,
        bulletPrefab: cc.Prefab,

        damageEffectNode: cc.Node,

        arrMap: [cc.Node]       //地图元素
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function () {
        cc.debug.setDisplayStats(false);

        var winSize = cc.winSize;
        if (winSize.width > winSize.height) {
            this.node.getComponent(cc.Canvas).fitHeight = true;
        }

        var manager = cc.director.getCollisionManager();
        manager.enabled = true;

        this.bombTmp = 0;   //内存中炸弹获取数量，结算时再去创建道具
        this.level = 1;
        this.dropBombNum = 0;
        this.gameStageOver = false;
        this.isGameOver = false;

        this.bulletPool = new cc.NodePool();
        this.enemySmallPool = new cc.NodePool();
        this.enemyMediumPool = new cc.NodePool();
        this.enemyBigPool = new cc.NodePool();
        this.bossPool = new cc.NodePool();
        this.itemPool = new cc.NodePool();
        this.mapObjPool = new cc.NodePool();
        var initCount = 5;
        for (var i = 0; i < initCount; i++) {
            var mapObj = cc.instantiate(this.mapObjPrefab);
            this.mapObjPool.put(mapObj);
        }

        this.regEvent();

        this.fightPlayer = this.player.getComponent("FightPlayer");
        this.fightPlayer.setFightScene(this);

        this.bgBigFrameTime = 0;
        this.bgLowFrameTime = 0;
        this.bgLineFrameTime = 0;
        this.speedScale = 1;

        this.initGame();

        this.preloadRes();
    },

    regEvent: function () {
        this.node.on(constants.FIGHT_EVENT.UPDATE_TOUCH_POS, this.onTouchPosChange, this);
        this.node.on(constants.FIGHT_EVENT.RELEASE_BOMB, this.onReleaseBomb, this);
    },

    preloadRes: function () {
        //提前加载战斗结算界面
        cc.loader.loadRes("prefabs/ui/gameOver", cc.Prefab, function (err, prefab) {

        });
    },

    initGame: function () {
        this.totalScore = 0; //总分数
        this.allCandyNum = 0;   //总共获得的糖果数

        //2s后才开始创建敌人
        this.scheduleOnce(function () {
            this.create();
        }, 2);

    },

    create: function () {
        var levelTime = playerData.info.GameData[this.level - 1];

        //创建敌机
        this.schedule(this.createEnemy, levelTime.enemy_num / 1000);

        //创建道具
        this.schedule(this.createItem, 10);

        //创建boss
        this.scheduleOnce(this.createBoss, levelTime.boss_num / 1000);

        //创建candy
        this.schedule(this.createCandy, 5);

        //创建gold
        this.scheduleOnce(this.createGold, 25);
    },

    unCreate: function () {
        this.unschedule(this.createEnemy);
        this.unschedule(this.createItem);
        this.unschedule(this.createBoss);
        this.unschedule(this.createCandy);
        this.unschedule(this.createGold);
    },

    createEnemy: function () {
        var type = 0;
        if (this.level === 1) {
            type = Math.random() > 0.95?1:0;
        } else if(this.level == 2){
            type = Math.random() > 0.75?1:0;
        } else if(this.level == 3){
            type = Math.random() > 0.55?1:0;
        }

        var enemyNode =this.getEnemy(type);
        enemyNode.getComponent("FightEnemy").initInfo(this);
    },

    createItem: function () {
        var item = this.getItem();
        var itemScript = item.getComponent("FightItem");
        var type = Math.floor(Math.random()*2);
        itemScript.initInfo(type, null, this);
    },

    createBoss: function () {
        if (this.bossObj) {
            this.bossObj = null;
        }

        this.bossObj = this.getBoss();
        var bossScript = this.bossObj.getComponent("FightBoss");
        bossScript.initInfo(this.level, this);
    },

    createCandy: function () {
        if (this.allCandyNum >= playerData.info.candy) {
            return;
        }

        var item = this.getItem();
        var itemScript = item.getComponent("FightItem");
        itemScript.initInfo(constants.ITEM_TYPE.CANDY, null, this);
    },

    createGold: function () {
        var item = null;
        var itemScript = null;
        var worldPos = null;
        var i = 0;
        var randomType = Math.ceil(Math.random()*2);
        if (randomType === 1) {
            for (let i = 0; i < 10; i++) {
                item = this.getItem();
                itemScript = item.getComponent("FightItem");
                worldPos = null;
                if (i <= 5) {
                    worldPos = cc.v2(i*120, cc.winSize.height + i*80);
                } else {
                    worldPos = cc.v2((10-i)*120, cc.winSize.height + i*80);
                }
                itemScript.initInfo(constants.ITEM_TYPE.CANDY, worldPos, this);
            }
        } else if (randomType === 2) {
            for (let i = 0; i < 10; i++) {
                item = this.getItem();
                itemScript = item.getComponent("FightItem");
                worldPos = null;
                if (i <= 5) {
                    worldPos = cc.v2((5-i)*120, cc.winSize.height + i*80);
                } else {
                    worldPos = cc.v2((i - 5)*120, cc.winSize.height + i*80);
                }
                itemScript.initInfo(constants.ITEM_TYPE.CANDY, worldPos, this);
            }
        } else {
            for (let i = 0; i < 5; i++) {
                item = this.getItem();
                itemScript = item.getComponent("FightItem");
                worldPos = cc.v2((5-i)*120, cc.winSize.height + i*80);
                itemScript.initInfo(constants.ITEM_TYPE.CANDY, worldPos, this);

                item = this.getItem();
                itemScript = item.getComponent("FightItem");
                worldPos = cc.v2(i*120, cc.winSize.height + i*80);
                itemScript.initInfo(constants.ITEM_TYPE.CANDY, worldPos, this);
            }
        }
    },

    getBullet: function () {
        var bullet = null;
        if (this.bulletPool.size() > 0) {
            bullet = this.bulletPool.get();
        } else {
            bullet = cc.instantiate(this.bulletPrefab);
        }

        bullet.parent = this.bulletGroup;

        return bullet;
    },

    putBullet: function (bulletNode) {
        this.bulletPool.put(bulletNode);
    },

    getMapObj: function () {
        var mapObj = null;
        if (this.mapObjPool.size() > 0) {
            mapObj = this.mapObjPool.get();
        } else {
            mapObj = cc.instantiate(this.mapObjPrefab);
        }

        mapObj.parent = this.mapObjGroup;
        mapObj.getComponent("FightMapObj").setFightScene(this);

        return mapObj;
    },

    putMapObj: function (mapObjNode) {
        this.mapObjPool.put(mapObjNode);
    },

    getEnemy: function (type) {
        var enemyPool = null;
        var enemyFlyPrefab = null;
        switch (type) {
            case 0:
                enemyPool = this.enemySmallPool;
                enemyFlyPrefab = this.enemySmall;
                break;
            case 1:
                enemyPool = this.enemyMediumPool;
                enemyFlyPrefab = this.enemyMedium;
                break;
            case 2:
                enemyPool = this.enemyBigPool;
                enemyFlyPrefab = this.enemyBig;
                break;
        }

        var enemyObj = null;
        if (enemyPool.size() > 0) {
            enemyObj = enemyPool.get();
        } else {
            enemyObj = cc.instantiate(enemyFlyPrefab);
        }

        enemyObj.parent = this.enemyGroup;

        return enemyObj;
    },

    putEnemy: function (type, node) {
        var enemyPool = null;
        switch (type) {
            case 0:
                enemyPool = this.enemySmallPool;
                break;
            case 1:
                enemyPool = this.enemyMediumPool;
                break;
            case 2:
                enemyPool = this.enemyBigPool;
                break;
        }

        if (enemyPool) {
            enemyPool.put(node);
        }
    },

    getBoss: function () {
        var bossObj = null;
        if (this.bossPool.size() > 0) {
            bossObj = this.bossPool.get();
        } else {
            bossObj = cc.instantiate(this.bossPrefab);
        }

        bossObj.parent = this.bossGroup;

        return bossObj;
    },

    putBoss: function (node) {
        this.bossPool.put(node);
    },

    getItem: function () {
        var itemObj = null;
        if (this.itemPool.size() > 0) {
            itemObj = this.itemPool.get();
        } else {
            itemObj = cc.instantiate(this.itemPrefab);
        }

        itemObj.parent = this.itemGroup;

        return itemObj;
    },

    putItem: function (item) {
        this.itemPool.put(item);
    },

    onTouchPosChange: function (event) {
        var pos = event.pos;

        var posNode = this.node.convertToNodeSpaceAR(pos);

        if (event.type === cc.Node.EventType.TOUCH_END || event.type === cc.Node.EventType.TOUCH_CANCEL) {
            this.fightPlayer.moveToPos(null);
        } else {
            this.fightPlayer.moveToPos(cc.v2(posNode.x, posNode.y + 100));
        }
    },

    onReleaseBomb: function (event) {
        //释放爆炸效果
        resourceUtil.createEffect("timeBoom", this.effectGroup, function (err, effectNode) {
            resourceUtil.playEffect(effectNode, function () {
                this.clearEnemy();
                this.clearBullet();
            }, this, true);
        }, this);
    },

    pause: function () {
        cc.director.getScheduler().pauseTarget(this);

        window.isPauseFight = true;

        if (this.bossObj && this.bossObj.isValid) {
            var boss = this.bossObj.getComponent("FightBoss");
            cc.director.getScheduler().pauseTarget(boss);
        }
    },

    resume: function () {
        cc.director.getScheduler().resumeTarget(this);

        window.isPauseFight = false;

        if (this.bossObj && this.bossObj.isValid) {
            var boss = this.bossObj.getComponent("FightBoss");
            cc.director.getScheduler().resumeTarget(boss);
        }
    },

    update: function(dt) {
        if (window.isPauseFight) {
            return;
        }

        this.updateMap();
        this.updateMapObj();
    },

    updateMap: function () {
        var speed = 1;
        if (this.speedScale !== 1) {
            speed = 2;
        }

        for (var idx = 0; idx < this.arrMap.length; idx++) {
            var mapNode = this.arrMap[idx];

            mapNode.y = mapNode.position.y - speed;
        }

        for (var idxChk = 0; idxChk < this.arrMap.length; idxChk++) {
            var checkNode = this.arrMap[idxChk];
            var pos = checkNode.position;
            if (pos.y <= -cc.winSize.height/2 - mapNode.height / 2 - 100) {
                //已经超过最低边界，将位置调整到上面
                var lastIndex = idxChk - 1;
                lastIndex = lastIndex < 0 ? this.arrMap.length - 1: lastIndex;
                var preNode = this.arrMap[lastIndex];
                checkNode.y = preNode.position.y + checkNode.height;
                break;
            }
        }

    },

    updateMapObj: function () {
        this.bgLowFrameTime ++;
        this.bgBigFrameTime ++;
        this.bgLineFrameTime ++;
        // if (this.bgLowFrameTime >= 200) {
        //     this.bgLowFrameTime = 0;
        //
        //     var mapObjLow = this.getMapObj();
        //     mapObjLow.getComponent("FightMapObj").initInfo("Low", 10*this.speedScale, false);
        // }

        if (this.bgBigFrameTime >= 500) {
            this.bgBigFrameTime = 0;

            var mapObjBig = this.getMapObj();
            mapObjBig.getComponent("FightMapObj").initInfo("Big", this.speedScale, false);
        }

        var lineNum = 100;
        if (this.speedScale !== 1) {
            lineNum = 5;
        }

        if (this.bgLineFrameTime >= lineNum) {
            this.bgLineFrameTime = 0;
            var mapObjLine = this.getMapObj();
            mapObjLine.getComponent("FightMapObj").initInfo("Line", 15, false);
        }
    },

    dropPackage: function (enemyType, worldPos) {
        var type = constants.ITEM_TYPE.CANDY;
        if (enemyType === 1) {
            type = Math.ceil(Math.random() * 100) < 2 ? constants.ITEM_TYPE.LIFE_UP:constants.ITEM_TYPE.CANDY;
        }

        var item = this.getItem();
        var itemScript = item.getComponent("FightItem");
        itemScript.initInfo(type, worldPos, this);
    },

    dropBomb: function (worldPos) {
        var item = this.getItem();
        var itemScript = item.getComponent("FightItem");
        itemScript.initInfo(constants.ITEM_TYPE.BOMB, worldPos, this);
    },

    onEnemyKilled: function (type, worldPos) {
        var score = 10;
        var isDropCandy = false;
        if (type === 1) {
            score = 50;
        } else if (type === 0) {
            //概率掉落糖果等
            var randomDrop = Math.ceil(Math.random()*2);
            if(randomDrop == 1 && this.allCandyNum < playerData.info.candy){
                this.dropPackage(type, worldPos);
                isDropCandy = true;
            } else {

            }
        }

        if (!isDropCandy) {
            //没有掉落代币的情况下，概率掉落炸弹
            var percent = 60;
            if (this.dropBombNum <= 0) {
                percent = 20; //如果还没有掉落过，概率为20只掉落一只，掉落过的，概率变为正常值
            }

            var dropRatio = Math.floor(Math.random()*percent);

            if (dropRatio <= type) {
                //表示击中概率，掉落炸弹
                this.dropBombNum++;
                this.dropBomb(worldPos);
            }
        }

        this.addScore(score);
    },

    onBossKilled: function (bossNode) {
        var bossPos = bossNode.position;
        for(let i = 0; i < 10; i++){
            var pos = cc.v2(cc.winSize/2 - 60, bossPos.y + i*60);
            this.dropBossPackage(pos);
            pos = cc.v2(cc.winSize/2+60, bossPos.y + i*60);
            this.dropBossPackage(pos);
        }

        bossNode.removeFromParent();
        this.putBoss(bossNode);
        this.addScore(this.level * 1000);
        this.speedUp();
    },

    onPlayerKilled: function () {
        cc.gameSpace.uiManager.showSharedDialog('relife', 'relife', [this]);
    },

    dropBossPackage: function (pos) {
        var item = this.getItem();

        var worldPos = cc.v2(pos.x, pos.y + cc.winSize.height / 2);
        var itemScript = item.getComponent("FightItem");
        itemScript.initInfo(constants.ITEM_TYPE.CANDY, worldPos, this);
    },

    clearEnemy: function () {
        var arrTmp = [];
        for (let i = 0; i < this.enemyGroup.children.length; i++) {
            arrTmp.push(this.enemyGroup.children[i]);
        }


        for (let i = 0; i < arrTmp.length; i++) {
            var enemy = arrTmp[i].getComponent("FightEnemy");
            enemy.loseHP(enemy.hp);
        }
    },

    clearBullet: function () {
        var arrTmp = [];
        for (let i = 0; i < this.bulletGroup.children.length; i++) {
            arrTmp.push(this.bulletGroup.children[i]);
        }

        for (let i = 0; i < arrTmp.length; i++) {
            var bullet = arrTmp[i].getComponent("FightBullet");
            bullet.recover();
        }
    },

    speedUp: function () {
        this.clearEnemy();

        for (let i = 0; i < this.itemGroup.children.length; i++) {
            var item = this.itemGroup.children[i].getComponent("FightItem");
            item.flyToPlayer(this.player);
        }

        this.clearBullet();

        this.unCreate();
        this.gameStageOver = true;
        this.speedScale = 10;
        this.bgLineFrameTime = 0;

        if (this.level === 3) {
            this.scheduleOnce(function () {
                this.speedScale = 1;
                this.bgLineFrameTime = 0;
                this.isSuccess = true;

                this.showGameOver();
            }, 3);
        } else {
            this.fightPlayer.playFlyAni(cc.v2(0, 0), 3, true);

            this.scheduleOnce(this.speedDown, 6);
            this.scheduleOnce(function () {
                //显示关卡升级
                cc.gameSpace.audioManager.playSound("levelup", false);
                this.levelUpNode.active = true;
                var seqAction = cc.sequence(cc.moveTo(3, 0, 200).easing(cc.easeOut(3.0)),
                    cc.moveTo(1, 0, -1000).easing(cc.easeOut(3.0)), cc.callFunc(function () {
                        this.levelUpNode.y = 800;
                        this.levelUpNode.active = false;
                    }, this));

                this.levelUpNode.runAction(seqAction);
            }, 3);
        }
    },

    speedDown: function () {
        this.bossObj = null;
        this.gameStageOver = false;
        this.speedScale = 1;
        this.bgLineFrameTime = 0;
        this.create();
        this.level ++;      //TODO 此处逻辑有点奇怪，先创建再加关卡，变成第一关又打一遍，
        this.createGold();
    },

    addCandy: function () {
        this.allCandyNum++;
        this.node.emit(constants.FIGHT_EVENT.UPDATE_CANDY, {
            value: this.allCandyNum
        });
    },

    addScore: function (score) {
        this.totalScore += score;
        this.node.emit(constants.FIGHT_EVENT.UPDATE_SCORE, {
            value: this.totalScore
        });
    },

    reLife: function () {
        //将所有敌人及子弹清除
        this.clearEnemy();
        this.clearBullet();
        this.fightPlayer.reLife();

        this.node.emit(constants.FIGHT_EVENT.UPDATE_LIFE, {
            value: this.fightPlayer.hp
        });
    },

    onPickupBomb: function () {
        this.bombTmp++;

        this.node.emit(constants.FIGHT_EVENT.UPDATE_BOMB, {

        });
    },

    playDamageEffect: function () {
        this.damageEffectNode.active = true;
        var ani = this.damageEffectNode.getComponent(cc.Animation);
        ani.play();
    },

    //显示战斗报告
    showGameOver: function () {
        cc.gameSpace.uiManager.showSharedDialog('gameOver', 'gameOver', [this.allCandyNum, this.bombTmp, this.totalScore, this]);
    },

    clear: function () {
        this.player.destroy();

        //将特效做清除操作
        var arrEnemy = _.clone(this.enemyGroup.children);
        for (let i = 0; i < arrEnemy.length; i++) {
            var enemy = arrEnemy[i];
            enemy.getComponent("FightEnemy").clear();
            enemy.destroy();
        }

        //
        var arrEffects = _.clone(this.effectGroup.children);
        for (var idx = 0; idx < arrEffects.length; idx++) {
            var effect = arrEffects[idx];
            effect.getComponent(cc.Animation).stop();

            effect.destroy();
        }

        var arrBoss = _.clone(this.bossGroup.children);
        for (let i = 0; i < arrBoss.length; i++) {
            var boss = arrBoss[i];
            boss.destroy();
        }

        this.clearBullet();
    },
    
    exitFightScene: function () {
        this.clear();

        this.resume();

        //切换至开始场景
        cc.director.loadScene("start");

        // cc.director.getScheduler().setTimeScale(1);
    }
});
