 // Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const i18n = require('LanguageData');
cc.Class({
    extends: cc.Component,

    properties: {
        btn_table:cc.Node,
        select_table:cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initLanguageText();
        this.btn_table.on('touchend',this.openSelectTable,this);
        this.arrow = this.btn_table.getChildByName('arrow');
        this.language_text = this.btn_table.getChildByName('language_text');
        this.zh_bg = this.select_table.getChildByName('zh_bg');
        this.en_bg = this.select_table.getChildByName('en_bg');
        this.zh_text_btn =  this.select_table.getChildByName('zh_text_btn');
        this.en_text_btn =  this.select_table.getChildByName('en_text_btn');
        this.zh_text_btn.on('touchend',this.switchZhEndCallBack,this.zh_text_btn);
        this.en_text_btn.on('touchend',this.switchEnEndCallBack,this.en_text_btn);
        this.select_table.active = false;
        this.checkCurLanguage();
        this.open_select = false;
    },
    checkCurLanguage:function(){
        var type = cc.sys.localStorage.getItem('language');
        if(type){

        }else{
            cc.sys.localStorage.setItem('language',0);
            type = 0;
        }
        this.setCurLanguage(type);

    },
    setCurLanguage:function(type){
        var languge_str = ''
        if(type == 1){
            i18n.init('en');
            languge_str = 'English';
            this.en_bg.active = false;
            this.zh_bg.active = true;
            cc.gameSpace.text=this.text_en;

        }else{
            i18n.init('zh');
            languge_str = '简体中文';
            this.en_bg.active = true;
            this.zh_bg.active = false;
            cc.gameSpace.text=this.text;

        }
        this.language_text.getComponent(cc.Label).string = languge_str;

        i18n.updateSceneRenderers();

    },
    openSelectTable :function(){
        if(this.open_select){
            this.open_select = false;
        }else{
            this.open_select = true;
        }
        if(this.open_select){
            this.arrow.rotation = 0;
        }else{
            this.arrow.rotation = 180;
        }
        this.select_table.active = this.open_select;

    },
    switchEnEndCallBack:function(event){
        var target = event.target;
        var _this = target.parent.parent.getComponent('select_prefab');
      
        cc.sys.localStorage.setItem('language',1);
        _this.setCurLanguage(1);
        _this.openSelectTable();
    },
    switchZhEndCallBack:function(event){

        var target = event.target;
        var _this = target.parent.parent.getComponent('select_prefab');
      
        cc.sys.localStorage.setItem('language',0);
        _this.setCurLanguage(0);
        _this.openSelectTable();
    },

    initLanguageText:function(){
        this.text={
            lottery_nocoin : '代币数量不足',
            executing:'正在执行',
            contract:'合约',
            bomb:'炸弹',
            weapon:'武器',
            Incorrect_data:'该商品数据有误',
            cancel_sell:'取消出售中',
            cancel_success:'取消成功',
            gongqijun:'宫崎骏',
            unselected:'未选择',
            need_to_pay:'需要支付',
            cocos_coins:'Cocos币',
            registering:'正在注册中',
            account_null:'账号不能为空',
            password_null:'密码不能为空',
            privatekey_null:'私钥不能为空',
            submit_data:'正在提交数据中',
            success_rewards:'奖励发放成功',
            logining:'登录中...',
            Requesting_info:'正在请求战场信息',
            deduct_Coin:'扣除Cocos币',
            success:'成功',
            enter_battlefield:'正在进入战场',
            loading_main:'登录成功，正在加载主场景',
            register_loading:'注册成功，正在加载主场景',
            in_the_list:'挂单中',
            refreshing:'刷新中',
            loading:'加载中',
            paying:'正在支付中',
            getting_key:'获取私钥中',
            prive_error:'输入价格有误',
            time_expiration_error:'输入过期时间有误',
            time_max:'挂单时间最多只能72小时',
            password_confirm_error:'密码与确认密码不同',
            strengthen_success:'强化成功',
            success_list:'挂单成功',
            login_fail:'登陆失败',
            no_cocos_pay:'您没有安装cocospay 请下载',
        }
        this.text_en={
            lottery_nocoin : 'Insufficient tokens',
            executing:'Executing',
            contract:'contract',
            bomb:'Bomb',
            weapon:'Weapon',
            Incorrect_data:'Incorrect commodity data',
            cancel_sell:'Cancellation of sale',
            cancel_success:'Cancel Success',
            gongqijun:'Hayao Miyazaki',
            unselected:'unselected',
            need_to_pay:'Need to pay',
            cocos_coins:'Cocos coins',
            registering:'Registering ',
            account_null:'Account cannot be empty',
            password_null:'Password cannot be empty',
            privatekey_null:'Private key cannot be empty',
            submit_data:'Data being submitted',
            success_rewards:'Successful rewards',
            logining:'Logging in...',
            Requesting_info:'Requesting battlefield information',
            deduct_Coin:'Deduct Cocos Coin',
            success:'Successfull',
            enter_battlefield:'Entering the battlefield',
            loading_main:'Login successfully, loading the main scenario',
            register_loading:'Register successfully,, loading the main scenario',
            in_the_list:'In the list',
            refreshing:'Refreshing',
            loading:'loading',
            paying:'Payment in progress',
            getting_key:'Getting the private key',
            prive_error:'Input Price Error',
            time_expiration_error:'Error in input expiration time',
            time_max:'Pending orders can only be 72 hours at most.',
            password_confirm_error:'Password is different from confirmation password',
            strengthen_success:'Successfull strengthen',
            success_list:'Successful listing',
            login_fail:'login fail',
            no_cocos_pay:'You have not installed cocospay please download',










        }
    }



   

    // update (dt) {},
});
