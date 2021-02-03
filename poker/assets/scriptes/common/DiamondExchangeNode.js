class DiamondExchangeNode{}
DiamondExchangeNode.prefab = {};
//y轴间距
DiamondExchangeNode.top = 40;
//初始化节点
DiamondExchangeNode.pool = {
    nrNodePrefab:null,
    tbNodePrefab:null
};
//正在使用的节点
DiamondExchangeNode.useNodeArr = {
    nrNodePrefab:[],
    tbNodePrefab:[]
}
DiamondExchangeNode.initNode  = function(name,prefab,number){
    let poolSize = this.pool[name].size();
    for (let i = 0; i < (number-poolSize); ++i) {
        let enemy = cc.instantiate(prefab); 
        this.pool[name].put(enemy); 
    }
}
DiamondExchangeNode.initPool = function(name){
    if(!this.pool[name]){
        this.pool[name] = new cc.NodePool();
    }
}

DiamondExchangeNode.init = function(nrNodePrefab,tbNodePrefab,clubNUmber){
        this.prefab["nrNodePrefab"] = nrNodePrefab;
        this.prefab["tbNodePrefab"] = tbNodePrefab;


        this.initPool("nrNodePrefab");
        this.initPool("tbNodePrefab");


        this.initNode("nrNodePrefab",nrNodePrefab,clubNUmber);
        this.initNode("tbNodePrefab",tbNodePrefab,clubNUmber);

}


DiamondExchangeNode.recycleNode = function(name){
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
DiamondExchangeNode.recycleNodeAll = function(){
    this.recycleNode("nrNodePrefab");
    this.recycleNode("tbNodePrefab");
}

//创建节点
DiamondExchangeNode.createNode= function (name) {
    let enemy = null;
    if (this.pool[name].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = this.pool[name].get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(this.prefab[name]);

    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    return enemy;
}

DiamondExchangeNode.addClubInfNode = function(name,parentNode){

    let self = this;
    let currentNode = self.createNode(name);
    self.useNodeArr[name].push(currentNode);
    currentNode.parent = parentNode;
    
    return currentNode;
}




DiamondExchangeNode.addClubInfNodeBatch =function(DiamondExchangeInfoList,callback){
    if(!DiamondExchangeInfoList||!(DiamondExchangeInfoList instanceof Array)){
        return ;
    }
    let self = this;
    let parentNode = cc.find("Canvas/DiamondExchangeScrollView/view/content");
    this.recycleNodeAll();
    let height = 0;
    //图标
    DiamondExchangeInfoList.forEach(function(item,index){
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
        parentNode.height = height;
    }); 
     //内容
     height = 0;
     DiamondExchangeInfoList.forEach(function(item,index){
         let currentNode =  null;
         currentNode =  self.addClubInfNode("nrNodePrefab",parentNode); 
         currentNode.getChildByName("zss").getComponent(cc.Label).string =item.zss;
         currentNode.getChildByName("jbs").getComponent(cc.Label).string =item.jbs;
         
         currentNode.getComponent(cc.Widget).top =height+self.top;
         currentNode.getComponent(cc.Widget).updateAlignment();
         height = height+currentNode.height+self.top;
     }); 

}

module.exports=DiamondExchangeNode