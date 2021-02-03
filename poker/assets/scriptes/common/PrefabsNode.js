class PrefabsNode{}


PrefabsNode.initNode  = function(scenesName,prefabName,prefab,number){
    let poolSize = this[scenesName].pool[prefabName].size();
    for (let i = 0; i < (number-poolSize); ++i) {
        let enemy = cc.instantiate(prefab); 
        this[scenesName].pool[prefabName].put(enemy); 
    }
}
PrefabsNode.initPool = function(scenesName,prefabName){
    if(!this[scenesName].pool[prefabName]){
        this[scenesName].pool[prefabName] = new cc.NodePool();
    }
}

/**
 *  scenesName 初始化的场景：
 * prefabArr
 * [
 * {
 * name:"txNodePrefab",
 * prefab:txNodePrefab,
 * createNodeCallback:(item显示数据信息,currentNode当前节点,prefabItem.name))//循环节时回调节点需要的单独操作
 * recycleNodeCallback(Node:节点,prefabName:静态资源名称)清除前节点回调
 * }
 * ] 
 * initParam{
 *  nodeNUmber,预加载节点的个数
 *  maxNodeNumber,//最大加载的节点个数
 *  distanceTop 顶点距离
 *  isOpacity 是否初始化透明
 * }
 */
PrefabsNode.init = function(scenesName,prefabArr,initParam){
    if(!initParam){
        initParam ={};
    }
    // nodeNumber,maxNodeNumber,distanceTop,isOpacity
    if(!scenesName||!prefabArr||prefabArr.length==0){
        cc.error("参数错误");
        return;
    }
    let self = this;


    if(!self[scenesName]){
        self[scenesName] = {
            scenesName:scenesName,
            nodeNumber:initParam.nodeNumber?initParam.nodeNumber:10,
            maxNodeNumber:initParam.maxNodeNumber?initParam.maxNodeNumber:100,
            distanceTop:initParam.distanceTop?initParam.distanceTop:10,
            isOpacity:initParam.isOpacity?initParam.isOpacity:false,
            prefabArr:prefabArr,
            //缓存prefab
            prefab:{},
            //空节点缓存池
            pool:{},
            //正在使用的节点缓存池
            useNodeArr:{}
        }
    }else{
        self[scenesName].prefabArr = prefabArr;
    }
   


    prefabArr.forEach(function(item,index){
    
        self[scenesName].prefab[item.name] = item.prefab; 
        self.initPool(scenesName,item.name);
        self.initNode(scenesName,item.name,item.prefab,self[scenesName].nodeNumber);

    });
};
PrefabsNode.recycleNode = function(scenesName,prefabName,callback){
    let self = this;
    if(!self[scenesName].useNodeArr[prefabName]||self[scenesName].useNodeArr[prefabName].length<=0){
        return;
    }
    self[scenesName].useNodeArr[prefabName].forEach(function(item,index){
        
        
        if(callback&&typeof callback === "function") {
            callback(item,prefabName);
        }
        item.getComponent(cc.Widget).top = 0;
        item.removeFromParent();
        if(self[scenesName].pool[prefabName].size()<=self[scenesName].maxNodeNumber){
         
            self[scenesName].pool[prefabName].put(item);
        }else{
            item.destroy() 
        }
       
        // item.node.off(cc.Node.EventType.TOUCH_END,function (args) {},item.node);
    }); 
    self[scenesName].useNodeArr[prefabName] = [];

}

//清空所有节点返回对象池
PrefabsNode.recycleNodeAll = function(scenesName,callback){
    if(callback&&typeof callback === "function") {
        callback();
    }
    let self = this;
    self[scenesName].prefabArr.forEach(function(item,index){
        self.recycleNode(scenesName,item.name,item.recycleNodeCallback);
    });
}
//创建节点
PrefabsNode.createNode= function (scenesName,name) {
    let self = this;
    let enemy = null;
    if (self[scenesName].pool[name].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = self[scenesName].pool[name].get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(self[scenesName].prefab[name]);
    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    if(!enemy.active){
        enemy.active = true;
    }
    return enemy;
}

PrefabsNode.addClubInfNode = function(scenesName,name,parentNode){

    let self = this;
    let currentNode = self.createNode(scenesName,name);
    if(!self[scenesName].useNodeArr[name]){
        self[scenesName].useNodeArr[name] = [];  
    }
    self[scenesName].useNodeArr[name].push(currentNode);
    currentNode.parent = parentNode;
    
    return currentNode;
}

PrefabsNode.addClubInfNodeBatch =function(scenesName,infoLiist,parentNode,isRecycleNodeAll){
    let self = this;
    if(!infoLiist||!(infoLiist instanceof Array)){
        return ;
    }
    if(typeof(isRecycleNodeAll) == "undefined"||isRecycleNodeAll){
        this.recycleNodeAll(scenesName,function(){
            parentNode.height = 0;
        });
    }

    let initHeight= parentNode.height;
     self[scenesName].prefabArr.forEach(function(prefabItem,index){
        let height = initHeight;

        infoLiist.forEach(function(item,index){
            let currentNode =  null;
            currentNode =  self.addClubInfNode(scenesName,prefabItem.name,parentNode); 
            if(self[scenesName].isOpacity){
                currentNode.opacity = 0;
            }
            //加载头像
            if( prefabItem.createNodeCallback&&typeof  prefabItem.createNodeCallback === "function") {               
                prefabItem.createNodeCallback(item,currentNode,prefabItem.name);
               
            }
            currentNode.getComponent(cc.Widget).top =height+self[scenesName].distanceTop;
            currentNode.getComponent(cc.Widget).updateAlignment();
            height = height+currentNode.height+self[scenesName].distanceTop;
            parentNode.height = height;
        });   
    });
}
module.exports=PrefabsNode