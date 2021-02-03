var Loading = require("Loading");
var HeadPortraitNode = require("HeadPortraitNode");
var UnitTools = require("UnitTools");
class CardTableNode{};
CardTableNode.cardTableNodeArr = [];

/**
 *  {
                cardTableId:"",//牌桌ID
                clubId:"",//俱乐部ID
                name:"1000场德州",//桌子名称
                type:"1",//1:德州 2:牛牛 3:金花
                minBringBankRoll:"2000",//最少携带
                timeRemaining:"5小时23分",//剩余时间
                maxPeopleNumber:"9",//最大人数
                currentPeopleNumber:"8",//当前人数
                ante:"",//底注
                smallBlinds:"2",//小盲
                bigBlinds:"4",//大盲
                status:"1",//0:等待中 1:游戏中 
            }
 * 
 */
CardTableNode.init = function(cardTableNodePrefab,cardTableInfoNodePrefab,number){
      //初始化节点桌子
      if(!this.cardTablePool){
        this.cardTablePool = new cc.NodePool();
    
      }
      if(this.cardTablePool.size()==0){
        this.cardTableNodeArr = [];
      }

      this.cardTableNodePrefab = cardTableNodePrefab;
      let cardTablePoolSize = this.cardTablePool.size();
      for (let i = 0; i < (number-cardTablePoolSize); ++i) {
          let enemy = cc.instantiate(cardTableNodePrefab); // 创建节点
          this.cardTablePool.put(enemy); // 通过 put 接口放入对象池
      }
      //详细信息节点
      if(!this.cardTableInfoPool){
        this.cardTableInfoPool = new cc.NodePool();
      }


      this.cardTableInfoNodePrefab = cardTableInfoNodePrefab;
      let cardTableInfoPoolSize = this.cardTableInfoPool.size();
      for (let i = 0; i < (number-cardTableInfoPoolSize); ++i) {
          let enemy = cc.instantiate(cardTableInfoNodePrefab); // 创建节点
          this.cardTableInfoPool.put(enemy); // 通过 put 接口放入对象池
      }

}


CardTableNode.addNodeBatch = function(cardTableArr,selectType,callback){

    if(!cardTableArr||!(cardTableArr instanceof Array)){
        return ;
    }

    let parentNode = cc.find("Canvas/cardTableScrollView/view/content/bjimgnode");
    let intParentNode = cc.find("Canvas/cardTableScrollView/view/content/bjnrnode");
    this.recycleNodeAll();
    //切换后节点变少，先滚动到最上方防止黑屏
    cc.find("Canvas/cardTableScrollView").getComponent(cc.ScrollView).scrollToTop();
     let self = this;

    cardTableArr.forEach(function(item,index){
        let currentNode = self.createEnemy();
        let currentInfoNode = self.createInfoEnemy();
        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            if(callback){
                callback(item);
            }
        },currentNode);
        //筛选影长类型
        if(selectType=="0"||item.type == selectType){
            currentNode.active = true; 
            currentInfoNode.active = true;
        }else{
            currentNode.active = false;
            currentInfoNode.active = false;
        }
        self.cardTableNodeArr.push({
            item:item,
            infoNode:currentInfoNode,
            node:currentNode
        });
        // //满人数显示红色
         self.numberOfPeopleControl(item,currentNode,currentInfoNode);
        // //底注
        self.risingPouringControl(item,currentInfoNode);
        // //最低带入
        self.atLeastCarryControl(item,currentInfoNode);
        // //剩余时间
        self.timeRemainingControl(item,currentInfoNode);
        // //游戏状态
        self.gameStatusControl(item,currentNode);
        self.cardTableNameControl(item,currentInfoNode);
        currentNode.parent = parentNode; // 将生成的敌人加入节点树
        currentInfoNode.parent = intParentNode; // 将生成的敌人加入节点树

        
    })
    HeadPortraitNode.isclick = false;
    parentNode.getComponent(cc.Layout).updateLayout();
    intParentNode.getComponent(cc.Layout).updateLayout();
    cc.find("Canvas/cardTableScrollView").getComponent(cc.ScrollView).scrollToTop();   

}

//清空所有节点返回对象池
CardTableNode.recycleNodeAll = function(){
    let self = this;
    if(self.cardTableNodeArr.length<=0){
        return;
    }
 
    self.cardTableNodeArr.forEach(function(item,index){
        item.node.targetOff(cc.Node.EventType.TOUCH_END);
        if(self.cardTablePool.size()<=100){
            self.cardTablePool.put(item.node);
        }else{
            item.node.destroy() 
        }
        // self.cardTablePool.put(item.node);
        // self.cardTableInfoPool.put(item.infoNode);
        if(self.cardTableInfoPool.size()<=100){
            self.cardTableInfoPool.put(item.infoNode);
        }else{
            item.infoNode.destroy() 
        }
       
        // item.node.off(cc.Node.EventType.TOUCH_END,function (args) {},item.node);
    }); 
    self.cardTableNodeArr = [];
}

//创建节点
CardTableNode.createEnemy= function () {
    let enemy = null;
    if (this.cardTablePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = this.cardTablePool.get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(this.cardTableNodePrefab);

    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    return enemy;
}
CardTableNode.createInfoEnemy= function () {
    let enemy = null;
    if (this.cardTableInfoPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = this.cardTableInfoPool.get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(this.cardTableInfoNodePrefab);

    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    return enemy;
}


CardTableNode.filtrate = function(selectType){
    cc.find("Canvas/cardTableScrollView").getComponent(cc.ScrollView).scrollToTop();
    CardTableNode.cardTableNodeArr.forEach(function(item,index){
        if(selectType=="0"||item.item.type == selectType){
            item.node.active = true; 
            item.infoNode.active = true; 
        }else{
            item.node.active = false; 
            item.infoNode.active = false; 
        }
    });  

    cc.find("Canvas/cardTableScrollView/view/content/bjimgnode").getComponent(cc.Layout).updateLayout();
    cc.find("Canvas/cardTableScrollView/view/content/bjnrnode").getComponent(cc.Layout).updateLayout();
    cc.find("Canvas/cardTableScrollView").getComponent(cc.ScrollView).scrollToTop();
}



CardTableNode.numberOfPeopleControl = function(item,node,currentInfoNode){
    var red = new cc.Color(250, 0, 0);
    var white = new cc.Color(255, 255, 255);
    if(item.maxPeopleNumber == item.currentPeopleNumber){
        node.getChildByName("rsmNode").active = true;
        node.getChildByName("rsNode").active = false;
        currentInfoNode.getChildByName("rsLabel").color = red;
    } else{
        node.getChildByName("rsmNode").active = false;
        node.getChildByName("rsNode").active = true;
        currentInfoNode.getChildByName("rsLabel").color = white;
    }
    if(!item.maxPeopleNumber){
        item.maxPeopleNumber = "0";
    }
    if(!item.currentPeopleNumber){
        item.currentPeopleNumber = "0";
    }
    currentInfoNode.getChildByName("rsLabel").getComponent(cc.Label).string =item.currentPeopleNumber+"/"+item.maxPeopleNumber;
}
CardTableNode.risingPouringControl = function(item,node){
    // ante:"",//底注
    // smallBlinds:"2",//小盲注
    // bigBlinds:"4"//大盲
    // type:"1",//1:德州 2:牛牛 3:金花
    if(item.type == "1"){
        if(!item.smallBlinds){
            item.smallBlinds = "";
        }
        if(!item.bigBlinds){
            item.bigBlinds = "";
        }
        node.getChildByName("dzLabel").getComponent(cc.Label).string =item.smallBlinds+"/"+item.bigBlinds; 
    }else{
        if(!item.ante){
            item.ante = "";
        }
        node.getChildByName("dzLabel").getComponent(cc.Label).string = item.ante; 
    }
}
CardTableNode.atLeastCarryControl = function(item,node){
    if(!item.minBringBankRoll){
        item.minBringBankRoll = "";
    }
    node.getChildByName("drLabel").getComponent(cc.Label).string = item.minBringBankRoll; 
}
CardTableNode.timeRemainingControl = function(item,node){
    var minutes = 60*Number(item.duration);  
    var str = "";
    if(!item.startDate){
        var hour = Math.floor(minutes/60) ;
        minutes = minutes%60;

        if(hour>0){
            str+=hour+"小时";
        }
        str+=minutes+"分钟";
    }else{
        var endDate = new Date(item.startDate);
        endDate.setMinutes(endDate.getMinutes() + minutes);
        str = UnitTools.timeDifference(new Date(),endDate);
    }
    item.timeRemaining = str;
    if(!item.timeRemaining){
        item.timeRemaining = "";
    }
    node.getChildByName("sjLabel").getComponent(cc.Label).string = item.timeRemaining; 
}

CardTableNode.gameStatusControl = function(item,node){
    if(!item.status){
        item.status = "0";
    }
    if(item.status == "0"){
        node.getChildByName("ddSprite").active = true;
        node.getChildByName("yxzSprite").active = false;

    }else if(item.status == "1"){
        node.getChildByName("ddSprite").active = false;
        node.getChildByName("yxzSprite").active = true;
    }

}
CardTableNode.cardTableNameControl = function(item,node){
    if(!item.name){
        item.name = "";
    }
    node.getChildByName("zzname").getComponent(cc.Label).string = item.name;  
}


module.exports=CardTableNode