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
var Alert = require("Alert");
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var ButAnimation = require("ButAnimation");
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
        slEditBox:{
            default:null,
            type: cc.EditBox 
        },
        diamondExchangeScrollView:{
            default:null,
            type: cc.ScrollView 
        },
        jewelExchangeEnable:{
            default:null,
            type: cc.Sprite   
        },
        jewelExchangeDisabled:{
            default:null,
            type: cc.Sprite   
        },
        settingsBut:{
            default:null,
            type: cc.Sprite    
        }

    },
    nrCreateNodeCallback(datainfo,currentNode){
        currentNode.getChildByName("zss").getComponent(cc.Label).string =datainfo.zss;
        currentNode.getChildByName("jbs").getComponent(cc.Label).string =datainfo.jbs;
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("钻石兑换设置");
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("diamondExchangeSettings");
        },this);
        this.clubInfo =   GlobalData.getScenesParameter();
        this.scrollViewUtil = this.diamondExchangeScrollView.getComponent('ScrollView');
        this.scrollViewUtil.init([
            {
                name:"tbNodePrefab", 
                prefab:self.tbNodePrefab
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self)
            }
        ]);
        this.queryClubJewelExchange();
        this.jewelExchangeEnable.node.on(cc.Node.EventType.TOUCH_START,function (args) {

            self.updateIsJewelExchange("0");
        },this);
        this.jewelExchangeDisabled.node.on(cc.Node.EventType.TOUCH_START,function (args) {

            self.updateIsJewelExchange("1");
        },this);
        this.settingsBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.settingsBut.node,function(){
                self.updateJewelExchangeRatio();
            });  
        },this);

    },
    updateJewelExchangeRatio(){
        let self = this;
        let jewelExchangeRatio = Math.abs(Math.floor(Number(self.slEditBox.string)))
        NetUtil.pomeloRequest("game.gameHandler.updateJewelExchangeRatio",{clubid:self.clubInfo.id,jewelExchangeRatio:jewelExchangeRatio},function(data){
            if(data.code!=200){
                Alert.show("设置失败！");
                return ;
            }
            self.scrollViewUtil.recycleNodeAll();
            var list = self.getDiamondExchangeInfoList(jewelExchangeRatio);
            self.scrollViewUtil.updateNode(list);  
        });
    },
    updateIsJewelExchange(isJewelExchange){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.updateIsJewelExchange",{clubid:self.clubInfo.id,isJewelExchange:isJewelExchange},function(data){
            if(data.code!=200){
                // Alert.show("查询失败！");
                if(isJewelExchange == "1"){
                    isJewelExchange = "0";
                }else{
                    isJewelExchange = "1"; 
                }
                self.changeIsJewelExchange(isJewelExchange);
                return ;
            }
            self.changeIsJewelExchange(isJewelExchange);

        });
    },
    changeIsJewelExchange(isJewelExchange){
        let self = this;
        if(isJewelExchange == "1"){
            self.jewelExchangeEnable.node.active = true;
            self.jewelExchangeDisabled.node.active = false;
        }else{
            self.jewelExchangeEnable.node.active = false;
            self.jewelExchangeDisabled.node.active = true;
        }
    },
    queryClubJewelExchange(){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.queryClubJewelExchange",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show("查询失败！");
                return ;
            }
            console.log(data.data);
            self.changeIsJewelExchange(data.data.isJewelExchange);
            if(data.data.jewelExchangeRatio){
                self.slEditBox.string = data.data.jewelExchangeRatio;
                self.scrollViewUtil.recycleNodeAll();
                var list = self.getDiamondExchangeInfoList(data.data.jewelExchangeRatio);
                self.scrollViewUtil.updateNode(list);  
            }

        });
    },
    getDiamondExchangeInfoList(jewelExchangeRatio){
       
        let DiamondExchangeInfoList = [
            {zss:1*jewelExchangeRatio,jbs:1},
            {zss:5*jewelExchangeRatio,jbs:5},
            {zss:10*jewelExchangeRatio,jbs:10},
            {zss:50*jewelExchangeRatio,jbs:50},
            {zss:100*jewelExchangeRatio,jbs:100},
            {zss:500*jewelExchangeRatio,jbs:500 },
        ]
        return DiamondExchangeInfoList;
    },
    start () {
  
    },

    // update (dt) {},
});
