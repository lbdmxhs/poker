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
        qdcjBut:{
            default: null,   
            type: cc.Sprite,  
        },
        zssLabel:{
            default: null,   
            type: cc.Label,  
        },
        clubNameEditBox:{
            default: null,   
            type: cc.EditBox    
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Title.creation("创建俱乐部","club");
        let self = this;
        self.qdcjBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qdcjBut.node,function(){
                self.clickQdcjBut();
            });
        },self); 
        self.queryCreationClubJewel();
    },
    queryCreationClubJewel(){
        let self = this;

        NetUtil.pomeloRequest("game.gameHandler.creationClubJewel",{},function(data){
            if(data.code!=200){
                return ;
            }
            self.zssLabel.string = data.data.value;
        },false);

    },
    clickQdcjBut(){
        let self = this;
        let name = this.clubNameEditBox.string;
        
        if(!name){
            Alert.show("名称不能为空！");
            return ;
        }
        NetUtil.pomeloRequest("game.gameHandler.addclub", {name:name,headPortraitUrl:""},function(data){
            if(data.code!=200){
                if(data.msg){
                    Alert.show(data.msg);
                }
                return ;
            }           
            Alert.show("创建俱乐部成功！",function(){
                cc.director.loadScene("club");  
            });
        });         
    },
    start () {

    },

    // update (dt) {},
});
