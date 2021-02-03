/***
 *   {
                id:"8845771",
                name:"金鹏俱乐部1",
                txUrl:""
            },
 */
var HeadPortraitsLoad = require("HeadPortraitsLoad");
class HeadPortraitNode{};
HeadPortraitNode.txNodeArr = {};
HeadPortraitNode.currentNode = null;
HeadPortraitNode.txNodeAllArr = [];
HeadPortraitNode.pictureNodeAllArr = [];
HeadPortraitNode.isclick = false;
HeadPortraitNode.init = function(headPortraitNodePrefab,pictureNodeNodePrefab,number){
    //相框节点
    if(!this.headPortraitPool){
      this.headPortraitPool = new cc.NodePool();
  
    }
    if(this.headPortraitPool.size()==0){
      this.txNodeArr = {};
      this.currentNode = null;
      this.txNodeAllArr = [];
      this.pictureNodeAllArr = [];
    }

    this.headPortraitNodePrefab = headPortraitNodePrefab;
    let headPortraitPoolSize = this.headPortraitPool.size();
    for (let i = 0; i < (number-headPortraitPoolSize); ++i) {
        let enemy = cc.instantiate(headPortraitNodePrefab); // 创建节点
        this.headPortraitPool.put(enemy); // 通过 put 接口放入对象池
    }

    //头像节点
    if(!this.picturePool){
        this.picturePool = new cc.NodePool();
      }
      let picturePoolSize = this.picturePool.size();
      this.pictureNodeNodePrefab = pictureNodeNodePrefab;
      for (let i = 0; i < (number-picturePoolSize); ++i) {
        let enemy = cc.instantiate(pictureNodeNodePrefab); // 创建节点
        this.picturePool.put(enemy); // 通过 put 接口放入对象池
    }

}
//创建节点
HeadPortraitNode.createEnemy= function () {
    let enemy = null;
    if (this.headPortraitPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = this.headPortraitPool.get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(this.headPortraitNodePrefab);

    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    return enemy;
}
//头像图片
HeadPortraitNode.pictureCreateEnemy= function () {
    let enemy = null;
    if (this.picturePool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
        enemy = this.picturePool.get();
    } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
        enemy = cc.instantiate(this.pictureNodeNodePrefab);

    }
    // enemy.getComponent('Enemy').init(); //接下来就可以调用 enemy 身上的脚本进行初始化
    return enemy;
}

//清空所有节点返回对象池
HeadPortraitNode.recycleNodeAll = function(){
    let self = this;
 
    self.txNodeAllArr.forEach(function(item,index){
        item.targetOff(cc.Node.EventType.TOUCH_END);
        item.getChildByName("rahmen").active = true;
        item.getChildByName("selectrahmen").active = false;
        if(self.headPortraitPool.size()<=100){
            self.headPortraitPool.put(item);
        }else{
            item.destroy() ;
        }
        // self.headPortraitPool.put(item);
        // item.node.off(cc.Node.EventType.TOUCH_END,function (args) {},item.node);
    }); 
    self.pictureNodeAllArr.forEach(function(item,index){
        if(self.picturePool.size()<=100){
            self.picturePool.put(item);
        }else{
            item.destroy() ;
        }
        // self.picturePool.put(item);
        // item.node.off(cc.Node.EventType.TOUCH_END,function (args) {},item.node);
    }); 
    self.txNodeArr = {};
    self.currentNode = null;
    self.txNodeAllArr = [];
    self.pictureNodeAllArr = [];
}

HeadPortraitNode.loadNode = function(clubXxArr,index,selectclub,callback,parentNode,pictureParentNode){
    let self = this;
    let item = clubXxArr[index];
    if(!item){
        return ;
    }

    // picturecurrentNode.parent = pictureParentNode;
    if(index<(clubXxArr.length-1)){
       self.loadNode(clubXxArr,index+1,selectclub,callback,parentNode,pictureParentNode) 
    }else{
        // cc.find("Canvas/clubNode/headPortraitScrollView").getComponent(cc.ScrollView).scrollToPercentHorizontal(0);
    }

}

HeadPortraitNode.addNodeBatch = function(clubXxArr,selectclub,callback){
     if(!clubXxArr||!(clubXxArr instanceof Array)){
    
        return;
     }
    this.recycleNodeAll();

     let parentNode = cc.find("Canvas/clubNode/headPortraitScrollView/view/content/txkcontent");
     let pictureParentNode = cc.find("Canvas/clubNode/headPortraitScrollView/view/content/txcontent");
    //  parentNode.destroyAllChildren();
  
     let self = this;
    //  this.loadNode(clubXxArr,0,selectclub,callback,parentNode,pictureParentNode);
     clubXxArr.forEach(function(item,index){
         
            //滚动条初始化到最左边
            let currentNode = self.createEnemy();
       
        

            self.txNodeAllArr.push(currentNode);
            // self.pictureNodeAllArr.push(currentNode);
            //头像点击事件
            currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
                if(self.isclick){
                    return;
                }
                self.isclick = true;
                //点解事件切换头像框
                cc.find("Canvas/clubname").getComponent(cc.Label).string = item.name;
                self.changeSelect(self.currentNode,self.txNodeArr[item.id]);
                self.currentNode = self.txNodeArr[item.id];
                if(callback){
                    callback(item.id); 
                }
            
            },currentNode);

            self.txNodeArr[item.id]=currentNode;
            
            //初始化选中
            if(selectclub == item.id){
                self.changeSelect(self.currentNode,currentNode);
                self.currentNode = currentNode;
                cc.find("Canvas/clubname").getComponent(cc.Label).string = item.name;
                if(callback){
                    callback(item.id);
                }
            }
          
            currentNode.parent =  parentNode;    
        
            let picturecurrentNode = self.pictureCreateEnemy();
            self.pictureNodeAllArr.push(picturecurrentNode);
                //加载头像
            picturecurrentNode.parent = pictureParentNode;
    
            self.loaderClubTx(picturecurrentNode,item.txUrl);
    
     });
     parentNode.getComponent(cc.Layout).updateLayout();
     pictureParentNode.getComponent(cc.Layout).updateLayout();
     cc.find("Canvas/clubNode/headPortraitScrollView").getComponent(cc.ScrollView).scrollToLeft();   
    // clubXxArr.forEach(function(item,index){
     
              
        
    // })

}
HeadPortraitNode.loaderClubTx = function(node,url){
    HeadPortraitsLoad.Load(node.getChildByName("headPortraitSprite"),url);
//     node.getChildByName("headPortraitSprite").getComponent(cc.Sprite).spriteFrame = null;
//     if(!url){
//         return ;
//     }
    
//     cc.loader.load(url,function(err,img){ 　
    
//         var tximg  = new cc.SpriteFrame(img); 
//         node.getChildByName("headPortraitSprite").getComponent(cc.Sprite).spriteFrame = tximg;
//         node.getChildByName("headPortraitSprite").getComponent("ShaderHelper").onLoad();
// 　　});
}

HeadPortraitNode.changeSelect = function(currentNode,selectclubNode){
    if(currentNode){
        currentNode.getChildByName("rahmen").active = true;
        currentNode.getChildByName("selectrahmen").active = false;
    }

    if(selectclubNode){
        selectclubNode.getChildByName("rahmen").active = false;
        selectclubNode.getChildByName("selectrahmen").active = true;
    }
} 

module.exports=HeadPortraitNode