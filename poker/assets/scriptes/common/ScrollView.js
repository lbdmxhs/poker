cc.Class({
    extends: cc.Component,

    properties: {
         //scrollview的view剪裁节点
         view:cc.Node,
         //scrollview的具体装载item的node
         list:cc.Node,
         scrollView:cc.ScrollView,
         spacingY:0,
         prestrainNumber:10,
         isCollision:false
    },
    initPool(prefabName){
        if(!this.pool[prefabName]){
            this.pool[prefabName] = new cc.NodePool();
        }
    },
    initNode(prefabName,prefab,number){
        let poolSize = this.pool[prefabName].size();
        for (let i = 0; i < (number-poolSize); ++i) {
            let enemy = cc.instantiate(prefab); 
            this.pool[prefabName].put(enemy); 
        }
    },
    createNode(name) {
        let self = this;
        let enemy = null;
        if (self.pool[name].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            enemy = self.pool[name].get();
            enemy.prefabName = name;
            
        }
        return enemy;
    },

    // LIFE-CYCLE CALLBACKS:
    init(prefabArr){
        let self = this;
        self.prefabArr =prefabArr ;
        self.prefab = {};
        //空节点缓存池
        self.pool = {};
        self.useNodeArr = {};
        //初始化节点高度
        let item = cc.instantiate(self.prefabArr[0].prefab);
        let height = item.height;
        self.itemHeight = height;
        //计算可视区域内部填充满需要的item数量
        self.rowItemCounts = Math.ceil(self.view.height / (height + self.spacingY));
        self.prefabArr.forEach(function(item,index){
            self.prefab[item.name] = item.prefab; 
            self.initPool(item.name);
            self.initNode(item.name,item.prefab,self.rowItemCounts+self.prestrainNumber);
        });
         //计算顶部最大Y
         this.topMax = Math.ceil(self.prestrainNumber/2)*( height +  this.spacingY);
         //计算底部最小Y
         this.bottomMax = -(this.view.height + this.topMax);
         self.lastListY = self.list.y
    },
    updateDataList(cb){
        let self = this;
        cb(self.prefabArr,self.useNodeArr,self.pool,self.dataList,self);
    },
    updateNode(dataList){
        let self = this;
        let itemNode = null;
        if(!self.dataList){
            self.dataList = [];
            self.recycleNodeAll();
        }
        let listheight = self.list.height
        self.prefabArr.forEach(function(prefabItem,index){
            let height = listheight;
            let prefabName = prefabItem.name;
            dataList.forEach(function(item,index){
                itemNode =  self.createNode(prefabName);
                if(!itemNode){
                    return ;
                }

                if( prefabItem.createNodeCallback&&typeof  prefabItem.createNodeCallback === "function") {               
                    prefabItem.createNodeCallback(item,itemNode,prefabName);
                }
                // currentNode.parent = self.list;
                self.list.addChild(itemNode)
                itemNode.getComponent(cc.Widget).top =height+self.spacingY;
                itemNode.getComponent(cc.Widget).updateAlignment(); 
                if(self.isCollision){
                    itemNode.opacity = 0;
                }
                height = height+ itemNode.height+self.spacingY
                itemNode.__itemID = self.dataList.length +index;
                if(!self.useNodeArr[prefabName]){
                    self.useNodeArr[prefabName] = [];  
                }
                self.useNodeArr[prefabName].push(itemNode);
            });
            // self.list.height = height;
        })
        dataList.forEach(function(item,index){
            self.dataList.push(item); 
        })
        
        // self.dataList = self.dataList.concat(dataList);
           //设置list的高度 不设置无法滑动
        self.list.height =(self.dataList.length) * self.itemHeight + (self.dataList.length) * this.spacingY
        // this.list.height = (dataList.length) * height + (dataList.length) * this.spacingY
        //保存list的当前Y坐标
        self.updateNodePosition();
    },
    onLoad () {        
        let self = this;
        this.scrollView.node.on('scrolling', function(){
             self.updateNodePosition();
        }, this);
    },
    start () {

    },
    recycleNode(prefabName,callback){
        let self = this;
        if(!self.useNodeArr[prefabName]||self.useNodeArr[prefabName].length<=0){
            return;
        }
        self.useNodeArr[prefabName].forEach(function(item,index){
            
            
            if(callback&&typeof callback === "function") {
                callback(item,prefabName);
            }
            item.getComponent(cc.Widget).top = 0;
            item.removeFromParent();
            self.pool[prefabName].put(item);
            // item.node.off(cc.Node.EventType.TOUCH_END,function (args) {},item.node);
        }); 
        self.useNodeArr[prefabName] = [];
    },
    recycleNodeAll(callback){
        if(callback&&typeof callback === "function") {
            callback();
        }
        let self = this;
        self.prefabArr.forEach(function(item,index){
            self.recycleNode(item.name,item.recycleNodeCallback);
        });
        self.dataList = [];
        self.list.height = 0;
        this.scrollView.scrollToTop(0.1);
    },
    updateNodePosition(){
         //判断是否往下滑动
         let self = this;
         let isDown = this.list.y >= this.lastListY
         if(!self.prefabArr||self.prefabArr.length == 0){
             return ;
         }
         self.prefabArr.forEach(function(prefabItem,index){
             let prefabName = prefabItem.name;
             if(!self.useNodeArr[prefabName]||self.useNodeArr[prefabName].length==0){
                 return ;
             }
             let items =  self.useNodeArr[prefabName];
             //当前的item数量
             let countOfItems = items.length;
               //预显示数据的总数量
             let dataLen = self.dataList.length;
             let removeIndexArr = [];
             //遍历所有item节点
             for (let i in items){
                 let item = items[i];
                 //item坐标转换到对应view节点的坐标 y坐标需要减去一半item的高度...具体看你item的锚点设置
                 let itemPos = self.list.convertToWorldSpaceAR(item.position);
                 itemPos.y -= self.view.height / 2;
                 itemPos = self.view.convertToNodeSpaceAR(itemPos);
                 //如果是往下滑动
                 if(isDown){
                     //判断当前item的坐标是否大于顶部最大Y
                     if(itemPos.y > self.topMax){
                         //计算新的itmeid 
                         //比如一共13个item item的索引就是0-12 那么第0个item超过y坐标之后 就需要显示第13个item
                         //那么就是将当前id + 当前item的数量即可
                         let newId = item.__itemID + countOfItems ;
                         //如果item已经显示完毕了就不需要刷新了
                        
                         if(newId >= dataLen) {
                             return;
                         } 
                         if(prefabItem.recycleNodeCallback&&typeof prefabItem.recycleNodeCallback === "function") {
                            prefabItem.recycleNodeCallback(item,prefabName,self.dataList[item.__itemID]);
                         }
                         //保存itemid
                         item.__itemID = newId;
                         //计算item的新的Y坐标 也就是当前y减去所有item加起来的高度
                         item.y = item.y - countOfItems * self.itemHeight - (countOfItems ) * self.spacingY;
                     
                         //刷新item内容 
                         // item.getComponent('ItemNode').updateItem(this.data[item.__itemID]);
                         if( prefabItem.createNodeCallback&&typeof  prefabItem.createNodeCallback === "function") {               
                             prefabItem.createNodeCallback(self.dataList[item.__itemID],item,prefabName);
                         }
                     }
                     //如果是往上滑动
                 }else { 
                     //如果超过底部最小Y 和上面的一样处理一下就完事了
                     if(itemPos.y < self.bottomMax){
                         let newId = item.__itemID - countOfItems;
                         
                         if (newId < 0) {
                             return;
                         };
                         if(prefabItem.recycleNodeCallback&&typeof prefabItem.recycleNodeCallback === "function") {
                            prefabItem.recycleNodeCallback(item,prefabName,prefabName,self.dataList[item.__itemID]);
                         }
                         item.__itemID = newId;
                         item.y = item.y + countOfItems * self.itemHeight + (countOfItems) * self.spacingY;
                         // item.getComponent('ItemNode').updateItem(this.data[item.__itemID])
                         if( prefabItem.createNodeCallback&&typeof  prefabItem.createNodeCallback === "function") {               
                             prefabItem.createNodeCallback(self.dataList[item.__itemID],item,prefabName);
                         }
                     }
                 }
             }
             // for(let i in removeIndexArr){
             //     let index = removeIndexArr[i];
             //     items.splice(index-(i),1);
             // }
 
 
         })
         //存储下当前listnode的Y坐标 
         this.lastListY = this.list.y
    },
    update (dt) {

    },
});
