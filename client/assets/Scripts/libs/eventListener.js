var oneToOneListener = cc.Class({
    ctor: function () {
        this.supportEvent = null;
    },

    on: function (eventName, handler, target) {
        this[eventName] = { handler: handler, target: target };
    },

    off: function (eventName, handler) {
        var oldObj = this[eventName];
        if (oldObj && oldObj.handler && oldObj.handler === handler) {
            this[eventName] = null;
        }
    },

    dispatchEvent: function (eventName/**/) {
        if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
            cc.error("please add the event into clientEvent.js");
            return;
        }

        var objHandler = this[eventName];
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (objHandler.handler) {
            objHandler.handler.apply(objHandler.target, args);
        } else {
            cc.log("not register " + eventName + "    callback func");
        }
    },

    setSupportEventList: function (arrSupportEvent) {
        if (!(arrSupportEvent instanceof Array)) {
            cc.error("supportEvent was not array");
            return false;
        }
        
        this.supportEvent = {};
        for (var i in arrSupportEvent) {
            var eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }

        return true;
    }
});

var oneToMultiListener = cc.Class({
    ctor: function () {
        this.handlers = {};
        this.supportEvent = null;   //支持的事件列表
    },

    on: function (eventName, handler, target) {
        var objHandler = {handler: handler, target: target};
        var handlerList = this.handlers[eventName];
        if (!handlerList) {
            handlerList = [];
            this.handlers[eventName] = handlerList;
        }

        for (var i = 0; i < handlerList.length; i++) {
            if (!handlerList[i]) {
                handlerList[i] = objHandler;
                return i;
            }
        }

        handlerList.push(objHandler);

        return handlerList.length;
    },

    off: function (eventName, handler, target) {
        var handlerList = this.handlers[eventName];

        if (!handlerList) {
            return;
        }

        for (var i = 0; i < handlerList.length; i++) {
            var oldObj = handlerList[i];
            if (oldObj.handler === handler && (!target || target === oldObj.target)) {
                handlerList.splice(i, 1);
                break;
            }
        }
    },

    dispatchEvent: function (eventName/**/) {
        if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
            cc.error("please add the event into clientEvent.js");
            return;
        }

        var handlerList = this.handlers[eventName];

        var args = [];
        var i;
        for (i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        if (!handlerList) {
            return;
        }

        for (i = 0; i < handlerList.length; i++) {
            var objHandler = handlerList[i];
            if (objHandler.handler) {
                objHandler.handler.apply(objHandler.target, args);
            }
        }
    },

    setSupportEventList: function (arrSupportEvent) {
        if (!(arrSupportEvent instanceof Array)) {
            cc.error("supportEvent was not array");
            return false;
        }

        this.supportEvent = {};
        for (var i in arrSupportEvent) {
            var eventName = arrSupportEvent[i];
            this.supportEvent[eventName] = i;
        }

        return true;
    },
});

var eventListener = {
    getBaseClass: function (type) {
        var newEventListener = {};

        if (type === "multi") {
            newEventListener = oneToMultiListener;
        } else {
            newEventListener = oneToOneListener;
        }

        // newEventListener.init();

        return newEventListener;
    }
};

module.exports = eventListener;