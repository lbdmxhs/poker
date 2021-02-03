// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Alert = require("Alert");
var Loading = require("Loading");
var Title = require("Title");
var ButAnimation = require("ButAnimation");
var UnitTools = require("UnitTools");
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
        confirmAuthCodeBut:{
            default:null,
            type:cc.Sprite 
        },
        confirmPassBut:{
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
        zcck:cc.Sprite,
        summ:cc.Sprite,
        hqyzmqy:cc.Sprite,
        sysj:cc.Label,
        js:60
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Title.creation("重置密码","login");
        let self = this;
        this.authCodeBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.authCodeBut.node,function(){
                self.getYzmBut();
            });
        },this);
        this.confirmAuthCodeBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.confirmAuthCodeBut.node,function(){
                self.qryzmBut();
            });
        },this);
        this.confirmPassBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.confirmPassBut.node,function(){
                self.confirmPassButClick();
            });
        },this);
    },
    confirmPassButClick(){
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
            
            UnitTools.request("updatePassword",{phoneNumber:self.phoneNumberEditbox.string,password:self.passwordEditbox.string,phoneCode:self.verifyCodeEditbox.string},function(err,data){
                Loading.close();
                if(err){
                    cc.log(err);
                    return;
                }
                if(data.code == 200){
                    Alert.show("修改成功",function(){
                        cc.director.loadScene("login");
                    });
                }else{
                    Alert.show(data.msg);   
                }
            });

        });
    },
    getYzmBut(){
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
        })
    },
    qryzmBut(){
        if(!this.phoneNumberEditbox.string){
            Alert.show("手机号码不能为空！");
            return ;
        }
        if(!UnitTools.checkMobile(this.phoneNumberEditbox.string)){
            Alert.show("请填写正确手机号码！");
            return ;
        }
        if(!this.verifyCodeEditbox.string){
            Alert.show("验证码不能为空！");
            return ;
        }
        let self = this;
        Loading.show(function(){
            UnitTools.request("checkVerificationCode",{phoneNumber:self.phoneNumberEditbox.string,phoneCode:self.verifyCodeEditbox.string},function(err,data){
                Loading.close();
                if(err){
                    cc.log(err);
                    return;
                }
                if(data.code == 200){
                    self.zcck.node.active = false;  
                    self.summ.node.active = true;  
                }else{
                    Alert.show(data.msg); 
                    
                }
            });
        })
    },
    start () {

    },

    // update (dt) {},
});
