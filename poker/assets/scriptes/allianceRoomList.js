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
var CardTableNode = require("CardTableNode");
var TestData = require("TestData");
var NetUtil = require("NetUtil");
var GlobalData  = require("GlobalData");
cc.Class({
    extends: cc.Component,

    properties: {
        dzBut:{
            default:null,
            type:cc.Sprite  
        },
        nnBut:{
            default:null,
            type:cc.Sprite  
        },
        jhBut:{
            default:null,
            type:cc.Sprite  
        },
        dzSelectedBut:{
            default:null,
            type:cc.Sprite  
        },
        nnSelectedBut:{
            default:null,
            type:cc.Sprite  
        },
        jhSelectedBut:{
            default:null,
            type:cc.Sprite  
        },
        cardTableNode:{
            default:null,
            type: cc.Prefab
        },
        cardTableInfoNode:{
            default:null,
            type: cc.Prefab
        },
        cardTableNode:{
            default:null,
            type: cc.Prefab
        },
        cardTableInfoNode:{
            default:null,
            type: cc.Prefab
        },
        addBut:{
            default:null,
            type:cc.Sprite  
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Title.creation("联盟牌局","allianceManagement");
        CardTableNode.init(this.cardTableNode,this.cardTableInfoNode,40);
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            CardTableNode.recycleNodeAll();
        },this);
        //筛选按钮事件
        let self = this;
        this.dzBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            self.pokerTypeClick("1");
        },this);
        this.nnBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            self.pokerTypeClick("2");
        },this);
        this.jhBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            self.pokerTypeClick("3");
        },this);
        this.dzSelectedBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            self.pokerTypeClick("1");
        },this);
        this.nnSelectedBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            self.pokerTypeClick("2");
        },this);
        this.jhSelectedBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            self.pokerTypeClick("3");
        },this);

        //更新房间列表
        // let cardTableArr =TestData.getcardTableList("1");
        // CardTableNode.addNodeBatch(cardTableArr,"0",function(data){

        // });
        self.selectType = 0;
        this.clubInfo =  GlobalData.getScenesParameter();
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        NetUtil.pomeloRequest("game.allianceHandler.queryRoomByalliance",{clubid:this.clubInfo.id},function(data){
                if(data.code!=200){
                    Alert.show(data.msg);   
                    return ;
                }
                // console.log(data);
                // var cardTableArr = [];
                if(data.data.list&&data.data.list.length>0){
                    data.data.list.forEach(function(item,index){
                        var currentPeopleNumber = 0;
                        if( data.data.peopleNumberList[index]){
                            currentPeopleNumber =   data.data.peopleNumberList[index]; 
                        }
                        item.currentPeopleNumber = data.data.peopleNumberList[index]; 

                    });
                    CardTableNode.addNodeBatch( data.data.list, self.selectType,function(){});  
                }else{
                    CardTableNode.addNodeBatch([], self.selectType,function(){});      
                }


        }); 
        this.addBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            cc.director.loadScene("creationRoom");   
        },this);
        
    },
    pokerTypeClick(type){
        let self = this;
        if(type == self.selectType){
            self.selectType = "0";   
        }else{
            self.selectType = type;
        }
        var node = [];
        node.push(self.dzBut);
        node.push(self.nnBut);
        node.push(self.jhBut);
        var nodeSelectde = [];
        nodeSelectde.push(self.dzSelectedBut);
        nodeSelectde.push(self.nnSelectedBut);
        nodeSelectde.push(self.jhSelectedBut);

        node.forEach(function(item,index){
            let selectedItem = nodeSelectde[index];
            if((""+(index+1)) == self.selectType){

                item.node.active = false;
                selectedItem.node.active = true;
            }else{
                item.node.active = true;
                selectedItem.node.active = false;

            }
        });
        CardTableNode.filtrate(self.selectType);
    },
    start () {

    },

    // update (dt) {},
});
