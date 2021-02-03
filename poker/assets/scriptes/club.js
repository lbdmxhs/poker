// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var ButAnimation = require("ButAnimation");
var HeadPortraitsLoad = require("HeadPortraitsLoad");
var Alert = require("Alert");
var NetUtil = require("NetUtil");
var GlobalData = require("GlobalData");
var CommonConfig = require("CommonConfig");
var Title =  require("Title");
var NetUtil = require("NetUtil");
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
        clubInfBjNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        clubInfNrNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        clubInfTbNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        clubInfTxNodePrefab:{
            default:null,
            type: cc.Prefab 
        }, 
        menuNode:{
            default:null,
            type:cc.Node 
        },
        menuBut:{
            default:null,   
            type:cc.Sprite 
        },
        bjSprite:{
            default:null,   
            type:cc.Sprite    
        },
        addAndCreaClubOne:{
            default:null,   
            type:cc.Sprite    
        },
        addAndCreaClub:{
            default:null,   
            type:cc.Sprite    
        },
        joinClubBut1:{
            default:null,   
            type:cc.Sprite    
        }
        ,
        joinClubBut2:{
            default:null,   
            type:cc.Sprite    
        },
        creatClubBut:{
            default:null,   
            type:cc.Sprite    
        },
        creatAllianceBut:{
            default:null,   
            type:cc.Sprite    
        },
        joinClubBjSprite:{
            default:null,   
            type:cc.Sprite   
        },
        joinClubNode:{
            default:null,
            type:cc.Node  
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
        culbInput:{
            default:null,
            type:cc.EditBox    
        },
        infoNode:{
            default:null,
            type:cc.Node   
        },
        noClubNode:{
            default:null,
            type:cc.Node 
        },
        searchClubInfo:null,
        clubisnullNode:{
            default:null,
            type:cc.Sprite  
        },
        scrollViewContent:{
            default:null,
            type:cc.Node 
        },
        clubScrollView:{
            default:null,
            type:cc.ScrollView 
        },
    },

    // LIFE-CYCLE CALLBACKS:
    showClub(){
        let self = this;
        let clubXx ;
        NetUtil.queryClubByUser(function(list){
            clubXx = list;
            if(!clubXx||clubXx.length == 0){
                self.clubisnullNode.node.active = true;
            }else{
                self.clubisnullNode.node.active = false;
                self.scrollViewUtil.recycleNodeAll();
                if(self.scrollViewUtil.updateNode){
                    self.scrollViewUtil.updateNode(clubXx);  
                }
               
            }
        });
       // let clubXx =TestData.getClubList();   
    },
    clickEvent(currentNode,nodename,butname,str,item){
        let self = this;
        currentNode.getChildByName(nodename).getChildByName(butname).on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickBut(item,str);
        }, currentNode.getChildByName(nodename).getChildByName(butname)); 

    },
    zcButClick(currentNode,item){
       
        //客户
        this.clickEvent(currentNode,"KhButNode","zsdhBut","zsdh",item);
        this.clickEvent(currentNode,"KhButNode","zhmxBut","zhmx",item);
        this.clickEvent(currentNode,"KhButNode","zsjbBut","zsjb",item);
        this.clickEvent(currentNode,"KhButNode","jlbBut","jlb",item);
        //俱乐部
        this.clickEvent(currentNode,"ClubButNode","zsjbBut","zsjb",item);
        this.clickEvent(currentNode,"ClubButNode","zhmxBut","zhmx",item);
        this.clickEvent(currentNode,"ClubButNode","jlbglBut","jlbgl",item);
        //联盟
        this.clickEvent(currentNode,"nmButNode","zsjbBut","zsjb",item);
        this.clickEvent(currentNode,"nmButNode","zhmxBut","zhmx",item);
        this.clickEvent(currentNode,"nmButNode","jlbglBut","jlbgl",item);
        this.clickEvent(currentNode,"nmButNode","nmglBut","nmgl",item);
    },

    //头像
    txCreateNodeCallback(clubinfo,currentNode){
        //加载头像
        HeadPortraitsLoad.Load(currentNode.getChildByName("TxSprite"),clubinfo.txUrl);
    },
    //图标
    tbCreateNodeCallback(clubinfo,currentNode){
      
        if(clubinfo.isSelf!="1"){
            currentNode.getChildByName("KhButNode").active = true;
            currentNode.getChildByName("ClubButNode").active = false;
            currentNode.getChildByName("nmButNode").active = false;
            if(clubinfo.isJewelExchange != "1"){
                currentNode.getChildByName("KhButNode").getChildByName("zsdhBut").active = false;
                currentNode.getChildByName("KhButNode").getChildByName("zsjbBut").getComponent(cc.Widget).isAlignLeft = false;
                currentNode.getChildByName("KhButNode").getChildByName("zsjbBut").x = 0;
     
                // currentNode.getChildByName("KhButNode").getChildByName("zsjbBut").getComponent(cc.Widget).left = '42%';
            }else{
                currentNode.getChildByName("KhButNode").getChildByName("zsdhBut").active = true; 
                currentNode.getChildByName("KhButNode").getChildByName("zsjbBut").getComponent(cc.Widget).isAlignLeft = true;
                // currentNode.getChildByName("KhButNode").getChildByName("zsjbBut").getComponent(cc.Widget).left = 0.28;
            }
        }else if(clubinfo.isCreatorAlliance == "1"){
            currentNode.getChildByName("KhButNode").active = false;
            currentNode.getChildByName("ClubButNode").active = false;
            currentNode.getChildByName("nmButNode").active = true;
        }else{
            currentNode.getChildByName("KhButNode").active = false;
            currentNode.getChildByName("ClubButNode").active = true;
            currentNode.getChildByName("nmButNode").active = false;  
        }
        this.zcButClick(currentNode,clubinfo);
    },
    //内容
    nrCreateNodeCallback(clubinfo,currentNode){
        currentNode.getChildByName("mcLabel").getComponent(cc.Label).string = clubinfo.name;
        currentNode.getChildByName("rsLabel").getComponent(cc.Label).string = clubinfo.currentHeadcount+"/"+clubinfo.maxUser;
        currentNode.getChildByName("jbLabel").getComponent(cc.Label).string = clubinfo.clubGold?clubinfo.clubGold:"0";
        currentNode.getChildByName("jsnrLabel").getComponent(cc.Label).string = clubinfo.synopsis;
            
    },
    recycleEvent(recycleNode,nodename,butname){
        recycleNode.getChildByName(nodename).getChildByName(butname).targetOff(cc.Node.EventType.TOUCH_END);
    },
    recycleNodeCallback(recycleNode){
        this.recycleEvent(recycleNode,"KhButNode","zsdhBut");
        this.recycleEvent(recycleNode,"KhButNode","zhmxBut");
        this.recycleEvent(recycleNode,"KhButNode","zsjbBut");
        this.recycleEvent(recycleNode,"KhButNode","jlbBut");

        this.recycleEvent(recycleNode,"ClubButNode","zsjbBut");
        this.recycleEvent(recycleNode,"ClubButNode","zhmxBut");
        this.recycleEvent(recycleNode,"ClubButNode","jlbglBut");

        this.recycleEvent(recycleNode,"nmButNode","zsjbBut");
        this.recycleEvent(recycleNode,"nmButNode","zhmxBut");
        this.recycleEvent(recycleNode,"nmButNode","jlbglBut");
        this.recycleEvent(recycleNode,"nmButNode","nmglBut");
    },
    onLoad () {
        let self = this;
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("club");
        },this);
        this.scrollViewUtil = this.clubScrollView.getComponent('ScrollView');

        self.scrollViewUtil.init([
            {
                name:"clubInfBjNodePrefab", 
                prefab:self.clubInfBjNodePrefab,
            },
            {
                name:"clubInfTxNodePrefab", 
                prefab:self.clubInfTxNodePrefab,
                createNodeCallback:self.txCreateNodeCallback.bind(self)
            },
            {
                name:"clubInfTbNodePrefab", 
                prefab:self.clubInfTbNodePrefab,
                createNodeCallback:self.tbCreateNodeCallback.bind(self),
                recycleNodeCallback:self.recycleNodeCallback.bind(self)
            },
            {
                name:"clubInfNrNodePrefab", 
                prefab:self.clubInfNrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self)
            }
        ])
        this.showClub();


        self.menuBut.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickMenuBut();
        },self);
        self.bjSprite.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.menuNode.active = false;
        },self);
        //查询俱乐部
        self.joinClubBut1.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickJoinClub();
        },self);
        self.joinClubBut2.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickJoinClub();
        },self);
        //创建俱乐部
        self.creatClubBut.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            cc.director.loadScene("creationClub");   
        },self);

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
    },
    clickBut(clubInfo,type){
        console.log(type+":"+clubInfo.id);  
        GlobalData.setScenesParameter(clubInfo);
        if(type=="zsdh"){ 
            cc.director.loadScene("diamondExchange");   
        }
        if(type=="zhmx"){
            cc.director.loadScene("accountDetails");   
        }
        if(type=="jlbgl"){
            cc.director.loadScene("clubManagement");   
        }
        if(type=="zsjb"){
            cc.director.loadScene("presentedGold");
        }
        if(type=="jlb"){
            cc.director.loadScene("userClub");
        }
        if(type=="nmgl"){
            cc.director.loadScene("allianceManagement");
        }


    },
    start () {

    },
    clickJoinClub(){
        this.menuNode.active = false;
        this.joinClubNode.active = true;
        this.infoNode.active = false;
        this.noClubNode.active = false;
        this.culbInput.string = "";
        this.searchClubInfo = null;
    },
    clickMenuBut(){
        this.menuNode.active = true;
        let userInfo =GlobalData.getParameter("user"); 
        // isCreatClub:"1",//是否已经创建俱乐部
        // isAlliance:"1",//是否已经加入联盟或者创建联盟
        
        if(userInfo.isCreatClub == "1"){
           this.addAndCreaClubOne.node.active = true;
           this.addAndCreaClub.node.active = false;
        }else{
            this.addAndCreaClubOne.node.active = false;
            this.addAndCreaClub.node.active = true;
            // if(userInfo.isCreatClub!="1"){
            //     this.addAndCreaClub.node.getChildByName("creatClub").active = true;
            //     this.addAndCreaClub.node.getChildByName("creatAlliance").active = false;
            // }else{
            //     this.addAndCreaClub.node.getChildByName("creatClub").active = false;
            //     this.addAndCreaClub.node.getChildByName("creatAlliance").active = true;
            // }
        }

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
        NetUtil.pomeloRequest("game.gameHandler.saveClubUser",{clubid:this.searchClubInfo.id},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);  
                } 
                return ;
            }
            self.joinClubNode.active = false;
            self.showClub();
        });        
    }
    // update (dt) {},
});
