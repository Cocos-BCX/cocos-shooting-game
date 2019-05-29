// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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

        spSelect: cc.Sprite,
        lbValue: cc.Label,
        nodeNo: cc.Node,
        spItem: cc.Sprite,

        imgCocos: cc.SpriteFrame,
        imgBomb: cc.SpriteFrame,
        imgWeapon: cc.SpriteFrame,
        imgEmployee: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start: function() {

    },

    setInfo: function (info) {
        this.nodeNo.active = false;
        switch (info.type) {
            case "money":
                this.lbValue.string = 'X ' + info.amount;
                this.spItem.spriteFrame = this.imgCocos;
                //由于尺寸不同，导致每一种都需要专门设置对应的大小
                this.spItem.node.width = 80;
                this.spItem.node.height = 73;
                break;
            case "bomb":
                this.lbValue.string = 'X ' + info.amount;
                this.spItem.spriteFrame = this.imgBomb;
                this.spItem.node.width = 64;
                this.spItem.node.height = 82;
                break;
            case "weapon":
                this.lbValue.string = 'X ' + info.amount;
                this.spItem.spriteFrame = this.imgWeapon;
                this.spItem.node.width = 90;
                this.spItem.node.height = 90;
                break;
            case "no":
                this.spItem.spriteFrame = null;
                this.lbValue.string = '';
                this.nodeNo.active = true;
                break;
            case "employee":
                this.spItem.spriteFrame = this.imgEmployee;
                this.spItem.node.width = 181;
                this.spItem.node.height = 167;
                this.lbValue.string = 'X '  + info.amount;
                break;
        }
    },

    getIconWorldPos: function () {
        return this.spItem.node.convertToWorldSpaceAR(cc.v2(0, 0));
    },

    setSelect: function (isSelect) {
        this.spSelect.enabled = isSelect;
    }

    // update (dt) {},
});
