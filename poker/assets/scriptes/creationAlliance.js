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
var NetUtil= require("NetUtil");
var GlobalData = require("GlobalData");
cc.Class({
    extends: cc.Component,

    properties: {
        allianceNameEditBox:{
            default: null,   
            type: cc.EditBox    
        },
        qdcjBut:{
            default: null,   
            type: cc.Sprite,  
        },
        jlbsxLabel:{
            default: null,   
            type: cc.Label,  
        },
        sxzsLabel:{
            default: null,   
            type: cc.Label,  
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Title.creation("创建联盟");
        let self = this;
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("creationAlliance");
        },this);

        this.clubInfo =  GlobalData.getScenesParameter();
        self.qdcjBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qdcjBut.node,function(){
                self.clickQdcjBut();
            });
        },self); 
        this.queryCreationAllianceConfig();    
    },
    queryCreationAllianceConfig(){
        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.queryCreationAllianceConfig",{},function(data){
            if(data.code!=200){
                return ;
            }
            self.sxzsLabel.string = data.data.addAllianceJewel;
            self.jlbsxLabel.string = data.data.allianceMaxClubNumber;
        },false);

    },
    clickQdcjBut(){
        let self = this;
        let name = this.allianceNameEditBox.string;
        
        if(!name){
            Alert.show("名称不能为空！");
            return ;
        }
        NetUtil.pomeloRequest("game.allianceHandler.creationAlliance", {name:name,headPortraitUrl:"",clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);
                }
                return ;
            }           
            Alert.show("创建俱乐部成功！",function(){
                cc.director.loadScene("allianceList");  
            });
        });         
    },
    start () {

    },

    // update (dt) {},
});
