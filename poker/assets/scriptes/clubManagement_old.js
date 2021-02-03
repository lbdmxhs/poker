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
        clubNameLabel:{
            default: null,                
            type: cc.Label
        },
        rsLabel:{
            default: null,                
            type: cc.Label   
        },
        idLabel:{
            default: null,                
            type: cc.Label    
        },
        fhBut:{
            default: null,                
            type: cc.Sprite    
        },
        addRsBut:{
            default: null,                
            type: cc.Sprite  
        },
        jbsNode:{
            default: null,                
            type: cc.Node  
        },
        zsjbNode:{
            default: null,                
            type: cc.Node  
        },
        zszsNode:{
            default: null,                
            type: cc.Node  
        },
        zsdhszNode:{
            default: null,                
            type: cc.Node  
        },
        zhmxNode:{
            default: null,                
            type: cc.Node  
        },
        hyNode:{
            default: null,                
            type: cc.Node  
        },
        updateBut:{
            default: null,                
            type: cc.Label    
        },
        txSprite:{
            default: null,                
            type: cc.Sprite  
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        self.fhBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.fhBut,function(){
                cc.director.loadScene("club");
            });
        }, this);
        Title.creation("俱乐部","club");
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("clubManagement");
        },this);
         this.clubInfo =  GlobalData.getScenesParameter();
         this.userInfo =GlobalData.getParameter("user"); 
        if( this.clubInfo ){
            HeadPortraitsLoad.Load(self.txSprite.node,this.clubInfo.txUrl);
            this.clubNameLabel.string = this.clubInfo.name;
            this.rsLabel.string = this.clubInfo.currentHeadcount+"/"+this.clubInfo.maxUser;
            this.idLabel.string = "ID:"+this.clubInfo.id;
        }
        self.addRsBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.addMaxUserCofig();
        }, this);
        self.jbsNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("goldExchange");   
        }, this);
        self.zsjbNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("presentedGold");   
        }, this);
        self.zszsNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("presentedDiamond");   
        }, this);
        self.zsdhszNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("diamondExchangeSettings");   
        }, this);
        self.zhmxNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("accountDetails");   
        }, this);
        self.hyNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("memberList");   
        }, this);
        self.updateBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("updateClubInfo");   
        }, this);
    },
    addMaxUserCofig(){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.addClubMaxPeopleNumberJewel",{},function(data){
            if(data.code!=200){
                Alert.show("查询失败");   
                return ;
            }
            console.log(data);
            Alert.show("确定花费"+data.data.jewelNumber+"钻石扩充俱乐部"+data.data.peopleNumber+"人数吗？",function(str){
                if(str == "确定"){
                    self.addMaxUser(data.data.jewelNumber,data.data.peopleNumber);
                }
            },"确定","取消");   
          

        });
    },
    addMaxUser(jewelNumber,peopleNumber){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.addCulbMaxUserNumber",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show("扩充人数失败！");   
                return ;
            }
            self.clubInfo.maxUser  = Number(self.clubInfo.maxUser)+Number(peopleNumber);
            self.rsLabel.string = self.clubInfo.currentHeadcount+"/"+self.clubInfo.maxUser;
        });
    },
    start () {

    },

    // update (dt) {},
});
