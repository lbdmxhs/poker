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
var UnitTools = require("UnitTools");
var CommonConfig = require("CommonConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        fhBut:{
            default: null,                
            type: cc.Sprite    
        }, 
        txSprite:{
            default: null,                
            type: cc.Sprite  
        },
        jjLabel:{
            default: null,                
            type: cc.Label   
        },
        allianceNameLabel:{
            default: null,                
            type: cc.Label   
        },
        maxClubNumberLabel:{
            default: null,                
            type: cc.Label    
        },
        tjjlbsxNode:{
            default: null,                
            type: cc.Node   
        },
        updateBut:{
            default: null,                
            type: cc.Node  
        },
        xgjjBut:{
            default: null,                
            type: cc.Sprite   
        },
        jsBut:{
            default: null,                
            type: cc.Sprite  
        },
        jlbglNode:{
            default: null,                
            type: cc.Node  
        },
        lmszNode:{
            default: null,                
            type: cc.Node    
        },
        pzglNode:{
            default: null,                
            type: cc.Node  
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        self.fhBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.fhBut,function(){
                cc.director.loadScene(Title.getPrevScenes());
            });
        }, this);
        // cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
        //     Title.setPrevScenes("allianceManagement");
        // },this);
        this.clubInfo =  GlobalData.getScenesParameter();
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        self.tjjlbsxNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            Alert.show("确定花费"+self.addAllianceMaxClubNumberJewel+"钻石增加"+self.addAllianceMaxClubNumber+"个俱乐部上限？",function(str){
                if(str == "确定"){
                    self.addAllianceMaxClub();
                }
            },"确定","取消");    
        }, this);
        self.updateBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            GlobalData.setParameter("alliance", self.alliance); 
            cc.director.loadScene("updateAllianceInfo");   
        }, this);
        self.jlbglNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("allianceClubList");   
        }, this);
        self.xgjjBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            GlobalData.setParameter("alliance", self.alliance); 
            cc.director.loadScene("updateAllianceSynopsis");   
        }, this);
        self.lmszNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            GlobalData.setParameter("allianceSeting", self.alliance); 
            cc.director.loadScene("allianceSeting");   
        }, this);
        self.pzglNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            GlobalData.setParameter("allianceRoomList", self.alliance); 
            cc.director.loadScene("allianceRoomList");   
        }, this);
        self.jsBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.jsBut.node,function(){
                Alert.show("确定解散联盟？",function(str){
                    if(str == "确定"){
                        self.dissolveAlliance();
                    }
                },"确定","取消");
          
            });
        },self); 
        this.queryClubCreationAlliance();
    },
    queryClubCreationAlliance(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.queryClubCreationAlliance",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }

            console.log(data);
            self.alliance = data.data.alliance;
            self.addAllianceMaxClubNumber = data.data.addAllianceMaxClubNumber;
            self.addAllianceMaxClubNumberJewel = data.data.addAllianceMaxClubNumberJewel;

            HeadPortraitsLoad.Load(self.txSprite.node,CommonConfig.getHttpUrl()+self.alliance.headPortraitUrl);
            self.jjLabel.string =  self.alliance.synopsis?self.alliance.synopsis:"暂无简介";
            self.allianceNameLabel.string = self.alliance.name;
            self.maxClubNumberLabel.string ="俱乐部上限:"+ self.alliance.maxClubNumber;

        });
    },
    addAllianceMaxClub(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.addAllianceMaxClubNumber",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            self.alliance.maxClubNumber = Number(self.alliance.maxClubNumber)+Number(self.addAllianceMaxClubNumber)
            self.maxClubNumberLabel.string ="俱乐部上限:"+ self.alliance.maxClubNumber ;

        });
    },
    dissolveAlliance(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.dissolveAlliance", {clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);
                }
                return ;
            }         
            Alert.show("解散联盟成功！",function(){
                cc.director.loadScene(Title.getPrevScenes());  
            });
        });
    },
    start () {

    },

    // update (dt) {},
});
