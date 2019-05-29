// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

/**
 * 对象池管理类
 */
let PoolManager = cc.Class({
    // LIFE-CYCLE CALLBACKS:

    start () {
        this.dictPool = {};
    },

    /**
     * 根据预设从对象池中获取对应节点
     * @param {cc.prefab} prefab 
     */
    getNode (prefab, parent) {
        let name = prefab.name;
        let node = null;
        if (this.dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            let pool = this.dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = cc.instantiate(prefab);
            }
        } else {
            //没有对应对象池，创建他！
            let pool = new cc.NodePool();
            this.dictPool[name] = pool;

            node = cc.instantiate(prefab);
        }

        node.parent = parent;
        return node;
    },

    /**
     * 将对应节点放回对象池中
     * @param {cc.Node} node 
     */
    putNode (node) {
        let name = node.name;
        let pool = null;
        if (this.dictPool.hasOwnProperty(name)) {
            //已有对应的对象池
            pool = this.dictPool[name];
        } else {
            //没有对应对象池，创建他！
            pool = new cc.NodePool();
            this.dictPool[name] = pool;
        }

        pool.put(node);
    },

    /**
     * 根据名称，清除对应对象池
     * @param {string} name 
     */
    clearPool (name) {
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            pool.clear();
        }
    },

    // update (dt) {},
});

var poolManager = new PoolManager();
poolManager.start();
module.exports = poolManager;
