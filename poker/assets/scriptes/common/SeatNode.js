var GlobalData =  require("GlobalData");
var CommonConfig =  require("CommonConfig");
var HeadPortraitsLoad = require("HeadPortraitsLoad");
class SeatNode{};
SeatNode.coordinatesMap = {
    2:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.44,top:0.05,flag:"top"}],
    3:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,top:0.30,flag:"left"},{right:0.04,top:0.30,flag:"right"}],
    4:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,top:0.35,flag:"left"},{left:0.44,top:0.05,flag:"top"},{right:0.04,top:0.35,flag:"right"}],
    5:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,top:0.35,flag:"left"},{left:0.3,top:0.05,flag:"top"},{right:0.3,top:0.05,flag:"top"},{right:0.04,top:0.35,flag:"right"}],
    6:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,bottom:0.35,flag:"left"},{left:0.04,top:0.3,flag:"left"},{left:0.44,top:0.05,flag:"top"}
             ,{right:0.04,top:0.30,flag:"right"},{right:0.04,bottom:0.35,flag:"right"}],
    7:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,bottom:0.35,flag:"left"},{left:0.04,top:0.3,flag:"left"},{left:0.3,top:0.05,flag:"top"},{right:0.3,top:0.05,flag:"top"}
             ,{right:0.04,top:0.30,flag:"right"},{right:0.04,bottom:0.35,flag:"right"}],
    8:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,bottom:0.35,flag:"left"},{left:0.04,bottom:0.55,flag:"left"},{left:0.04,top:0.2,flag:"left"},{left:0.44,top:0.05,flag:"top"}
             ,{right:0.04,top:0.2,flag:"right"},{right:0.04,bottom:0.55,flag:"right"},{right:0.04,bottom:0.35,flag:"right"}],
    9:[{left:0.44,bottom:0.15,flag:"bottom"},{left:0.04,bottom:0.35,flag:"left"},{left:0.04,bottom:0.55,flag:"left"},{left:0.04,top:0.2,flag:"left"},{left:0.3,top:0.05,flag:"top"},{right:0.3,top:0.05,flag:"top"}
             ,{right:0.04,top:0.2,flag:"right"},{right:0.04,bottom:0.55,flag:"right"},{right:0.04,bottom:0.35,flag:"right"}],
};
SeatNode.seatInfoArr = [];
SeatNode.init = function(data){
    // console.log(data);
    SeatNode.pkAtlas = data.pkAtlas;
    SeatNode.allSeatNode = data.allSeatNode;
    SeatNode.seatNrNode = data.seatNrNode;
    SeatNode.seatTxNode = data.seatTxNode;
    SeatNode.seatTbNode = data.seatTbNode;
    SeatNode.seatHandNode = data.seatHandNode;

    SeatNode.seatNumber = data.seatNumber;
    SeatNode.particleNode = data.particleNode;
    SeatNode.clickPortrait = data.clickPortrait;
    SeatNode.loginUser = GlobalData.getParameter("user");
    SeatNode.room = data.room;
    SeatNode.selfNode = data.selfNode;
    SeatNode.seatInfoArr = [];
    console.log(SeatNode.loginUser);
    SeatNode.initNode();
    SeatNode.initAllUser();
}
//初始化所有用户信息
SeatNode.initAllUser = function(){
    var takeSeatUser =  SeatNode.room.takeSeatUser;
    if(takeSeatUser){
        for(var key in takeSeatUser){
            if(takeSeatUser[key]){
                SeatNode.userDown(key,takeSeatUser[key]); 
            }  
        }
    }
    var gameUser = SeatNode.room.gameUser;
    if(gameUser){
        for(var key in gameUser){
            var user = gameUser[key];
            SeatNode.userAnte(user,user.operationType);  
            var seatInfo = SeatNode.seatInfoArr[user.seatnumber];
            if(user.id != SeatNode.loginUser.id){
                seatInfo["pk"].active = true;
            }
        }
    }    
}   
//当自己坐下时移动位置
SeatNode.moveSeat = function(seatNumber){
    seatNumber = Number(seatNumber);
    var oldArr =SeatNode.coordinatesMap[SeatNode.seatNumber];

    oldArr.forEach(function(item,index){
        // var moveItem = oldArr[(seatNumber+index)%oldArr.length];
        var cIndex = (seatNumber+index)%oldArr.length;
        var seatInfo = SeatNode.seatInfoArr[cIndex];
        var position =SeatNode.positionArr[index]; 
        seatInfo["position"] = position;
        SeatNode.moveNode(seatInfo ["seatNrNode"] ,position);
        SeatNode.moveNode(seatInfo ["seatTxNode"] ,position);
        SeatNode.moveNode(seatInfo ["seatTbNode"] ,position);
        SeatNode.moveNode(seatInfo ["seatHandNode"] ,position);
        SeatNode.moveNode(seatInfo ["particleNode"] ,position);

        // SeatNode.setWidget(seatInfo ["seatNrNode"] ,item);
        // SeatNode.setWidget(seatInfo ["seatTxNode"] ,item);
        // SeatNode.setWidget(seatInfo ["seatTbNode"] ,item);
        // SeatNode.setWidget(seatInfo ["seatHandNode"] ,item);
        // SeatNode.setWidget(seatInfo ["particleNode"] ,item);
        seatInfo ["coordinates"] = item;  
        SeatNode.setSeatInfo(seatInfo ["seatNrNode"],
                                seatInfo ["seatTxNode"],
                                seatInfo ["seatTbNode"],
                                seatInfo ["seatHandNode"],
                                seatInfo ["particleNode"],item,
                                seatInfo);
        // arr.push(oldArr[(seatNumber+index)%oldArr.length]);  
    });
    // SeatNode.coordinatesArr = arr;
    // console.log(arr);
    // arr.forEach(function(item,index){
    // });
}
SeatNode.moveNode = function(node,position){
    node.stopAllActions();
    node.runAction(
        cc.sequence(
          cc.moveTo(0.3,position),
          cc.callFunc(() => {
            
          })
        )
    ); 
}
SeatNode.initNode = function(){
    var arr = SeatNode.coordinatesMap[SeatNode.seatNumber];
    SeatNode.coordinatesArr = arr;
    arr.forEach(function(item,index){
        let seatTxNode = cc.instantiate(SeatNode.seatTxNode);
        SeatNode.allSeatNode.addChild(seatTxNode);
        seatTxNode.on(cc.Node.EventType.TOUCH_START,function (args) {
            // console.log("------------------");

            
            if(SeatNode.clickPortrait ){
                SeatNode.clickPortrait(index,SeatNode.seatInfoArr[index]);
            }
        },this);
        SeatNode.setWidget(seatTxNode,item);
        if(!SeatNode.seatInfoArr[index]){
            SeatNode.seatInfoArr[index] = {};
        }
        SeatNode.seatInfoArr[index] ["seatTxNode"] = seatTxNode;
    });
    arr.forEach(function(item,index){
        let seatTbNode = cc.instantiate(SeatNode.seatTbNode);
        SeatNode.allSeatNode.addChild(seatTbNode);
        SeatNode.setWidget(seatTbNode,item);
        if(!SeatNode.seatInfoArr[index]){
            SeatNode.seatInfoArr[index] = {};
        }
        SeatNode.seatInfoArr[index] ["seatTbNode"] = seatTbNode;
    });
    arr.forEach(function(item,index){
        let seatNrNode = cc.instantiate(SeatNode.seatNrNode);
        SeatNode.allSeatNode.addChild(seatNrNode);
        SeatNode.setWidget(seatNrNode,item);
        if(!SeatNode.seatInfoArr[index]){
            SeatNode.seatInfoArr[index] = {};
        }

        // seatNrNode.getChildByName("nameLabel").getComponent(cc.Label).string =seatNrNode.getChildByName("nameLabel").getComponent(cc.Label).string+index ;
       
        SeatNode.seatInfoArr[index] ["seatNrNode"] = seatNrNode;
    });
    arr.forEach(function(item,index){
        let particleNode = cc.instantiate(SeatNode.particleNode);
        SeatNode.allSeatNode.addChild(particleNode);
        SeatNode.setWidget(particleNode,item);
        SeatNode.seatInfoArr[index] ["particleNode"] = particleNode;
    });
    arr.forEach(function(item,index){
        let seatHandNode = cc.instantiate(SeatNode.seatHandNode);
        SeatNode.allSeatNode.addChild(seatHandNode);
        SeatNode.setWidget(seatHandNode,item);
        if(!SeatNode.seatInfoArr[index]){
            SeatNode.seatInfoArr[index] = {};
        }
        SeatNode.seatInfoArr[index] ["seatHandNode"] = seatHandNode;
    });
    SeatNode.positionArr  = [];
    arr.forEach(function(item,index){
        SeatNode.seatInfoArr[index] ["coordinates"] = item;  

         SeatNode.positionArr.push(SeatNode.seatInfoArr[index] ["seatNrNode"].position);
         SeatNode.setSeatInfo(SeatNode.seatInfoArr[index] ["seatNrNode"],
                        SeatNode.seatInfoArr[index] ["seatTxNode"],
                        SeatNode.seatInfoArr[index] ["seatTbNode"],
                        SeatNode.seatInfoArr[index] ["seatHandNode"],
                        SeatNode.seatInfoArr[index] ["particleNode"],item,
                        SeatNode.seatInfoArr[index]);
    });

}
SeatNode.setWidget = function(node,widget){
    // console.log( node.getComponent(cc.Widget).left );
    if(widget["left"]){
        node.getComponent(cc.Widget).isAlignLeft = true;
        node.getComponent(cc.Widget).left = widget["left"];
    }else{
        node.getComponent(cc.Widget).isAlignLeft = false;   
    }

    if(widget["bottom"]){
        node.getComponent(cc.Widget).isAlignBottom = true;
        node.getComponent(cc.Widget).bottom = widget["bottom"];
    } else{
        node.getComponent(cc.Widget).isAlignBottom = false;   
    }

    if(widget["top"]){
        node.getComponent(cc.Widget).isAlignTop = true;
        node.getComponent(cc.Widget).top = widget["top"];
    } else{
        node.getComponent(cc.Widget).isAlignTop = false;   
    }

    if(widget["right"]){
        node.getComponent(cc.Widget).isAlignRight = true;
        node.getComponent(cc.Widget).right = widget["right"];
    } else{
        node.getComponent(cc.Widget).isAlignRight = false;   
    }
    node.getComponent(cc.Widget).updateAlignment();
}
SeatNode.setSeatInfo = function(seatNrNode,seatTxNode,seatTbNode,seatHandNode,particleNode,coordinatesInfo,seatInfo){

    seatInfo["txSprite"] = seatTxNode.getChildByName("txSprite"); 
    seatInfo["nameLabel"] = seatNrNode.getChildByName("nameLabel");
    seatInfo["jettonLabel"] = seatNrNode.getChildByName("jettonLabel"); 
    seatInfo["pk"] = seatTbNode.getChildByName("pk");

    seatInfo["countDownNode"] = seatTbNode.getChildByName("countDownNode"); 
    seatInfo["moveBet"] = seatTbNode.getChildByName("move_bet"); 

    seatInfo["coordinatesInfo"] = coordinatesInfo;  
    seatInfo["handNode1"] = seatHandNode.getChildByName("pokerNode1"); 
    seatInfo["handNode2"] = seatHandNode.getChildByName("pokerNode2"); 

    seatInfo["countdownParticle"] = particleNode.getChildByName("countdownParticle"); 
    seatInfo["allinParticle"] = particleNode.getChildByName("allinParticle"); 
    seatInfo["winstarParticle"] = particleNode.getChildByName("winstarParticle"); 

    seatInfo["Button"] = seatTbNode.getChildByName("Button"); 
    if(seatInfo["betLabel"]){
        var oldActivebetLabel =  seatInfo["betLabel"].active ;
        var oldActivebet =  seatInfo["bet"].active ;
        var oldActiveopinion =  seatInfo["opinion"].active ;
        var oldStringbetLabel =  seatInfo["betLabel"].getComponent(cc.Label).string;

        seatInfo["betLabel"].active = false;
        seatInfo["bet"].active = false;
        seatInfo["opinion"].active = false;
    }


    if(coordinatesInfo.flag == "top"){
        seatInfo["betLabel"] = seatNrNode.getChildByName("bottom_BetLabel"); 
        seatInfo["bet"] = seatTbNode.getChildByName("bottom_bet");
        seatInfo["opinion"] = seatTbNode.getChildByName("right_opinion");
    }
    if(coordinatesInfo.flag == "bottom"){
        seatInfo["betLabel"] = seatNrNode.getChildByName("top_BetLabel"); 
        seatInfo["bet"] = seatTbNode.getChildByName("top_bet");
        seatInfo["opinion"] = seatTbNode.getChildByName("right_opinion");
    }
    if(coordinatesInfo.flag == "left"){
        seatInfo["betLabel"] = seatNrNode.getChildByName("right_BetLabel"); 
        seatInfo["bet"] = seatTbNode.getChildByName("right_bet");
        seatInfo["opinion"] = seatTbNode.getChildByName("right_opinion");
    }
    if(coordinatesInfo.flag == "right"){
        seatInfo["betLabel"] = seatNrNode.getChildByName("left_BetLabel"); 
        seatInfo["bet"] = seatTbNode.getChildByName("left_bet");
        seatInfo["opinion"] = seatTbNode.getChildByName("left_opinion");
    }
    seatInfo["betLabel"].active = oldActivebetLabel?true:false;
    seatInfo["bet"].active = oldActivebet?true:false;
    seatInfo["opinion"].active = oldActiveopinion?true:false;

    seatInfo["betLabel"].getComponent(cc.Label).string = oldStringbetLabel?oldStringbetLabel:0;
    // return seatInfo;
}

//用户显示大扑克
SeatNode.showBigPoke  = function(seatNumber){
    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }
    SeatNode.seatInfoArr[seatNumber]["pk"].active = false;
    SeatNode.seatInfoArr[seatNumber]["handNode1"].active = true;
    SeatNode.seatInfoArr[seatNumber]["handNode2"].active = true;
    return ;
}

SeatNode.showBigPokeFront = function(seatNumber,front1,front2){
    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    if(seatInfo.user&&seatInfo.user.id != SeatNode.loginUser.id){
        seatInfo["pk"].active = false;
        seatInfo["handNode1"].getComponent("pokerNode").showPoker(front1);
        seatInfo["handNode2"].getComponent("pokerNode").showPoker(front2);
    }
}

//倒计时
SeatNode.showCountdown  = function(seatNumber,waitSces,normalSces)
{
 
    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }
    // //停止上一个动画
    // if(SeatNode.previousUserNode){
    //     SeatNode.previousUserNode["countDownNode"].stopAllActions();
    //     SeatNode.previousUserNode["countDownNode"].active = false;
    //     SeatNode.previousUserNode["countdownParticle"].active = false;
    //     if(SeatNode.previousUserNode.user&&SeatNode.previousUserNode.user.id == SeatNode.loginUser.id){
    //         SeatNode.selfNode.actionNode.active = false;
    //         seatInfo["txSprite"].active = true;
    //         seatInfo["jettonLabel"].active = true;   
    //     }
    // }
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    if(seatInfo.user&&seatInfo.user.id == SeatNode.loginUser.id){
        SeatNode.selfNode.actionNode.active = true;
        seatInfo["txSprite"].active = false;
        seatInfo["jettonLabel"].active = false;
    }

    // wait_sces = wait_sces * 1000;      //剩余倒计时时间
    // normal_sces = 30 * 1000;    //总倒计时时间
    let wait_sces = waitSces * 1000;      //剩余倒计时时间
    let normal_sces = normalSces * 1000;    //总倒计时时间
    let bStartWithZero = (wait_sces == normal_sces) ? true : false;

    let timer = (new Date()).valueOf();
    let cur_step = bStartWithZero ? 0 : (normal_sces - wait_sces);
    let all_step = normal_sces;
    let cur_step_temp = cur_step;

    let ui_countdown_comp = SeatNode.seatInfoArr[seatNumber]["countDownNode"].getComponent(cc.Sprite);
    ui_countdown_comp.node.color = cc.color(0, 255, 0);
    ui_countdown_comp.fillStart = 0.25;
    ui_countdown_comp.fillRange = 1 - (cur_step / all_step);
    ui_countdown_comp.node.stopAllActions();

    // 更新逻辑
    let call_back = cc.callFunc(() => {
        cur_step = bStartWithZero ? (new Date()).valueOf() - timer : (cur_step_temp + (new Date()).valueOf() - timer);
        if (cur_step > all_step) {
            ui_countdown_comp.node.stopAllActions();
            // self.ui_countdown.active = false;
            // self.ui_countdown_particle.active = false;
            SeatNode.seatInfoArr[seatNumber]["countDownNode"].active = false;
            SeatNode.seatInfoArr[seatNumber]["countdownParticle"].active = false;

            if(seatInfo.user&&seatInfo.user.id == SeatNode.loginUser.id){
                SeatNode.selfNode.actionNode.active = false;
                seatInfo["txSprite"].active = true;
                seatInfo["jettonLabel"].active = true;
            }
            
            return;
        }
        let step_fillrange = cur_step / all_step;
        ui_countdown_comp.fillRange = 1 - step_fillrange;
        var oldx = SeatNode.seatInfoArr[seatNumber]["countDownNode"].x;
        var oldy = SeatNode.seatInfoArr[seatNumber]["countDownNode"].y;
        SeatNode.showCountdownParticle (SeatNode.seatInfoArr[seatNumber]["countdownParticle"],step_fillrange,oldx,oldy);
    })

    // 动作执行
    let seq = cc.sequence(cc.delayTime(0.1), call_back);
    let repeater = cc.repeatForever(seq);
    ui_countdown_comp.node.active = true;
    ui_countdown_comp.node.runAction(repeater);
}
 //计算角度
 SeatNode.calculatorAngle = function(fillRange){
    return 90-360*fillRange<0?360 + (90-360*fillRange):90-360*fillRange;
}

SeatNode.showCountdownParticle = function(countdownParticle,step_fillrange,x,y){
    let self = this;
    let particle = countdownParticle.getComponent(cc.ParticleSystem);
    var x1 = 35 * Math.cos(self.calculatorAngle(step_fillrange) * Math.PI /180 ) +(x?x:0);
    var y1 = 35 * Math.sin(self.calculatorAngle(step_fillrange)  * Math.PI /180 )+(y?y:0);;

    // console.log(x1+":"+y1);
    particle.node.x = x1;
    particle.node.y = y1;
    if(!particle.node.active){
        particle.node.active = true;
    }
}

//赢后的粒子效果
SeatNode.winParticlestar = function(seatNumber){
    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    var node = seatInfo["winstarParticle"];
    node.active = true;
    if( node.active){
        node.getComponent(cc.ParticleSystem).resetSystem();
    }

}
//收回筹码
SeatNode.backBet = function(seatNumber){
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    var moveBetNode = seatInfo["moveBet"];
    var parentNode = seatInfo["seatTbNode"].parent;
    var newVec = moveBetNode.convertToNodeSpaceAR(cc.v2(parentNode.width/2, parentNode.height/2)); 
    moveBetNode.x = newVec.x;
    moveBetNode.y = newVec.y;
    moveBetNode.active = true;
    moveBetNode.stopAllActions();
    moveBetNode.runAction(
        cc.sequence(
          cc.moveTo(0.3,cc.v2( 0, 0)),
          cc.callFunc(() => {
            moveBetNode.active = false;
          })
        )
    ); 
}
//初始化显示
SeatNode.initShow = function(){
    SeatNode.seatInfoArr.forEach(function(item,index){

        item["betLabel"].active = false;
        item["bet"].active = false;
        item["opinion"].active = false;
        item["Button"].active = false;
        item["pk"].active = false;
        item["handNode1"].getComponent("pokerNode").reset();
        item["handNode2"].getComponent("pokerNode").reset();
        SeatNode.allParticleend(index);
    });
}

//开始allin 粒子效果
SeatNode.allParticlestar = function(seatNumber){
    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }

    var node = SeatNode.seatInfoArr[seatNumber]["allinParticle"];
  
    
    node.active = true;
    
}
//结束allin 粒子效果
SeatNode.allParticleend = function(seatNumber){
    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }
    var node = SeatNode.seatInfoArr[seatNumber]["allinParticle"];
    // node.getComponent(cc.ParticleSystem).stopSystem();
     node.active = false;
    
}

//用户做动作
/** 0 未进行任何操作 1加注 2跟注 3弃牌 4看牌 5allin\
 * actionType:0,底注 1：加注 ，2：跟注， 3:弃牌，4：看牌，5：allin，6Straddle,7小盲，8：大盲，
 */
SeatNode.userAction = function(seatNumber,actionType,betNumber){


    if(seatNumber>=SeatNode.seatInfoArr.length){
        return ;
    }
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    var moveBetNode = SeatNode.seatInfoArr[seatNumber]["moveBet"];
    var betNode = SeatNode.seatInfoArr[seatNumber]["bet"];
    var opinionNode = SeatNode.seatInfoArr[seatNumber]["opinion"];

    if(actionType!=0&&actionType!=7&&actionType!=8){
        //停止动画
        seatInfo["countDownNode"].stopAllActions();
        seatInfo["countDownNode"].active = false;
        seatInfo["countdownParticle"].active = false;
    }
    if(actionType!=0&&actionType!=7&&actionType!=8&&seatInfo.user&&seatInfo.user.id == SeatNode.loginUser.id){
        SeatNode.selfNode.actionNode.active = false;
        seatInfo["txSprite"].active = true;
        seatInfo["jettonLabel"].active = true;   
    }


    var newVec;
    if(seatInfo.user&&seatInfo.user.id == SeatNode.loginUser.id){
        newVec = cc.v2(betNode.x - moveBetNode.parent.x, betNode.y -moveBetNode.parent.y );
    }else{
        newVec =  betNode.position;
        if(actionType == 5){
            SeatNode.showBigPoke(seatNumber);
        }
    }
    var betLabel = SeatNode.seatInfoArr[seatNumber]["betLabel"];
 
    if(actionType == 1){
        opinionNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["raise"];
        opinionNode.active = true;
    }
    if(actionType == 2){
        opinionNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["call"];
        opinionNode.active = true;
    }
    if(actionType == 3){
        opinionNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["discard"];
        opinionNode.active = true;
    }
    if(actionType == 4){
        opinionNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["see"];
        opinionNode.active = true;
    }
    if(actionType == 5){
        opinionNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["allin"];
        opinionNode.active = true;
        SeatNode.allParticlestar(seatNumber);
    }
    if(actionType == 6){
        opinionNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["Straddle"];
        opinionNode.active = true;
    }

    if(actionType==0||actionType==1||actionType==2||actionType==5||actionType==6||actionType==7|actionType==8){
        moveBetNode.x = 0;
        moveBetNode.y = 0;
        if(betNumber){
            moveBetNode.active = true;   
        }
        moveBetNode.stopAllActions(); 
        moveBetNode.runAction(
            cc.sequence(
              cc.moveTo(0.3,cc.v2( newVec.x, newVec.y)),
              cc.callFunc(() => {
                moveBetNode.active = false;
                if(betNumber){
                    betNode.active = true;   
                    betLabel.active = true;
                }

                if(betNumber){
                    betLabel.getComponent(cc.Label).string = betNumber;
                }
                if(actionType==0){
                    betNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["bet_a"];
                }
                if(actionType==7){
                    betNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["bet_s"];  
                }
                if(actionType==8){
                    betNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["bet_b"];
                }
                if(actionType==1||actionType==2||actionType==5||actionType==6){
                    betNode.getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["bet"];
                }
              })
            )
        ); 
    }





}
//移除筹码
SeatNode.moveJetton = function(){
    SeatNode.seatInfoArr.forEach(function(item){
        if(item.user&&item.user.operationType!= 3){
            item["opinion"].active = false;
        }
        var betNode = item["bet"];
        var betLabel = item["betLabel"];
        if(betLabel.active){
            betLabel.active = false;
        }
        
        var x = betNode.x;
        var y = betNode.y;
   
        if(betNode.active){
            var parentNode = item["seatTbNode"].parent;
            var newVec ;
            if(item.user&&item.user.id == SeatNode.loginUser.id){
                newVec = cc.v2(0, 0);
            }else{
                newVec = betNode.convertToNodeSpaceAR(cc.v2(parentNode.width/2, parentNode.height/2));
            }

            betNode.stopAllActions();
            betNode.runAction(
                cc.sequence(
                  cc.moveTo(0.3,newVec),
                  cc.callFunc(() => {
                    betNode.active = false;
                    // betLabel.active = false;
                    betNode.x = x;
                    betNode.y = y;
                  })
                )
            ); 
        }
    });
}

//发牌
SeatNode.deal = function(data){
    if(SeatNode.buttonNode){
        SeatNode.buttonNode.active = false;
    }
    SeatNode.buttonNode = SeatNode.seatInfoArr[data.button]["Button"];
    SeatNode.buttonNode.active = true;
    var tempuserMap = {};
    data.gameUser.forEach(function(item){
        tempuserMap[item.id] =item; 
    });
    SeatNode.seatInfoArr.forEach(function(item){
        if(item.user&&tempuserMap[item.user.id]){
            item.user = tempuserMap[item.user.id];
            item["jettonLabel"].getComponent(cc.Label).string = item.user.jetton; 
            SeatNode.userAction(item.user.seatnumber,0,item.user.currentBet);

            // SeatNode.userUpdate(tempuserMap[item.id]);
            var pkNode = item["pk"];
            var parentNode = item["seatTbNode"].parent;
            var newVec2 = pkNode.convertToNodeSpaceAR(cc.v2(parentNode.width/2, parentNode.height/2));
            pkNode.x = newVec2.x;
            pkNode.y = newVec2.y;
            pkNode.active = true;
            pkNode.stopAllActions();
            pkNode.runAction(
                cc.sequence(
                  cc.moveTo(0.3,cc.v2( 20, -20)),
                  cc.callFunc(() => {
                      if(item.user.id ==SeatNode.loginUser.id ){
                        pkNode.active = false; 
                        SeatNode.selfNode.selfPokerNode1.active = true; 
                        SeatNode.selfNode.selfPokerNode2.active = true; 
                      }
                    
                  })
                )
            ); 
        }
        
    });
 
}

//大小盲注下注
SeatNode.blindsAnte = function(data){
    SeatNode.moveJetton();
    if(data.SBUser.operationType != 6){
        SeatNode.userAnte(data.SBUser,7); 
    }
    SeatNode.userAnte(data.BBUser,8); 
    SeatNode.userAnte(data.StraddleUser,6); 
}
SeatNode.userAnte = function(user,type){
    var seatInfo = SeatNode.seatInfoArr[user.seatnumber];
    if(seatInfo.user&&user.id == seatInfo.user.id){
        seatInfo.user = user;
        seatInfo["jettonLabel"].getComponent(cc.Label).string = seatInfo.user.jetton;
        SeatNode.userAction( seatInfo.user.seatnumber,type,seatInfo.user.currentBet)   
    }
    // SeatNode.seatInfoArr.forEach(function(item){
    //     if(item.user&&user.id == item.user.id){
    //         item.user = user;
    //         item["jettonLabel"].getComponent(cc.Label).string = item.user.jetton;
    //         SeatNode.userAction( item.user.seatnumber,type,item.user.currentBet)   
    //     }
    // })
}


SeatNode.userUpdate = function(user){
    var seatInfo =SeatNode.seatInfoArr[user.seatnumber];
    if(seatInfo.user.id == user.id){
        seatInfo["jettonLabel"].getComponent(cc.Label).string = user.jetton?user.jetton:"等待上分"; 
    }
} 
//用户在某个位置坐下
SeatNode.userDown  = function(seatNumber,user,cb){
    if(SeatNode.seatInfoArr[seatNumber].user){
        return ;
    } 
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    seatInfo.user = user;

    seatInfo["jettonLabel"].active = true;
    seatInfo["nameLabel"].getComponent(cc.Label).string = user.name;
    seatInfo["jettonLabel"].getComponent(cc.Label).string = user.jetton?user.jetton:"等待上分"; 
    var txid = Number(user.id)%31;
    //加载头像
    HeadPortraitsLoad.Load(seatInfo["txSprite"],user.headPortraitUrl?user.headPortraitUrl:CommonConfig.getHttpUrl()+'/image/user/'+txid+'.jpg');

    if(user.id == SeatNode.loginUser.id){
        SeatNode.moveSeat(seatNumber);
        if(!user.jetton&&cb){
            cb(null,2);
        }
        seatInfo["nameLabel"].active = false;

        seatInfo["betLabel"] = SeatNode.selfNode.selfBetLabel;
        seatInfo["bet"] = SeatNode.selfNode.selfBet;
        seatInfo["opinion"] = SeatNode.selfNode.selfOpinion;
        seatInfo["Button"] = SeatNode.selfNode.selfButton; 


        seatInfo["countDownNode"] =  SeatNode.selfNode.selfCountDownNode;
        seatInfo["countdownParticle"] =  SeatNode.selfNode.selfCountdownParticle;

        seatInfo["betLabel"].active = false;
        seatInfo["bet"].active = false;
        seatInfo["opinion"].active = false;
        seatInfo["Button"].active = false;
        seatInfo["countDownNode"].active = false;
        seatInfo["countdownParticle"].active = false;
    }else{
        seatInfo["nameLabel"].active = true;

        SeatNode.setSeatInfo(seatInfo ["seatNrNode"],
                            seatInfo ["seatTxNode"],
                            seatInfo ["seatTbNode"],
                            seatInfo ["seatHandNode"],
                            seatInfo ["particleNode"],seatInfo["coordinatesInfo"],
                            seatInfo);
    }
}
//站起围观
SeatNode.userStand = function(seatNumber,userid){
    if(!SeatNode.seatInfoArr[seatNumber].user){
        return ;
    } 
    if(SeatNode.seatInfoArr[seatNumber].user.id!=userid){
        return ;
    }
    var seatInfo = SeatNode.seatInfoArr[seatNumber];
    seatInfo.user = null;
    seatInfo["nameLabel"].active = false;
    seatInfo["jettonLabel"].active = false;
    seatInfo["betLabel"].active = false;
    seatInfo["bet"].active = false;
    seatInfo["opinion"].active = false;
    seatInfo["Button"].active = false;
    seatInfo["pk"].active = false;
    SeatNode.seatInfoArr[seatNumber]["txSprite"].getComponent(cc.Sprite).spriteFrame= SeatNode.pkAtlas._spriteFrames["vacancy"];
}
module.exports=SeatNode