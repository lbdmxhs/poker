// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var Alert = require("Alert");

var HeadPortraitNode = require("HeadPortraitNode");
var CardTableNode = require("CardTableNode");
var DiamondExchangeNode = require("DiamondExchangeNode");

var MemberListNode = require("MemberListNode");
cc.Class({
    extends: cc.Component,

    properties: {
        gamblingBut:{
            default:null,
            type:cc.Sprite  
        },
        clubBut:{
            default:null,
            type:cc.Sprite  
        },
        historyBut:{
            default:null,
            type:cc.Sprite  
        },
        personBut:{
            default:null,
            type:cc.Sprite  
        },
        cardTableRecordBut:{
            default:null,
            type:cc.Sprite  
        },
        currentScene:"1"//1牌局场景 2俱乐部场景 3牌局记录场景 4个人场景 
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        if(this.currentScene!="1"){
            this.gamblingBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
                self.unifyAffair();
                cc.director.loadScene("hall");
            },this);  
        }
        if(this.currentScene!="2"){
            this.clubBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
                self.unifyAffair();
                cc.director.loadScene("club");
            },this);  
        }
        if(this.currentScene!="3"){
            this.historyBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
                self.unifyAffair();
                cc.director.loadScene("record");
            },this);  
        }
        if(this.currentScene!="4"){
            this.personBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
                self.unifyAffair();
                cc.director.loadScene("persons");
            },this);  
        }
        this.cardTableRecordBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            Alert.show("上桌记录！");
        },this);  
    },
    unifyAffair(){
        // if(this.currentScene=="1"){
        //    HeadPortraitNode.recycleNodeAll();
        //    CardTableNode.recycleNodeAll();
        // }
        // if(this.currentScene=="2"){
        //     DiamondExchangeNode.recycleNodeAll();
            
        //     MemberListNode.recycleNodeAll();
        // }


    },

    start () {

    },

    // update (dt) {},
});
