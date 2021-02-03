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
var Alert = require("Alert");
var ButAnimation = require("ButAnimation");
var GlobalData =  require("GlobalData");
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
        balanceLabel:{
            default:null,
            type:cc.Label  
        },
        consumeLabel:{
            default:null,
            type:cc.Label  
        },
        saveBut:{
            default:null, 
            type:cc.Sprite   
        },
        texasNode:{
            default:null, 
            type:cc.Node   
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Title.creation("建立牌局","allianceRoomList");
        this.clubInfo =  GlobalData.getScenesParameter();
          //筛选按钮事件
          let self = this;
          self.selectType = "1";
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
          this.queryCreationRoomConfig();
          this.saveBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.saveBut.node,function(){
                if( self.selectType == "1"){
                   var room = self.texasNode.getComponent('creationRoomTexasNode').getRoom();
                //    console.log(room);
                    self.saveRoom(room);
                } 
            });
        },this);

    },
    pokerTypeClick(type){
        let self = this;
        if(type == self.selectType){
            // self.selectType = "0"; 
            return; 
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

    },
    queryCreationRoomConfig(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.queryCreationRoomConfig",{},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }

            self.balanceLabel.string =data.data.userJewel ;
            self.consumeLabel.string =data.data.creationRoomJewel ;
        });
    },
    saveRoom(room){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.creationRoom",{clubid:this.clubInfo.id,room:room},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            Alert.show("创建成功");   
        });
    },
    start () {

    },

    // update (dt) {},
});
