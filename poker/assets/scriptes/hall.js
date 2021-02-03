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
var HeadPortraitNode = require("HeadPortraitNode");
var CardTableNode = require("CardTableNode");
var Alert = require("Alert");
var Loading = require("Loading");
var TestData = require("TestData");
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var GlobalData =  require("GlobalData");
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
        txContent:{
            default:null,
            type:cc.Node
        },
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
        selectClubId:null,
        selectType:"0",//0全部，1德州，2牛牛，3金花
        cardTableNode:{
            default:null,
            type: cc.Prefab
        },
        cardTableInfoNode:{
            default:null,
            type: cc.Prefab
        },
        headPortraitNode:{
            default:null,
            type: cc.Prefab
        },
        pictureNode:{
            default:null,
            type: cc.Prefab
        },
        cardTableScrollView:{
            default:null,
            type: cc.ScrollView   
        }
        // clubBut:{
        //     default:null,
        //     type:cc.Sprite
        // }
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad () {
      
        CardTableNode.init(this.cardTableNode,this.cardTableInfoNode,40);
        HeadPortraitNode.init(this.headPortraitNode,this.pictureNode,5);
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            HeadPortraitNode.recycleNodeAll();
            CardTableNode.recycleNodeAll();
        },this);
        //筛选按钮事件
        let self = this;
        self.roomMap = GlobalData.getParameter("roomMap");
        if(!self.roomMap){
            self.roomMap = {}; 
        }
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
        // this.cardTableScrollView.node.on("bounce-top",function(){
        //     console.log("------------------------------------");
        // },this);
        this.queryClub(); 
        // Loading.show();
        // setTimeout(() => {
            
        //     Loading.close();
        // }, 1000);
      
    },
   


    start () {
        
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
    cardTableClick(cardTableInfo){
        let self = this;
        //    console.log(cardTableInfo);
        // Alert.show("点击成功"+cardTableInfo.cardTableId);
        NetUtil.pomeloRequest("room.roomHandler.getRoom",{clubid:self.clubId,roomid:cardTableInfo.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            data.data.room.selfPk = data.data.selfPk;
            GlobalData.setParameter("room_clubId",self.clubId);
            GlobalData.setParameter("room_room",data.data.room);
            cc.director.loadScene("room");
            console.log(data);
        });
    },
    queryClub(){
        let self = this;
        //todo 获取俱乐部
        let clubXx =GlobalData.getParameter("clubXx");
        if(!clubXx){
            NetUtil.queryClubByUser(function(list){
                clubXx = list;
                self.showClubHeadPortrait(clubXx);
            });
        }else{
            self.showClubHeadPortrait(clubXx);
        }
        
    },
    showClubHeadPortrait:function(clubXx){
        let self = this;
        let selectid;
        if(clubXx&&clubXx.length>0){
            selectid = clubXx[0].id;
        }
        HeadPortraitNode.addNodeBatch(clubXx,selectid,function(clubId){
            console.log(clubId);
            self.selectClubId = clubId;
            self.updateCardTable(clubId,self.selectType);
        });
    },
    updateCardTable(clubId,selectType){
        let self = this;
        self.clubId = clubId;
        if( self.roomMap[clubId]){
            let cardTableArr =self.roomMap[clubId];
            CardTableNode.addNodeBatch(cardTableArr,selectType,this.cardTableClick.bind(self));
        }else{
            NetUtil.pomeloRequest("game.allianceHandler.queryRoomByUser",{clubid:clubId},function(data){
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
                    CardTableNode.addNodeBatch( data.data.list,selectType,self.cardTableClick.bind(self));  
                    self.roomMap[clubId] = data.data.list;
                }else{
                    CardTableNode.addNodeBatch([],selectType,self.cardTableClick.bind(self));      
                }


            });   
        }
        //     //更新房间列表
        // let cardTableArr =TestData.getcardTableList(clubId);
        // CardTableNode.addNodeBatch(cardTableArr,selectType,this.cardTableClick);
    }
    // update (dt) {},
});
