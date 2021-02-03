// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Title = require("Title");
var ButAnimation = require("ButAnimation");
var Alert = require("Alert");
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var HeadPortraitsLoad= require("HeadPortraitsLoad");
var CommonConfig = require("CommonConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        txSprite:{
            default: null,                
            type: cc.Sprite  
        },      
        clubNameLabel:{
            default: null,                
            type: cc.Label
        },
        jjLabel:{
            default: null,                
            type: cc.Label
        },
        quotaLabel:{
            default: null,                
            type: cc.Label
        },
        defaultmaxquotaLabel:{
            default: null,                
            type: cc.Label
        },
        commissionsumLabel:{
            default: null,                
            type: cc.Label
        },
        updateMaxquotaNode:{
            default: null,                
            type: cc.Node
        },
        updateDefaultmaxquotaNode:{
            default: null,                
            type: cc.Node
        },
        quitBut:{
            default: null,                
            type: cc.Node  
        },
        quotaNode:{
            default: null,                
            type: cc.Node
        },
        quotaEditBox:{
            default: null,                
            type: cc.EditBox 
        },
        nameLabel:{
            default: null,                
            type: cc.Label 
        },
        qdBut:{
            default: null,                
            type: cc.Sprite 
        },
        qxBut:{
            default: null,                
            type: cc.Sprite 
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("联盟俱乐部","allianceClubList");
        this.clubInfo =  GlobalData.getScenesParameter();
        this.selectClubInfo =  GlobalData.getParameter("allianceClubInfo");

        if(!this.selectClubInfo ){
            this.selectClubInfo = {};
        }
        if( this.selectClubInfo ){
            HeadPortraitsLoad.Load(self.txSprite.node,CommonConfig.getHttpUrl()+this.selectClubInfo.headPortraitUrl);
            this.jjLabel.string =  this.selectClubInfo.synopsis?this.selectClubInfo.synopsis:"暂无简介";
            this.clubNameLabel.string = this.selectClubInfo.name+"(ID:"+this.selectClubInfo.id+")";
            this.quotaLabel.string ="额度："+ this.selectClubInfo.currentquota+"/"+this.selectClubInfo.maxquota;
            this.defaultmaxquotaLabel.string =  "默认最大额度："+this.selectClubInfo.defaultmaxquota;
            this.commissionsumLabel.string = "当前抽成金额："+this.selectClubInfo.commissionsum;
        }
        self.updateMaxquotaNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.quotaNode.active = true;
            self.nameLabel.string = "当前最大额度:"+this.selectClubInfo.maxquota;
            self.quotaEditBox.placeholder = "修改后的最大额度";
            self.quotaEditBox.string = "";
            self.saveType = "1";
        }, this);
        self.updateDefaultmaxquotaNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.quotaNode.active = true;
            self.nameLabel.string = "当前默认额度:"+this.selectClubInfo.defaultmaxquota;
            self.quotaEditBox.placeholder = "修改后的默认额度";
            self.quotaEditBox.string = "";
            self.saveType = "2";
        }, this);
        self.qdBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qdBut.node,function(){
                self.quotaNode.active = false;
                if(self.saveType == "1"){
                    self.updateMaxQuota();
                }else{
                    self.updateDefaultQuota();   
                }
            });
        },self); 
        self.qxBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qxBut.node,function(){
                self.quotaNode.active = false;
            });
        },self); 

        self.quitBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.quitBut,function(){
                Alert.show("确定将俱乐部踢出联盟？",function(str){
                    if(str == "确定"){
                        self.kickOutAlliance();
                    }
                },"确定","取消");

            });
        }, this);
        
    },
    updateMaxQuota(){
        let self = this;
        var quota = self.quotaEditBox.string;
        if(!quota||Number(quota)<0){
            Alert.show("请输入正确金额！");   
            return;
        }

        NetUtil.pomeloRequest("game.allianceHandler.updateMaxQuota",{clubid:self.clubInfo.id,selectClubid:self.selectClubInfo.id,quota:quota},function(data){
            self.quotaNode.active = false;
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            self.selectClubInfo.maxquota = quota;
            self.quotaLabel.string ="额度："+ self.selectClubInfo.currentquota+"/"+self.selectClubInfo.maxquota;

        }); 

    },
    updateDefaultQuota(){
        let self = this;
        var quota = self.quotaEditBox.string;
        if(!quota||Number(quota)<0){
            Alert.show("请输入正确金额！");   
            return;
        }

        NetUtil.pomeloRequest("game.allianceHandler.updateDefaultQuota",{clubid:self.clubInfo.id,selectClubid:self.selectClubInfo.id,quota:quota},function(data){
            self.quotaNode.active = false;
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            self.selectClubInfo.defaultmaxquota = quota;
            self.defaultmaxquotaLabel.string =  "默认最大额度："+self.selectClubInfo.defaultmaxquota;

        }); 

    },
    kickOutAlliance(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.kickOutAlliance",{clubid:self.clubInfo.id,selectClubid:self.selectClubInfo.id},function(data){
            self.quotaNode.active = false;
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            cc.director.loadScene("allianceClubList");  
        });   
    },
    start () {

    },

    // update (dt) {},
});
