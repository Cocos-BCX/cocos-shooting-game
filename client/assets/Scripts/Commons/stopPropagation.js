/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * 防止二级界面事件穿透
 * Created by daisy on 2017/3/1.
 */
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {

    },

    onEnable: function () {
        this.node.on('touchstart', function (event) {
            event.stopPropagation();
        });

        this.node.on('touchend', function (event) {
            event.stopPropagation();
        });

        this.node.on('touchmove', function (event) {
            event.stopPropagation();
        });

        this.node.on('touchcancel', function (event) {
            event.stopPropagation();
        });

        this.node.on('mousedown', function (event) {
            event.stopPropagation();
        });

        this.node.on('mouseenter', function (event) {
            event.stopPropagation();
        });

        this.node.on('mousemove', function (event) {
            event.stopPropagation();
        });

        this.node.on('mouseleave', function (event) {
            event.stopPropagation();
        });

        this.node.on('mouseup', function (event) {
            event.stopPropagation();
        });

        this.node.on('mousewheel', function (event) {
            event.stopPropagation();
        });
    },

    onDisable: function () {
        this.node.off('touchstart', function (event) {
            event.stopPropagation();
        });

        this.node.off('touchend', function (event) {
            event.stopPropagation();
        });

        this.node.off('touchmove', function (event) {
            event.stopPropagation();
        });

        this.node.off('touchcancel', function (event) {
            event.stopPropagation();
        });

        this.node.off('mousedown', function (event) {
            event.stopPropagation();
        });

        this.node.off('mouseenter', function (event) {
            event.stopPropagation();
        });

        this.node.off('mousemove', function (event) {
            event.stopPropagation();
        });

        this.node.off('mouseleave', function (event) {
            event.stopPropagation();
        });

        this.node.off('mouseup', function (event) {
            event.stopPropagation();
        });

        this.node.off('mousewheel', function (event) {
            event.stopPropagation();
        });
    }
});
