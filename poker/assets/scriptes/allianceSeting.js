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
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var HeadPortraitsLoad= require("HeadPortraitsLoad");
var UnitTools = require("UnitTools");
var CommonConfig = require("CommonConfig");
cc.Class({
    extends: cc.Component,

    properties: {
        commissionercentageeditbox:{
            default: null,                
            type: cc.EditBox 
        },
        saveBut:{
            default: null,                
            type: cc.Node
        }
    },
  
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("联盟设置","allianceManagement"); 
        this.clubInfo =  GlobalData.getScenesParameter();
        this.alliance = GlobalData.getParameter("allianceSeting"); 
        console.log(this.alliance);
        if(!this.clubInfo ){
            this.clubInfo = {};
        }
        this.commissionercentageeditbox.string = this.alliance.commissionercentage;
        self.saveBut.on(cc.Node.EventType.TOUCH_START, function (event) {
            ButAnimation.play(self.saveBut,function(){
                self.updateCommissioner();
            });
        }, this);
    },
    updateCommissioner(){
        let self = this;
        var commissionercentage  =  this.commissionercentageeditbox.string;
        commissionercentage = Math.abs(Math.floor(Number(commissionercentage)));
        if(commissionercentage<0){
            Alert.show("请输入正确比例");   
            return ;
        }
        var commissiontype = "1";
        NetUtil.pomeloRequest("game.allianceHandler.updateCommissioner",{clubid:self.clubInfo.id,commissionercentage:commissionercentage,commissiontype:commissiontype},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            
        });
    },
    start () {

    },

    // update (dt) {},
});
