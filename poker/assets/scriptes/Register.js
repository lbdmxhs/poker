// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Loading = require("Loading");
var ButAnimation = require("ButAnimation");
var Title = require("Title");
var Alert = require("Alert");
var UnitTools = require("UnitTools");
var NetUtil = require("NetUtil");
var GlobalData = require("GlobalData");
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
        authCodeBut:{
            default:null,
            type:cc.Sprite 
        },
        registerBut:{
            default:null,
            type:cc.Sprite 
        },
        phoneNumberEditbox:{
            default:null,
            type:cc.EditBox 
        },
        passwordEditbox:{
            default:null,
            type:cc.EditBox 
        },
        confirmPasswordEditbox:{
            default:null,
            type:cc.EditBox 
        },
        verifyCodeEditbox:{
            default:null,
            type:cc.EditBox 
        },
        hqyzmqy:cc.Sprite,
        sysj:cc.Label,
        js:60
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Title.creation("注册","login");
        let self = this;
        this.authCodeBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.authCodeBut.node,function(){
                self.authCodeButClick();
            });
        },this);
        this.registerBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.registerBut.node,function(){
                self.registerButClick();
            });
        },this);
    },
    registerButClick(){
        let self = this;
        if(!this.phoneNumberEditbox.string){
            Alert.show("手机号码不能为空！");
            return ;
        }
        if(!UnitTools.checkMobile(this.phoneNumberEditbox.string)){
            Alert.show("请填写正确手机号码！");
            return ;
        }
        if(!this.passwordEditbox.string){
            Alert.show("密码不能为空！");
            return ;
        }
        if(this.passwordEditbox.string.length<6||this.passwordEditbox.string.length>20){
            Alert.show("密码为6~20位数字或字母！");
            return ;
        }
        
        if(!this.confirmPasswordEditbox.string){
            Alert.show("确认密码不能为空！");
            return ;
        }
        if(this.passwordEditbox.string!=this.confirmPasswordEditbox.string){
            Alert.show("两次密码不一致！");
            return ;
        }
        if(!this.verifyCodeEditbox.string){
            Alert.show("验证码不能为空！");
            return ;
        }
        Loading.show(function (){
            
            UnitTools.request("register",{phoneNumber:self.phoneNumberEditbox.string,password:self.passwordEditbox.string,phoneCode:self.verifyCodeEditbox.string},function(err,data){
                Loading.close();
                if(err){
                    cc.log(err);
                    return;
                }
                if(data.code == 200){
                    console.log(data);
                    cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:self.phoneNumberEditbox.string,token:data.data.token}));
                    Alert.show("注册成功",function(){
                        NetUtil.entry(data.data.gateconfig,data.data.userid,data.data.token,function(err,netdata){
                            if(err){
                                Alert.show(err); 
                                return ; 
                            }
                            GlobalData.setParameter("user",netdata.data.user);
                            cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:self.phoneNumberEditbox.string,token:netdata.data.token}));
                            cc.director.loadScene("hall");
                        });
                    });
                }else{
                    Alert.show(data.msg);   
                }
            });

        });
    },
    authCodeButClick(){
        if(!this.phoneNumberEditbox.string){
            Alert.show("手机号码不能为空！");
            return ;
        }
        if(!UnitTools.checkMobile(this.phoneNumberEditbox.string)){
            Alert.show("请填写正确手机号码！");
            return ;
        }
        let self = this;
        Loading.show(function (){
            UnitTools.request("verificationCode",{phoneNumber:self.phoneNumberEditbox.string},function(err,data){
                Loading.close();
                if(err){
                    cc.log(err);
                    return;
                }
                if(data.code == 200){
                    self.hqyzmqy.node.active = true;
                    
                    let interval = setInterval(function(){
                        self.js = self.js -1;
                        if(self.sysj){
                            self.sysj.string =self.js+"S";
                        }else{
                            self.js = 0;  
                        }
                
                        if(self.js<=0){
                            clearInterval(interval);
                            if(self.hqyzmqy){
                                self.hqyzmqy.node.active = false;
                            }
                            self.js = 60;
                        }
                    },1000)
                    Alert.show("发送验证码成功("+data.data.code+")");
                }else{
                    Alert.show("验证码发送失败"); 
                    
                }
            });

        });
        

        
    },
    start () {

    },

    // update (dt) {},
});
