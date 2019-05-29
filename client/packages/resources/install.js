'use strict';

var child_process = require("child_process");
var fs = require('fs');

var InstallProc = function () {
    // body...
    this.nodePath = '';
    this.cnpmPath = '';
    this.curDir = __dirname;
};

var installHandler = InstallProc.prototype;

//开始执行安装
installHandler.start = function () {
    var _this = this;

    //TODO 目前由于不想使用第三方库如async等，所以写成如下方式，后续可以考虑引入promise
    // this.getNodePath(function(error, path) {
    //     if (error) {
    //         console.error(error);
    //         return;
    //     }

    //     _this.getCNpmPath(function (error, path) {
    //         if (error) {
    //             console.error(error);
    //             return;
    //         }

    //         _this.saveConfig (function (error, data) {
    //             if (error) {
    //                 console.error(error);
    //                 return;
    //             }

    //             console.info ('install finished!');
    //         });
    //     });
    // });

    var start = new Promise(function (resolve, reject) {
        console.log('install start...');
        resolve();
    });

    start.then(this.getNodePath.bind(this))
        .then(this.getCNpmPath.bind(this))
        .then(this.saveConfig.bind(this))
        .then(function (ret) {
            console.log('install finished!');
        }).catch(function(reason) {
            console.error('install failed, reason:', reason);
        });
};

//获得node的路径
installHandler.getNodePath = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.execCmd("which node", function (err, stdout, stderr) {
            if (err) {
                reject("get node path failed, reason", err, stderr);
                return;
            }

            _this.nodePath = stdout.slice(0, stdout.length - 1);
            resolve(stdout);
        });
    });
};

//获得cnpm路径
installHandler.getCNpmPath = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this.execCmd("which cnpm", function (err, stdout, stderr) {
            if (err) {
                reject("get cnpm path failed, reason", err, stderr);
                return;
            }

            _this.cnpmPath = stdout.slice(0, stdout.length - 1);;
            resolve(stdout);
        });
    });
};

//生成配置文件
installHandler.saveConfig = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var objConfig = {};
        objConfig.node = _this.nodePath;
        objConfig.cnpm = _this.cnpmPath;

        fs.writeFile(_this.curDir + "/resource.conf", JSON.stringify(objConfig), function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

installHandler.execCmd = function (cmd, callback) {
    console.log('execCmd ' + cmd + ' start');
    child_process.exec(cmd, { cwd: __dirname }, function (error, stdout, stderr) {
        console.log('execCmd ' + cmd + ' over');

        if (error) {
            console.info('stderr : ' + stderr);
            callback(error, stdout, stderr);
            return;
        }

        callback(null, stdout, stderr);
    });
};

var installProgram = new InstallProc();
installProgram.start();