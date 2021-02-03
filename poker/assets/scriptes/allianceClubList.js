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
        tbNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        fhBut:{
            default: null,                
            type: cc.Node    
        },
        clubScrollView:{
            default:null,   
            type:cc.ScrollView   
        },
        menuBut:{
            default:null,   
            type:cc.Node  
        },
        menuNode:{
            default:null,   
            type:cc.Node   
        },
        joinClubNode:{
            default:null,   
            type:cc.Node 
        },
        joinAllianceBut:{
            default:null,   
            type:cc.Node  
        },
        joinClubBjSprite:{
            default:null,   
            type:cc.Sprite 
        },
        joinClubReturnBut:{
            default:null,   
            type:cc.Sprite 
        },
        searchBut:{
            default:null,   
            type:cc.Sprite  
        },
        jionClubBut:{
            default:null,   
            type:cc.Sprite  
        },
        infoNode:{
            default:null,   
            type:cc.Node   
        },
        culbInput:{
            default:null,   
            type:cc.EditBox   
        },
        noClubNode:{
            default:null,   
            type:cc.Node    
        },
        tjedNode:{
            default:null,   
            type:cc.Node   
        },
        clubNameLabel:{
            default:null,   
            type:cc.Label    
        },
        dqedLabel:{
            default:null,   
            type:cc.Label  
        },
        increaseEditBox:{
            default:null,   
            type:cc.EditBox    
        },
        qdBut:{
            default:null,   
            type:cc.Sprite    
        },
        qxBut:{
            default:null,   
            type:cc.Sprite 
        }
    },
    txCreateNodeCallback(data,currentNode){
        //加载头像
        HeadPortraitsLoad.Load(currentNode.getChildByName("TxSprite"),CommonConfig.getHttpUrl()+data.headPortraitUrl);
        currentNode.getChildByName("TxSprite").on(cc.Node.EventType.TOUCH_END,function (args) {
            GlobalData.setParameter("allianceClubInfo",data);
            cc.director.loadScene("allianceClubInfo");  
         }, currentNode.getChildByName("TxSprite")); 
    },
    nrCreateNodeCallback(data,currentNode){
        let self = this;
        currentNode.getChildByName("mcLabel").getComponent(cc.Label).string = data.name;
        currentNode.getChildByName("edLabel").getComponent(cc.Label).string = "额度:"+data.currentquota+"/"+data.maxquota;
        currentNode.getChildByName("jsnrLabel").getComponent(cc.Label).string = data.synopsis?data.synopsis:"暂无简介";
        self.clubNodeMap[data.id] = currentNode;
       
    },
    tbCreateNodeCallback(data,currentNode){
        let self = this; 
        currentNode.getChildByName("butNode").getChildByName("tjedNode").on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickIncreaseQuotaNode(data,currentNode);
        }, currentNode.getChildByName("butNode").getChildByName("tjedNode")); 
        currentNode.getChildByName("butNode").getChildByName("restoreDefaultNode").on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickRestoreDefaultNode(data);
        }, currentNode.getChildByName("butNode").getChildByName("restoreDefaultNode")); 
    },
    tbRecycleNodeCallback(recycleNode,nodename,data){
        recycleNode.getChildByName("butNode").getChildByName("tjedNode").targetOff(cc.Node.EventType.TOUCH_END);
        if(data){
            delete this.clubNodeMap[data.id];
        }
    },
    recycleNodeCallback(recycleNode,nodename,butname){
        recycleNode.getChildByName("TxSprite").targetOff(cc.Node.EventType.TOUCH_END);
    },
    clickIncreaseQuotaNode(data,currentNode){
        let self = this; 
        self.increaseEditBox.string = "";
        self.increaseQuotaClub = null;
        self.increaseQuotaNode = null;
        self.tjedNode.active = true;
        self.clubNameLabel.string =  data.name+"\n(ID:"+data.id +")";
        self.dqedLabel.string = data.currentquota+"/"+data.maxquota;
        self.increaseQuotaClub = data;
    },
    clickRestoreDefaultNode(clubdata){
        let self = this; 
        Alert.show("确认重置俱乐部("+clubdata.name+" ID:"+clubdata.id +")的额度?",function(str){
            if("确定" == str){
                NetUtil.pomeloRequest("game.allianceHandler.recoverQuotaInit",{clubid:self.clubInfo.id,selectClubid:clubdata.id},function(data){
                    if(data.code!=200){
                        Alert.show(data.msg);   
                        return ;
                    }
                    clubdata.currentquota = 0;
                    clubdata.maxquota =  clubdata.defaultmaxquota;
                    self.clubNodeMap[clubdata.id].getChildByName("edLabel").getComponent(cc.Label).string = "额度:"+clubdata.currentquota+"/"+clubdata.maxquota;
                });  
            }
        },"确定","取消");   
    },
    saveIncreaseQuota(){
        let self = this; 
        var increaseQuota = self.increaseEditBox.string;
        if(!increaseQuota||Number(increaseQuota)<0){
            Alert.show("请输入正确金额！");   
            return;
        }


        NetUtil.pomeloRequest("game.allianceHandler.increaseQuota",{clubid:self.clubInfo.id,selectClubid:self.increaseQuotaClub.id,increaseQuota:increaseQuota},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            self.increaseQuotaClub.maxquota =self.increaseQuotaClub.maxquota+ Math.abs(Math.floor(Number(increaseQuota)));
            self.clubNodeMap[self.increaseQuotaClub.id].getChildByName("edLabel").getComponent(cc.Label).string = "额度:"+self.increaseQuotaClub.currentquota+"/"+self.increaseQuotaClub.maxquota;
            self.tjedNode.active = false;
        }); 
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        self.clubNodeMap = {};
        self.fhBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.fhBut,function(){
                cc.director.loadScene("allianceManagement");
            });
        }, this);
        this.scrollViewUtil = this.clubScrollView.getComponent('ScrollView');
        this.clubInfo =  GlobalData.getScenesParameter();
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        this.menuBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.menuNode.active = true;
        }, this);
        this.joinAllianceBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.menuNode.active = false;
            this.searchClubInfo = null;
            self.joinClubNode.active = true;
        }, this);
        this.menuNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.menuNode.active = false;
        }, this);
        self.scrollViewUtil.init([
            {
                name:"bjNodePrefab", 
                prefab:self.bjNodePrefab,
            },
            {
                name:"txNodePrefab", 
                prefab:self.txNodePrefab,
                createNodeCallback:self.txCreateNodeCallback.bind(self),
                recycleNodeCallback:self.recycleNodeCallback.bind(self)
            },
            {
                name:"tbNodePrefab", 
                prefab:self.tbNodePrefab,
                createNodeCallback:self.tbCreateNodeCallback.bind(self),
                recycleNodeCallback:self.tbRecycleNodeCallback.bind(self)
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self)
            }
        ])

        this.queryAlliance();

        self.joinClubBjSprite.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.joinClubNode.active = false;
        },self);
        self.joinClubReturnBut.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.joinClubNode.active = false;
        },self); 

        self.searchBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.searchBut.node,function(){
                self.clickSearchBut();
            });
        },self); 

        self.jionClubBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.jionClubBut.node,function(){
                self.clickJionClubBut();
            });
        },self);

        self.qdBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qdBut.node,function(){
                self.saveIncreaseQuota();
            });
        },self); 
        self.qxBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qxBut.node,function(){
                self.tjedNode.active = false; 
            });
        },self); 
    },
    queryAlliance(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.queryListByAllianceId",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            console.log(data.data.list);
            self.scrollViewUtil.recycleNodeAll();
            if(self.scrollViewUtil.updateNode){
                self.scrollViewUtil.updateNode(data.data.list);  
            }
        });
    },
    clickSearchBut(){
        let self = this;
        let searchId = this.culbInput.string;
        this.searchClubInfo = null;
        if(!searchId){
            return ;
        }
        

        this.infoNode.active = false;
        this.noClubNode.active = false;
        NetUtil.pomeloRequest("game.gameHandler.queryClubById",{clubid:searchId},function(data){
            if(data.code!=200){
                return ;
            }
            // let clubInfo = TestData.searchClubInfo(searchId);
            if(!data.data.clubInfo){
                self.noClubNode.active = true;
                return ;
            }
            let clubInfo = data.data.clubInfo;
            clubInfo.txUrl = CommonConfig.getHttpUrl()+clubInfo.txUrl;
            //加载头像
            HeadPortraitsLoad.Load(self.infoNode.getChildByName("txSprite"),clubInfo.txUrl);
            self.infoNode.getChildByName("clubName").getComponent(cc.Label).string = clubInfo.name;
            self.infoNode.getChildByName("idLabel").getComponent(cc.Label).string = "ID:"+clubInfo.id;
            self.infoNode.getChildByName("rsLabel").getComponent(cc.Label).string = clubInfo.currentHeadcount+"/"+clubInfo.maxUser;
            self.infoNode.getChildByName("jjLabel").getComponent(cc.Label).string = clubInfo.synopsis?clubInfo.synopsis:"暂无简介";
            self.infoNode.active = true;
            self.searchClubInfo = clubInfo;
        });
     
    },
    clickJionClubBut(){
        // console.log("clickJionClubBut");  
        if(!this.searchClubInfo){
            return ;
        }
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.inviteClub",{clubid:this.clubInfo.id,inviteClubid:this.searchClubInfo.id},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);  
                } 
                return ;
            }
            self.joinClubNode.active = false;
            self.queryAlliance();
        });        
    },
    start () {

    },

    // update (dt) {},
});
