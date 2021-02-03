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
        registerBut:{
            default:null,
            type:cc.Sprite
        },
        resetpasswordBut:{
            default:null,
            type:cc.Sprite
        },
        loginBut:{
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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        this.registerBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.registerBut.node,function(){
                self.registerButClick();
            });
        },this);
        this.resetpasswordBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.resetpasswordBut.node,function(){
                self.resetpasswordButClick();
            });
        },this);
        this.loginBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.loginBut.node,function(){
                self.loginButClick();
            });
        },this);
        let poker_logininfo = cc.sys.localStorage.getItem("poker_logininfo")
        if(poker_logininfo){
            poker_logininfo = JSON.parse(poker_logininfo);
            if(poker_logininfo.account){
                self.phoneNumberEditbox.string =   poker_logininfo.account;   
            }
            if(poker_logininfo.token){
                self.tokenLogin(poker_logininfo.token,poker_logininfo.account)
            }
        }
    },
    tokenLogin(token,account){
        Loading.show(function (){
            UnitTools.request("logintoken",{token:token},function(err,data){
                
                if(err){
                    Loading.close();
                    cc.log(err);
                    return;
                }
                if(data.code == 200){
                    cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:account,token:data.data.token}));
                    NetUtil.entry(data.data.gateconfig,data.data.userid,data.data.token,function(err,netdata){
                        Loading.close();
                        if(err){
                            Alert.show(err); 
                            return ; 
                        }
                        GlobalData.setParameter("user",netdata.data.user);
                        cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:account,token:netdata.data.token}));
                        cc.director.loadScene("hall");
                    });
                }else{
                    Loading.close();
                    cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:account,token:""}));
                    Alert.show(data.msg);
                }
            });

        });
    },
    loginButClick(){
        
        //  cc.director.loadScene("hall");
        let self = this;
        if(!this.phoneNumberEditbox.string){
            Alert.show("手机号码不能为空！");
            return ;
        }

        if(!this.passwordEditbox.string){
            Alert.show("密码不能为空！");
            return ;
        }

        Loading.show(function (){
            
            UnitTools.request("login",{account:self.phoneNumberEditbox.string,password:self.passwordEditbox.string},function(err,data){
            
                if(err){
                    Loading.close();
                    cc.log(err);
                    return;
                }
                if(data.code == 200){
                    console.log(data);
                    cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:self.phoneNumberEditbox.string,token:data.data.token}));
                    
                    NetUtil.entry(data.data.gateconfig,data.data.userid,data.data.token,function(err,netdata){
                        Loading.close();
                        if(err){
                            Alert.show(err); 
                            return ; 
                        }
                        // console.log("----------------"+netdata.data.token);
                        GlobalData.setParameter("user",netdata.data.user);
                        cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:self.phoneNumberEditbox.string,token:netdata.data.token}));
                        cc.director.loadScene("hall");
                    });

                }else{
                    Loading.close();
                    cc.sys.localStorage.setItem('poker_logininfo', JSON.stringify({account:self.phoneNumberEditbox.string,token:""}));
                    Alert.show(data.msg);   
                }
            });

        });
     },
     registerButClick(){
        
        cc.director.loadScene("register");

    },
    resetpasswordButClick(){
        cc.director.loadScene("resetpassword");
    },
    start () {

    },

    // update (dt) {},
});
