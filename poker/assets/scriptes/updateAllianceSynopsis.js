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
        },
        synopsisEditBox:{
            default: null,                
            type: cc.EditBox     
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
        this.synopsisEditBox.string = this.allianceInfo.synopsis?this.allianceInfo.synopsis:"";

        this.saveBut.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.saveBut,function(){
                self.saveClubInfo();
            });
        }, this);
    },
    saveClubInfo(){
        let self = this;
        let synopsis = self.synopsisEditBox.string;

        NetUtil.pomeloRequest("game.allianceHandler.updateSynopsis", {synopsis:synopsis,clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);
                }
                return ;
            }     
            Alert.show("保存成功！",function(){
                cc.director.loadScene("allianceManagement");  
            });
        });         
    },
    start () {

    },

    // update (dt) {},
});
