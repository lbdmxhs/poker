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
    tbCreateNodeCallback(datainfo,currentNode){
        let self = this;
        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickDiamondExchange(datainfo);
        }, currentNode);
    },
    nrCreateNodeCallback(datainfo,currentNode){
        currentNode.getChildByName("zss").getComponent(cc.Label).string =datainfo.jewelNumber;
        currentNode.getChildByName("jbs").getComponent(cc.Label).string =datainfo.goldNumberStr;
    },
    recycleNodeCallback(recycleNode){
        recycleNode.targetOff(cc.Node.EventType.TOUCH_END);
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("金币购买");
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("goldExchange");
        },this);
        this.clubInfo =  GlobalData.getScenesParameter();

        this.scrollViewUtil = this.diamondExchangeScrollView.getComponent('ScrollView');
        this.scrollViewUtil.init([
            {
                name:"tbNodePrefab", 
                prefab:self.tbNodePrefab,
                createNodeCallback:self.tbCreateNodeCallback.bind(self),
                recycleNodeCallback:self.recycleNodeCallback.bind(self)
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self),
            }
        ]);
        this.queryList();
        // GoldExchangeNode.init(this.nrNodePrefab,this.tbNodePrefab,5);
        // let GoldExchangeList= TestData.getGoldExchangeList();
        // GoldExchangeNode.addClubInfNodeBatch(GoldExchangeList,this.clickDiamondExchange);
    },
    clickDiamondExchange(item){
        let self = this;
        let ts = "确定花费"+item.jewelNumber+"钻石购买"+item.goldNumberStr+"金币？"
        Alert.show(ts,function(str){
            if("确定" == str){
                self.save(item.id);
            }
        },"确定","取消");
    },
    save(goldExchangeId){
        let self = this;
        let clubid = this.clubInfo.id;
        NetUtil.pomeloRequest("game.gameHandler.culbGoldExchange",{clubid:clubid,goldExchangeId:goldExchangeId},function(data){
            if(data.code!=200){
                Alert.show(data.msg);
                return ;
            }
            self.clubInfo.clubGold = Number(self.clubInfo.clubGold)+Number(data.data.goldNumber);
            Alert.show("购买成功");
        });
    },
    queryList(){
        let self = this;
        let clubid = this.clubInfo.id;
        NetUtil.pomeloRequest("game.gameHandler.queryCulbGoldexchangeList",{clubid:clubid},function(data){
            if(data.code!=200){
                return ;
            }
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
