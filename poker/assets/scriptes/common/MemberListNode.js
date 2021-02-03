var HeadPortraitsLoad = require("HeadPortraitsLoad");
class MemberListNode{}
MemberListNode.prefab = {};
//y轴间距
MemberListNode.top = 10;
//初始化节点
MemberListNode.pool = {
    txNodePrefab:null,
    nrNodePrefab:null,
    tbNodePrefab:null
};
//正在使用的节点
MemberListNode.useNodeArr = {
    nrNodePrefab:[],
    tbNodePrefab:[],
    txNodePrefab:[]
}
MemberListNode.initNode  = function(name,prefab,number){
    let poolSize = this.pool[name].size();
    for (let i = 0; i < (number-poolSize); ++i) {
        let enemy = cc.instantiate(prefab); 
        this.pool[name].put(enemy); 
    }
}
MemberListNode.initPool = function(name){
    if(!this.pool[name]){
        this.pool[name] = new cc.NodePool();
    }
}

MemberListNode.init = function(txNodePrefab,nrNodePrefab,tbNodePrefab,clubNUmber){
        this.prefab["nrNodePrefab"] = nrNodePrefab;
        this.prefab["tbNodePrefab"] = tbNodePrefab;
        this.prefab["txNodePrefab"] = txNodePrefab;

        this.initPool("nrNodePrefab");
        this.initPool("tbNodePrefab");
        this.initPool("txNodePrefab");

        this.initNode("nrNodePrefab",nrNodePrefab,clubNUmber);
        this.initNode("tbNodePrefab",tbNodePrefab,clubNUmber);
        this.initNode("txNodePrefab",txNodePrefab,clubNUmber);
}


MemberListNode.recycleNode = function(name){
    let self = this;
    if(self.useNodeArr[name].length<=0){
        return;
    }
    self.useNodeArr[name].forEach(function(item,index){
       
        if(name=="tbNodePrefab"){
           // item.getChildByName("KhButNode").getChildByName("zsdhBut").targetOff(cc.Node.EventType.TOUCH_END);
           item.targetOff(cc.Node.EventType.TOUCH_END);
        }

        item.getComponent(cc.Widget).top = 0;
        item.removeFromParent();
        // self.pool[name].put(item);
        if(self.pool[name].size()<=100){
            self.pool[name].put(item);
        }else{
            item.destroy() 
        }
        // item.node.off(cc.Node.EventType.TOUCH_END,function (args) {},item.node);
    }); 
    self.useNodeArr[name] = [];

}
//清空所有节点返回对象池
MemberListNode.recycleNodeAll = function(){
    this.recycleNode("nrNodePrefab");
    this.recycleNode("tbNodePrefab");
    this.recycleNode("txNodePrefab");
}

//创建节点
MemberListNode.createNode= function (name) {
    let enemy = null;
    if (this.pool[name].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = this.pool[name].get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(this.prefab[name]);

    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    return enemy;
}

MemberListNode.addClubInfNode = function(name,parentNode){

    let self = this;
    let currentNode = self.createNode(name);
    self.useNodeArr[name].push(currentNode);
    currentNode.parent = parentNode;
    
    return currentNode;
}




MemberListNode.addClubInfNodeBatch =function(userInfoList,callback){
    if(!userInfoList||!(userInfoList instanceof Array)){
        return ;
    }
    let self = this;
    let parentNode = cc.find("Canvas/userScrollView/view/content");
    this.recycleNodeAll();
    let height = 0;
    //头像
    userInfoList.forEach(function(item,index){
        let currentNode =  null;
        currentNode =  self.addClubInfNode("txNodePrefab",parentNode); 
        //加载头像
        HeadPortraitsLoad.Load(currentNode.getChildByName("txSprite"),item.txUrl);

        currentNode.getComponent(cc.Widget).top =height+self.top;
        currentNode.getComponent(cc.Widget).updateAlignment();
        height = height+currentNode.height+self.top;
        parentNode.height = height;
    }); 
    height = 0;
    //图标
    userInfoList.forEach(function(item,index){
        let currentNode =  null;
        currentNode =  self.addClubInfNode("tbNodePrefab",parentNode); 

        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            if(callback){
                callback(item,"zhmx");
            }
        }, currentNode);

        currentNode.getComponent(cc.Widget).top =height+self.top;
        currentNode.getComponent(cc.Widget).updateAlignment();
        height = height+currentNode.height+self.top;
    }); 
     //内容
     height = 0;
     userInfoList.forEach(function(item,index){
         let currentNode =  null;
         currentNode =  self.addClubInfNode("nrNodePrefab",parentNode); 
         currentNode.getChildByName("usernameLabel").getComponent(cc.Label).string =item.name;
         currentNode.getChildByName("vipLabel").getComponent(cc.Label).string =item.isVip=="1"?"VIP玩家":"非VIP玩家";
         currentNode.getChildByName("jbsLabel").getComponent(cc.Label).string =item.dlsj;//最后上线时间
         currentNode.getComponent(cc.Widget).top =height+self.top;
         currentNode.getComponent(cc.Widget).updateAlignment();
         height = height+currentNode.height+self.top;
     }); 

}

module.exports=MemberListNode