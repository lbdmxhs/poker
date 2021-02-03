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
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var HeadPortraitsLoad = require("HeadPortraitsLoad");
var ButAnimation = require("ButAnimation");
var Alert = require("Alert");
var CommonConfig = require("CommonConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        updateNameEditBox:{
            default: null,                
            type: cc.EditBox   
        },
        nameLabel:{
            default: null,                
            type: cc.Label   
        },
        txSprite:{
            default: null,                
            type: cc.Sprite  
        },
        saveBut:{
            default: null,                
            type: cc.Sprite  
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("联盟信息","allianceManagement");
        this.clubInfo =  GlobalData.getScenesParameter();
        this.allianceInfo = GlobalData.getParameter("alliance"); 
        this.nameLabel.string =  this.allianceInfo.name;
        HeadPortraitsLoad.Load(self.txSprite.node,CommonConfig.getHttpUrl()+self.allianceInfo.headPortraitUrl);
        this.queryUpdateAllianceJewel();
        this.saveBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.saveBut,function(){
                self.saveAllianceInfo();
            });
        }, this);
    },
    queryUpdateAllianceJewel(){

        let self = this;
        NetUtil.pomeloRequest("game.allianceHandler.queryUpdateAllianceJewel",{},function(data){
            if(data.code!=200){
                return ;
            }
            self.updateNameEditBox.placeholder = "(修改名称将花费"+data.data.value+"钻石)";
        },false);
    },
    saveAllianceInfo(){
        let self = this;
        let name = self.updateNameEditBox.string;
        
        if(!name){
            Alert.show("名称不能为空！");
            return ;
        }
        NetUtil.pomeloRequest("game.allianceHandler.updateAllianceName", {name:name,clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);
                }
                return ;
            }     
            self.clubInfo.name = name;      
            Alert.show("保存成功！",function(){
                cc.director.loadScene("allianceManagement");  
            });
        });         
    },
    start () {

    },

    // update (dt) {},
});
