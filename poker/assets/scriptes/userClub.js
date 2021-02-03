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
        txSprite:{
            default: null,                
            type: cc.Sprite  
        }, 
        rsLabel:{
            default: null,                
            type: cc.Label
        },
        jbsLabel:{
            default: null,                
            type: cc.Label
        },
        zsjbNode:{
            default: null,                
            type: cc.Node
        },
        zhmxNode:{
            default: null,                
            type: cc.Node
        },
        jjLabel:{
            default: null,                
            type: cc.Label
        },
        clubNameLabel:{
            default: null,                
            type: cc.Label
        },
        tcjlbBut:{
            default: null,                
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("俱乐部","club");
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("userClub");
        },this);
        this.clubInfo =  GlobalData.getScenesParameter();
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        if( this.clubInfo ){
            HeadPortraitsLoad.Load(self.txSprite.node,this.clubInfo.txUrl);
            this.clubNameLabel.string = this.clubInfo.name+"(ID:"+this.clubInfo.id+")";
            this.rsLabel.string = this.clubInfo.currentHeadcount+"/"+this.clubInfo.maxUser;
            this.jjLabel.string =  this.clubInfo.synopsis?this.clubInfo.synopsis:"暂无简介";
            this.jbsLabel.string = this.clubInfo.clubGold?this.clubInfo.clubGold:"0";
        }
        self.zsjbNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("presentedGold");   
        }, this);
        self.zhmxNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("accountDetails");   
        }, this);
        self.tcjlbBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.tcjlbBut,function(){
                Alert.show("确定退出俱乐部？",function(str){
                    if(str == "确定"){
                        self.userQuitClub();  
                    }
                },"确定","取消");

            });
        }, this);
    },
    userQuitClub(){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.userQuitClub",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            Alert.show("退出成功",function(){
                cc.director.loadScene("club");   
            });   
            
        });
    },
    start () {

    },

    // update (dt) {},
});
