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
        clubNameLabel:{
            default: null,                
            type: cc.Label
        },
        txSprite:{
            default: null,                
            type: cc.Sprite  
        },
        jjLabel:{
            default: null,                
            type: cc.Label
        },
        rsLabel:{
            default: null,                
            type: cc.Label
        },
        jbsLabel:{
            default: null,                
            type: cc.Label
        },
        addRsBut:{
            default: null,                
            type: cc.Node
        },
        gmjbNode:{
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
        updateBut:{
            default: null,                
            type: cc.Label 
        },
        hyNode:{
            default: null,                
            type: cc.Node  
        },
        updateSynopsisBut:{
            default: null,                
            type: cc.Sprite 
        },
        dkIsSearch:{
            default: null,                
            type: cc.Sprite  
        },
        gbIsSearch:{
            default: null,                
            type: cc.Sprite  
        },
        jsjlbBut:{
            default: null,                
            type: cc.Sprite    
        },
        sslmNode:{
            default: null,                
            type: cc.Node     
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
        
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("clubManagement");
        },this);
        this.clubInfo =  GlobalData.getScenesParameter();
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        this.userInfo =GlobalData.getParameter("user"); 
        if( this.clubInfo ){
            HeadPortraitsLoad.Load(self.txSprite.node,this.clubInfo.txUrl);
            this.clubNameLabel.string = this.clubInfo.name+"(ID:"+this.clubInfo.id+")";
            this.rsLabel.string = this.clubInfo.currentHeadcount+"/"+this.clubInfo.maxUser;
            this.jjLabel.string =  this.clubInfo.synopsis?this.clubInfo.synopsis:"暂无简介";
            this.jbsLabel.string = this.clubInfo.clubGold?this.clubInfo.clubGold:"0";
        }
        self.changeUpdate(this.clubInfo&&this.clubInfo.isSearch?this.clubInfo.isSearch:"0");
        self.addRsBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.addMaxUserCofig();
        }, this);
        self.gmjbNode.on(cc.Node.EventType.TOUCH_START, function (event) {
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
        self.updateSynopsisBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("updateClubSynopsis");   
        }, this);
        self.dkIsSearch.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.updateIsSearch("0");
        }, this);
        self.gbIsSearch.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.updateIsSearch("1");
        }, this);
        self.sslmNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.director.loadScene("allianceList");   
        }, this);
        self.queryClubUserSimple();
        self.jsjlbBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.jsjlbBut,function(){
                Alert.show("确定解散俱乐部？",function(str){
                    if(str == "确定"){
                        self.dissolveClub();  
                    }
                },"确定","取消");

            });
        }, this);
    },
    dissolveClub(){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.dissolveClub",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            GlobalData.getParameter("user").isCreatClub = "0";
            Alert.show("解散俱乐部成功",function(){
                cc.director.loadScene("club");   
            });   
            // let userInfo =GlobalData.getParameter("user"); 

        });
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
    updateIsSearch(isSearch){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.updateIsSearch",{clubid:self.clubInfo.id,isSearch:isSearch},function(data){
            if(data.code!=200){
                Alert.show("操作失败！");   
                return ;
            }
            self.changeUpdate(isSearch);
        });
    },
    changeUpdate(isSearch){
        let self = this;
        if(isSearch == "1"){
            self.dkIsSearch.node.active = true;
            self.gbIsSearch.node.active = false;
        }else{
            isSearch = "0";
            self.dkIsSearch.node.active = false
            self.gbIsSearch.node.active = true;
        }
        self.clubInfo.isSearch  = isSearch;
    },
    queryClubUserSimple(){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.queryClubUserSimple",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                return ;
            }
            var userList = data.data.list;
            if(!userList){
                userList = [];
            }
            for(var i=1;i<=8;i++){
                var userinfo = userList[i-1];
                if(!userinfo){
                    self.hyNode.getChildByName("txSprite"+i).active = false;
                    self.hyNode.getChildByName("vipTb"+i).active = false;
                }else{
                    self.hyNode.getChildByName("txSprite"+i).active = true;
                    
                    if(UnitTools.isVip(userinfo.vipExpirationTime)){
                        self.hyNode.getChildByName("vipTb"+i).active = true;
                    }else{
                        self.hyNode.getChildByName("vipTb"+i).active = false;
                    }
                    var txid = Number(userinfo.id)%31;
                    //加载头像
                    HeadPortraitsLoad.Load(self.hyNode.getChildByName("txSprite"+i),userinfo.txUrl?userinfo.txUrl:CommonConfig.getHttpUrl()+'/image/user/'+txid+'.jpg');   
                }
                
            }
            

        },false);
    },
    
    start () {

    },

    // update (dt) {},
});
