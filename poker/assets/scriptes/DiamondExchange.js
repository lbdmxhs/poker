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
var NetUtil =  require("NetUtil");
var GlobalData =  require("GlobalData");
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
        diamondExchangeScrollView:{
            default:null,
            type: cc.ScrollView 
        }
    },
    nrCreateNodeCallback(datainfo,currentNode){
        currentNode.getChildByName("zss").getComponent(cc.Label).string =datainfo.zss;
        currentNode.getChildByName("jbs").getComponent(cc.Label).string =datainfo.jbs;
    },
    tbCreateNodeCallback(datainfo,currentNode){
        let self = this;
        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickDiamondExchange(datainfo);
        }, currentNode);
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("钻石兑换");
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("diamondExchange");
        },this);
        this.clubInfo =   GlobalData.getScenesParameter();
        this.scrollViewUtil = this.diamondExchangeScrollView.getComponent('ScrollView');
        this.scrollViewUtil.init([
            {
                name:"tbNodePrefab", 
                prefab:self.tbNodePrefab,
                createNodeCallback:self.tbCreateNodeCallback.bind(self)
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self)
            }
        ]);
        this.queryClubJewelExchange();

    },
    clickDiamondExchange(item){
        let self = this;
        let ts = "确定花费"+item.jbs+"金币购买"+item.zss+"钻石？"
        Alert.show(ts,function(str){
            if("确定" == str){
                // console.log(item);
                self.jewelExchange(item.jbs);
            }
        },"确定","取消");
    },
    jewelExchange(sum){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.jewelExchange",{clubid:self.clubInfo.id,sum:sum},function(data){
            if(data.code!=200){
                Alert.show(data.msg);
                return ;
            }
            Alert.show("兑换成功！");
        });
    },
    queryClubJewelExchange(){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.queryClubJewelExchange",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show("查询失败！");
                return ;
            }
            if(data.data.jewelExchangeRatio){
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
