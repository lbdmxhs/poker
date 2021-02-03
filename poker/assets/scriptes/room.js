// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var SeatNode = require("SeatNode");
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var Alert = require("Alert");
var ButAnimation =  require("ButAnimation");
cc.Class({
    extends: cc.Component,

    properties: {
        allSeatNode:cc.Node,
        seatNrNode:cc.Prefab,
        seatTxNode:cc.Prefab  ,
        seatTbNode:cc.Prefab ,
        seatHandNode:cc.Prefab ,
        publicPokerNode:cc.Node,
        countDownNode:cc.Node,
        particleNode:cc.Prefab,
        menuNode:cc.Node,
        zfNode:cc.Node ,
        qdBut:cc.Node ,
        qxBut:cc.Node ,
        goldLabel:cc.Label ,
        jewelLabel:cc.Label  ,
        jbEditBox:cc.EditBox,
        selfPokerNode1:cc.Node,
        selfPokerNode2:cc.Node,
        selfBet:cc.Node,
        selfBetLabel:cc.Node,
        selfButton:cc.Node,
        selfOpinion:cc.Node,
        actionNode:cc.Node,
        selfCountDownNode:cc.Node,
        selfCountdownParticle:cc.Node,
        actionNrNode:cc.Node,
        actionTbNode:cc.Node,
        potLabel:cc.Label  ,
        sliderNode:cc.Node,
        freedomFillAnteLabel:cc.Label  ,
        freedomFillSlider:cc.Slider  ,
        pkAtlas:cc.SpriteAtlas
    },
    showPotLabel(pot){
        let self = this;
        if(pot){
            self.potLabel.node.active = true;
            self.potLabel.string="底池："+pot;    
        }
    },
    // LIFE-CYCLE CALLBACKS:
     onLoad () {
        let self = this;
        self.allPkNode = {};
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            pomelo.off("onRoom");
        },this);
        this.clubId = GlobalData.getParameter("room_clubId");
        this.room = GlobalData.getParameter("room_room");
        this.loginUser = GlobalData.getParameter("user");
        self.showPotLabel(this.room.pot);
     
        SeatNode.init({
            allSeatNode:this.allSeatNode,
            seatNrNode:this.seatNrNode,
            seatTxNode:this.seatTxNode,
            seatTbNode:this.seatTbNode,
            seatHandNode:this.seatHandNode,
            particleNode:this.particleNode,
            seatNumber:this.room.maxPeopleNumber,
            clickPortrait:this.clickPortrait.bind(this),
            room:this.room,
            pkAtlas:this.pkAtlas,
            selfNode:{
                selfBet: this.selfBet,
                selfBetLabel: this.selfBetLabel,
                selfButton: this.selfButton,
                selfOpinion: this.selfOpinion,
                selfPokerNode1: this.selfPokerNode1,
                selfPokerNode2: this.selfPokerNode2,
                selfCountDownNode:this.selfCountDownNode,
                selfCountdownParticle:this.selfCountdownParticle,
                actionNode:this.actionNode,
            }
        });
        var operationUser =  this.room.operationUser;
        if(operationUser){
            if(this.loginUser.id == operationUser.id ){
                self.showAnteMoney(this.room.maxBet,this.room.pot,operationUser)
            }
            SeatNode.showCountdown(operationUser.seatnumber,this.room.timeout,this.room.maxTimeout);
        }
        if(this.room.selfPk){
            self.allPkNode[this.room.selfPk[0]]  = self.selfPokerNode1;
            self.allPkNode[this.room.selfPk[1]]  = self.selfPokerNode2;
            self.selfPokerNode1.getComponent("pokerNode").showPoker(self.pkString(this.room.selfPk[0]));
            self.selfPokerNode2.getComponent("pokerNode").showPoker(self.pkString(this.room.selfPk[1]));
        }
        if(this.room.dealCards){
        
            this.room.dealCards.forEach(function(item,index){
                self.publicPokerNode.getChildByName("pokerNode"+index).getComponent("pokerNode").showPoker(self.pkString(item));
                self.allPkNode[item] = self.publicPokerNode.getChildByName("pokerNode"+index);
            });
        }
        pomelo.on('onRoom', function(reason) {
            console.log(reason);
            var type = reason.type;
            if(type == "1"){
                var user = reason.data.user;
                var seatnumber = reason.data.seatnumber;
                SeatNode.userDown(seatnumber,user,self.menuClick.bind(self));
            }
            if(type == "2"){
                var user = reason.data.user;
                SeatNode.userUpdate(user);
            }
            if(type == "3"){
                var seatnumber = reason.data.seatnumber;
                var userid = reason.data.userid;
                SeatNode.userStand(seatnumber,userid);
            }
            if(type == "4"){
                self.showPotLabel(reason.data.pot);
                SeatNode.deal(reason.data);
            }
            if(type == "5"){
                // SeatNode.deal(reason.data);
                self.allPkNode = {};
                var interval = setInterval(function(){
                    clearTimeout(interval);
                    // var pk1 = reason.pkarr[0].replaceAll('11','J').replaceAll('12','Q').replaceAll('13','K').replaceAll('14','A');
                    // var pk2 = reason.pkarr[1].replaceAll('11','J').replaceAll('12','Q').replaceAll('13','K').replaceAll('14','A');
                    self.allPkNode[reason.pkarr[0]] = self.selfPokerNode1;
                    self.allPkNode[reason.pkarr[1]] = self.selfPokerNode2;
                    self.selfPokerNode1.getComponent("pokerNode").showPoker(self.pkString(reason.pkarr[0]));
                    self.selfPokerNode2.getComponent("pokerNode").showPoker(self.pkString(reason.pkarr[1]));
          
                },500);
            }
            if(type == "6"){
                var interval = setInterval(function(){
                    self.showPotLabel(reason.data.pot);
                    clearTimeout(interval);
                    SeatNode.blindsAnte(reason.data);
                    
                },500);
          
            }
            if(type == "7"){
                self.showPotLabel(reason.data.pot);
                if(self.loginUser.id == reason.data.user.id ){
                    self.showAnteMoney(reason.data.maxBet,reason.data.pot,reason.data.user)
                }
                SeatNode.showCountdown(reason.data.seatnumber,reason.data.timeout,reason.data.maxTimeout);
               
            }
            if(type == "8"){
                SeatNode.userAnte(reason.data.user,reason.data.user.operationType);  
            }
            if(type == "9"){
                SeatNode.moveJetton();
                var phaseType = reason.data.phaseType;
                var dealCards = reason.data.dealCards;
                if(phaseType==2){
                    self.allPkNode[dealCards[0]] = self.publicPokerNode.getChildByName("pokerNode0");
                    self.allPkNode[dealCards[1]] = self.publicPokerNode.getChildByName("pokerNode1");
                    self.allPkNode[dealCards[2]] = self.publicPokerNode.getChildByName("pokerNode2");
                     self.publicPokerNode.getChildByName("pokerNode0").getComponent("pokerNode").showPoker(self.pkString(dealCards[0]));
                     self.publicPokerNode.getChildByName("pokerNode1").getComponent("pokerNode").showPoker(self.pkString(dealCards[1]));  
                     self.publicPokerNode.getChildByName("pokerNode2").getComponent("pokerNode").showPoker(self.pkString(dealCards[2]));        
                }
                if(phaseType==3){
                    self.allPkNode[dealCards[3]] = self.publicPokerNode.getChildByName("pokerNode3");
                    self.publicPokerNode.getChildByName("pokerNode3").getComponent("pokerNode").showPoker(self.pkString(dealCards[3]));   
                }
                if(phaseType==4){
                    self.allPkNode[dealCards[4]] = self.publicPokerNode.getChildByName("pokerNode4");
                    self.publicPokerNode.getChildByName("pokerNode4").getComponent("pokerNode").showPoker(self.pkString(dealCards[4]));   
                }
                // SeatNode.userAnte(reason.data.user,reason.data.user.operationType);  
            }
            if(type == "10"){
                if(reason.data.winUserArr){
                    SeatNode.moveJetton();
                    var t = 2000;
                    if(reason.data.playingUserArr){
                        reason.data.playingUserArr.forEach(function(item){
                            if(item.pkArr&&item.pkArr.length>0){
                                SeatNode.showBigPokeFront (item.seatnumber,self.pkString(item.pkArr[0]),self.pkString(item.pkArr[1]));
                            }
                            if(item.id == self.loginUser.id){
                                //标识中的牌型
                                if(item.cardType&&item.cardType.resultArr){
                                    item.cardType.resultArr.forEach(function(pkinfo){
                                        var pk = pkinfo.color+"_"+pkinfo.num;
                                        var pknode = self.allPkNode[pk];
                                        if(pknode){
                                            pknode.getComponent("pokerNode").selected(); 
                                        }
                                    });   
                                }     
                            }
                        });
                        t = 0;
                    }
                    var interval = setInterval(function(){ 
                        clearTimeout(interval);
                        SeatNode.winParticlestar(reason.data.winUserArr[0].seatnumber);
                        self.potLabel.node.active = false;
                        reason.data.winUserArr.forEach(function(item){
                            SeatNode.backBet(item.seatnumber);
                            SeatNode.userUpdate(item);
                        });
                    },3000-t); 
                    var interval1 = setInterval(function(){ 
                        clearTimeout(interval1);
                        SeatNode.initShow();
                        self.selfPokerNode1.getComponent("pokerNode").reset();
                        self.selfPokerNode2.getComponent("pokerNode").reset();
                        self.publicPokerNode.getChildByName("pokerNode0").getComponent("pokerNode").reset();
                        self.publicPokerNode.getChildByName("pokerNode1").getComponent("pokerNode").reset();
                        self.publicPokerNode.getChildByName("pokerNode2").getComponent("pokerNode").reset();
                        self.publicPokerNode.getChildByName("pokerNode3").getComponent("pokerNode").reset();
                        self.publicPokerNode.getChildByName("pokerNode4").getComponent("pokerNode").reset();

                    },4000-t); 
                } 
                
            }
            if(type == "11"){
                Alert.show("游戏已结束",function(){
                    cc.director.loadScene("hall");
                });    
            }
         });

         NetUtil.pomeloRequest("room.roomHandler.enterRoom",{clubid:self.clubId,roomid:self.room.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            if(self.clubId!=data.data.clubid){
                self.clubId = data.data.clubid;
                Alert.show("上一个俱乐部未结算，已切换到该俱乐部");             
            }
        });
        // this.f = 0;
        // creates the action with a set boundary
        // var followAction = cc.follow(bjnode, cc.rect(0, 0, screenWidth * 2 - 100, screenHeight));
        // bjnode.runAction(followAction);
        
        // // creates the action with   boundary set
        // var followAction = cc.follow(targetNode);
        // bjnode.runAction(followAction);
     },
     pkString(pk){
        return pk.replaceAll('11','J').replaceAll('12','Q').replaceAll('13','K').replaceAll('14','A');
     },
     clickPortrait(seatNumber,seatInfo){
         let self = this;
        //console.log(seatNumber);
        //console.log(seatInfo);
        if(seatInfo.user){

        }else{
            NetUtil.pomeloRequest("room.roomHandler.takeSeatRoom",{clubid:self.clubId,roomid:self.room.id,seatnumber:seatNumber},function(data){
                if(data.code!=200){
                    Alert.show(data.msg);   
                    return ;
                }

                // SeatNode.userDown
                console.log(data);
            });
        }
     },
     menuTbClick(){
        this.menuNode.active = true;
     },
     closeMenuClick(){
        console.log("closeMenuClick");
        this.menuNode.active = false;
     },
     menuClick(event,data){
         console.log(data);
        this.menuNode.active = false; 
        if(data == 1){
            this.userStand();
        }
        if(data == 2){
           this.queryJettonJewelConfig(); 
        }
        if(data == 3){
            this.userClosing(); 
         }
         if(data == 4){
            this.quitRoom(); 
         }
         
     },
     sfNodeClick(event,data){
        let self = this;
        console.log(data);
        if(data == "1"){
            ButAnimation.play(self.qdBut,function(){
                var jetton =   self.jbEditBox.string;
                if(!jetton){
                    return ;
                }
                self.zfNode.active = false; 
                self.roomAddJettonJewel(jetton);
            });
        }
        if(data == "2"){
            ButAnimation.play(self.qxBut,function(){
                self.zfNode.active = false; 
            });
        }
   
     },
     roomAddJettonJewel(jetton){
        let self = this;
        // var clubid = msg.clubid;
        // var roomid = msg.roomid;
        // var jetton = msg.jetton;
        // var seatnumber = msg.seatnumber;
        NetUtil.pomeloRequest("room.roomHandler.roomAddJettonJewel",{clubid:self.clubId,roomid:self.room.id,jetton:jetton},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
        });
     },
     //离开房间
     quitRoom(){
        let self = this;
        NetUtil.pomeloRequest("room.roomHandler.quitRoom",{clubid:self.clubId,roomid:self.room.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            cc.director.loadScene("hall");
        },false);
     },
     queryJettonJewelConfig(){
        let self = this;
        NetUtil.pomeloRequest("room.roomHandler.queryJettonJewelConfig",{clubid:self.clubId},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
            self.zfNode.active = true; 
            // SeatNode.userDown
            self.goldLabel.string = data.data.goldNumber;
            self.jewelLabel.string = data.data.roomAddJettonJewel;
            // console.log(data);
        });
     },
     //站起围观
     userStand(){
        let self = this;
        NetUtil.pomeloRequest("room.roomHandler.userStand",{roomid:self.room.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
        });
     },
     //结算
     userClosing(){
        let self = this;
        NetUtil.pomeloRequest("room.roomHandler.userClosing",{clubid:self.clubId,roomid:self.room.id},function(data){
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
        });
     },
     userAnteClick(event,data){
        let self = this;
        if(self.isClick){
            return ;
        }
        self.isClick  =true;
        NetUtil.pomeloRequest("room.roomHandler.userAnte",{type:data,roomid:self.room.id},function(data){
            self.isClick  =false;
            var nrHiddenNode = self.actionNrNode.getChildByName("hiddenNode");
            var tbHiddenNode = self.actionTbNode.getChildByName("hiddenNode");
            nrHiddenNode.active = true;
            tbHiddenNode.active = true;
            self.sliderNode.active = false;   

            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
        },false); 
     },
     //自由加注
     freedomFillClick(){
        let self = this;
        var nrHiddenNode = self.actionNrNode.getChildByName("hiddenNode");
        var tbHiddenNode = self.actionTbNode.getChildByName("hiddenNode");
        nrHiddenNode.active = false;
        tbHiddenNode.active = false;
        self.sliderNode.active = true;
        // freedomFillAnteLabel:cc.Label  ,
        // freedomFillSlider:cc.Slider  ,
        // self["freedomFillInfo"] = {
        //     minAnte:7,
        //     maxAnte:200
        // }
        self.freedomFillSlider.progress = 0;
        self.freedomFillAnteLabel.string =  self.freedomFillInfo.minAnte;
     },
     sliderEvents(data){
        let self = this;
        // console.log(data);
        var minAnte = self.freedomFillInfo.minAnte;
        var maxAnte = self.freedomFillInfo.maxAnte;
        var c = maxAnte - minAnte;      
        self.freedomFillAnteLabel.string =  minAnte+  Math.ceil(c*self.freedomFillSlider.progress);
     },
     confirmFreedomFill(){
        let self = this;
        if(self.isClick){
            return ;
        }

        var minAnte = self.freedomFillInfo.minAnte;
        var maxAnte = self.freedomFillInfo.maxAnte;
        var c = maxAnte - minAnte;      
        var ante =  minAnte+  Math.ceil(c*self.freedomFillSlider.progress);
        self.isClick  =true;
        NetUtil.pomeloRequest("room.roomHandler.userAnte",{type:"-1",roomid:self.room.id,ante:ante},function(data){
            self.isClick  =false;

            var nrHiddenNode = self.actionNrNode.getChildByName("hiddenNode");
            var tbHiddenNode = self.actionTbNode.getChildByName("hiddenNode");
            nrHiddenNode.active = true;
            tbHiddenNode.active = true;
            self.sliderNode.active = false;   
  
            if(data.code!=200){
                Alert.show(data.msg);   
                return ;
            }
        },false); 

     },
     testClick(){
        //console.log("1111111111");
        // this.pokerNode.getComponent("pokerNode").showPoker("HX_A");
        // SeatNode.showBigPoke(this.f);
        // SeatNode.showBigPokeFront(this.f,"HX_A","FK_A");
        // SeatNode.showCountdown(this.f,30*1000,30*1000);
        // SeatNode.winParticlestar( this.f%9);
        // SeatNode.allParticlestar(this.f%9);
        // SeatNode.userAction(this.f%9,1,this.f);
        // SeatNode.deal(this.f%9);
        if( !this.f ){
            this.f  = 0;
        }
        this.f = this.f+1;
        // var a = [];
        // a[1] = 123;
        // a[4] = 123;
        // a.forEach(function(item,index){
        //     // console.log(item);
        //     console.log(index);
        // });
        // console.log(a);
        // this.showCountdown();
        // this.selfPokerNode1.getComponent("pokerNode").showPoker("MH_A");
        // this.selfPokerNode2.getComponent("pokerNode").showPoker("MH_A");
        // if(this.f%2 == 0){
        //     SeatNode.userAction(0,1,"1");
        // }else{
        //     SeatNode.moveJetton();
        // }
        // this.actionNode.active = true;
        // SeatNode.backBet( this.f);
        // {userid:tempUser.id,seatnumber:tempUser.seatnumber,
        // timeout:room.timeout,maxTimeout:room.maxTimeout,pot:room.pot,maxBet:room.maxBet}
     },
    showAnteMoney(maxBet,pot,user){

        let self = this;
        self["freedomFillInfo"] = {
            minAnte:maxBet-user.currentBet>user.jetton?user.jetton:maxBet-user.currentBet,
            maxAnte:user.jetton
        };
        self.actionNrNode.getChildByName("sumLabel").getComponent(cc.Label).string = user.jetton;    
        if(maxBet-user.currentBet>user.jetton){
            self.actionTbNode.getChildByName("ic_operate_pk").active = false;
            self.actionTbNode.getChildByName("ic_operate_gz").active = true;
            self.actionNrNode.getChildByName("callLabel").active = true;
            self.actionNrNode.getChildByName("callLabel").getComponent(cc.Label).string =user.jetton;    
            self.actionNrNode.getChildByName("callOrSeeLabel").getComponent(cc.Label).string = "allin";    
        }else{
            if(maxBet ==0){
                // actionNrNode:cc.Node,
                // actionTbNode:cc.Node,
                self.actionTbNode.getChildByName("ic_operate_pk").active = true;
                self.actionTbNode.getChildByName("ic_operate_gz").active = false;
                self.actionNrNode.getChildByName("callLabel").active = false;
                self.actionNrNode.getChildByName("callOrSeeLabel").getComponent(cc.Label).string = "看牌";
            }else{
                self.actionTbNode.getChildByName("ic_operate_pk").active = false;
                self.actionTbNode.getChildByName("ic_operate_gz").active = true;
                self.actionNrNode.getChildByName("callLabel").active = true;
                self.actionNrNode.getChildByName("callLabel").getComponent(cc.Label).string = maxBet-user.currentBet;    
                self.actionNrNode.getChildByName("callOrSeeLabel").getComponent(cc.Label).string = "跟注";   
            }
        }
        var hiddenNode = self.actionNrNode.getChildByName("hiddenNode");
        var zs1_3 = Math.ceil(pot/3)+maxBet;
        var zs1_2 = Math.ceil(pot/2)+maxBet;
        var zs2_3 = Math.ceil((pot/3)*2)+maxBet;
        var zs3_4 = Math.ceil((pot/4)*3)+maxBet;
        var zs1 = pot+maxBet;
        var zs1_3 = (zs1_3-user.currentBet)>user.jetton?user.currentBet+user.jetton:zs1_3;
        var zs1_2 = (zs1_2-user.currentBet)>user.jetton?user.currentBet+user.jetton:zs1_2;
        var zs2_3 = (zs2_3-user.currentBet)>user.jetton?user.currentBet+user.jetton:zs2_3;
        var zs3_4 = (zs3_4-user.currentBet)>user.jetton?user.currentBet+user.jetton:zs3_4;
        var zs1 = (zs1-user.currentBet)>user.jetton?user.currentBet+user.jetton:zs1;

        hiddenNode.getChildByName("1_3Label").getComponent(cc.Label).string =zs1_3;
        hiddenNode.getChildByName("1_2Label").getComponent(cc.Label).string =zs1_2;
        hiddenNode.getChildByName("2_3Label").getComponent(cc.Label).string =zs2_3;
        hiddenNode.getChildByName("3_4Label").getComponent(cc.Label).string =zs3_4;
        hiddenNode.getChildByName("1_1Label").getComponent(cc.Label).string =zs1;
    },
    start () {

    },
    update (dt) {
      
    },
});
