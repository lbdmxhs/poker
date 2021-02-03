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
        bjNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        nrNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        txNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        menuBut:{
            default: null,                
            type: cc.Sprite      
        },
        menuNode:{
            default: null,                
            type: cc.Node  
        },
        fhBut:{
            default: null,                
            type: cc.Node    
        },
        bjSprite:{
            default:null,   
            type:cc.Sprite    
        },
        creaAllianceBut:{
            default:null,   
            type:cc.Sprite    
        },
        allianceScrollView:{
            default:null,   
            type:cc.ScrollView     
        }
    },

    // LIFE-CYCLE CALLBACKS:
  //头像
    txCreateNodeCallback(data,currentNode){
        //加载头像
        HeadPortraitsLoad.Load(currentNode.getChildByName("TxSprite"),CommonConfig.getHttpUrl()+data.headPortraitUrl);
    },
    nrCreateNodeCallback(data,currentNode){
        let self = this;
        currentNode.getChildByName("mcLabel").getComponent(cc.Label).string = data.name;
        currentNode.getChildByName("edLabel").getComponent(cc.Label).string = "额度:"+data.currentquota+"/"+data.maxquota;
        currentNode.getChildByName("jsnrLabel").getComponent(cc.Label).string = data.synopsis?data.synopsis:"暂无简介";
        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            if(data.creatorClubId == self.clubInfo.id&&self.clubInfo.isSelf == "1"){
                cc.director.loadScene("allianceManagement");
            }else{
                GlobalData.setParameter("alliance",data); 
                cc.director.loadScene("allianceInfo");
            }
        }, currentNode); 
    },
    recycleNodeCallback(recycleNode,nodename,butname){
        recycleNode.targetOff(cc.Node.EventType.TOUCH_END);
    },
    onLoad () {
        let self = this;
        self.fhBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.fhBut,function(){
                cc.director.loadScene("clubManagement");
            });
        }, this);

        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("allianceList");
        },this);
        this.scrollViewUtil = this.allianceScrollView.getComponent('ScrollView');
        this.clubInfo =  GlobalData.getScenesParameter();
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        this.userInfo =GlobalData.getParameter("user"); 

        this.menuBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.menuNode.active = true;
        }, this);
        self.bjSprite.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.menuNode.active = false;
        },self);

        self.creaAllianceBut.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            cc.director.loadScene("creationAlliance");
        },self);

        self.scrollViewUtil.init([
            {
                name:"bjNodePrefab", 
                prefab:self.bjNodePrefab,
            },
            {
                name:"txNodePrefab", 
                prefab:self.txNodePrefab,
                createNodeCallback:self.txCreateNodeCallback.bind(self)
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self),
                recycleNodeCallback:self.recycleNodeCallback.bind(self)
            }
        ])
        self.queryAlliance();
        

   
    },
    isCreationAlliance(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.isCreationAlliance",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                // Alert.show(data.msg);   
                return ;
            }
            self.menuBut.node.active = data.data.isCreationAlliance;
       
        });
    },
    queryAlliance(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.queryAllianceByclub",{clubid:self.clubInfo.id},function(data){
            self.isCreationAlliance();
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            console.log(data.data.list);
            if(self.scrollViewUtil.updateNode){
                self.scrollViewUtil.updateNode(data.data.list);  
            }
        });
    },
    start () {

    },

    // update (dt) {},
});
