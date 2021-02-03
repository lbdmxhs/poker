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
var NetUtil = require("NetUtil");
var GlobalData = require("GlobalData"); 
var UnitTools = require("UnitTools"); 
cc.Class({
    extends: cc.Component,

    properties: {
        nrNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        tbNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        accountDetailsScrollView:{
            default:null,
            type: cc.ScrollView 
        }
    },
    tbCreateNodeCallback(datainfo,currentNode){
        if(datainfo.type=="1"){
            currentNode.getChildByName("jbtb").active = true;
            currentNode.getChildByName("zstb").active = false;
        }else if(datainfo.type=="2"){
            currentNode.getChildByName("jbtb").active = false;
            currentNode.getChildByName("zstb").active = true;
        }
    },
    nrCreateNodeCallback(datainfo,currentNode){
        var red = new cc.Color(250, 0, 0);
        var green =  new cc.Color(44, 209,64);
        /**
         * 1:赠送金币 2:收到金币   6:购买俱乐部钻石 7:俱乐部钻石被购买 8:赠送钻石 9:收到钻石
         */
        var zslxLabel =  currentNode.getChildByName("zslxLabel");
        if(datainfo.consumeType=="1"){
            zslxLabel.getComponent(cc.Label).string ="赠送金币";
        }else if(datainfo.consumeType=="2"){
            zslxLabel.getComponent(cc.Label).string ="收到金币";
        }else if(datainfo.consumeType=="6"){
            zslxLabel.getComponent(cc.Label).string ="购买钻石";
        }else if(datainfo.consumeType=="7"){
            zslxLabel.getComponent(cc.Label).string ="被购买钻石";
        }else if(datainfo.consumeType=="8"){
            zslxLabel.getComponent(cc.Label).string ="赠送钻石";
        }else if(datainfo.consumeType=="9"){
            zslxLabel.getComponent(cc.Label).string ="收到钻石";
        }else if(datainfo.consumeType=="10"){
            zslxLabel.getComponent(cc.Label).string ="购买金币";
        }else{
            zslxLabel.getComponent(cc.Label).string ="其他";
        }
        currentNode.getChildByName("jeLabel").getComponent(cc.Label).string =datainfo.je;
        if(datainfo.je<0){
            currentNode.getChildByName("jeLabel").color = red;
        }else if(datainfo.je>0){
            currentNode.getChildByName("jeLabel").color = green;
        }
        
        currentNode.getChildByName("sjLabel").getComponent(cc.Label).string =UnitTools.dateFormat("YY/mm/dd HH:MM:SS",new Date(datainfo.timeDate));
        if(datainfo.userId){
            currentNode.getChildByName("dxLabel").getComponent(cc.Label).string ="用户ID:"+datainfo.userId;
        }else{
            currentNode.getChildByName("dxLabel").getComponent(cc.Label).string ="";  
        }
        
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("accountDetails");
        },this);
        this.prevScenes = Title.getPrevScenes();
        let self = this;
        Title.creation("账户明细");
        this.clubInfo =   GlobalData.getScenesParameter();
        this.scrollViewUtil = this.accountDetailsScrollView.getComponent('ScrollView');
        this.scrollViewUtil.init([
            {
                name:"tbNodePrefab", 
                prefab:self.tbNodePrefab,
                createNodeCallback:self.tbCreateNodeCallback.bind(self)
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self),
            }
        ]);
        this.queryListPage();
        
        self.accountDetailsScrollView.node.on('bounce-bottom',  self.queryListPage, this);
    },
    queryListPage(){
        let self = this;
        let clubid = this.clubInfo.id;
        this.curPage = this.curPage?this.curPage+1:1;
        if(self.total&&self.pageSize&&self.curPage){
            if(self.total<=self.pageSize*(self.curPage-1)){
                return ; 
            }
        }
        var route = "";
        if(self.prevScenes == "clubManagement"){
            route = "game.gameHandler.queryTradingRecordByClubId";
        }else{
            route = "game.gameHandler.queryTradingRecordByUserId";
        }
        NetUtil.pomeloRequest(route,{clubid:clubid,curPage:self.curPage},function(data){
            if(data.code!=200){
                return ;
            }
            self.pageSize = data.data.pageSize;
            self.total = data.data.total;
            if( data.data.list&& data.data.list.length>0){
                if(self.scrollViewUtil.updateNode){
                    self.scrollViewUtil.updateNode(data.data.list);  
                }
            }
        });
    },

    start () {
  
    },

    // update (dt) {},
});
