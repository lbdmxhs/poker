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
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var HeadPortraitsLoad = require("HeadPortraitsLoad");
var CommonConfig = require("CommonConfig");
var Loading = require("Loading");
var Alert = require("Alert");
cc.Class({
    extends: cc.Component,

    properties: {

        nrNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        tbNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        txNodePrefab:{
            default:null,
            type: cc.Prefab 
        },
        userScrollView:{
            default:null,
            type: cc.ScrollView    
        },
        userViewContent:{
            default:null,
            type: cc.Node  
        },
        searchBut:{
            default:null,
            type: cc.Sprite    
        },
        userIdInput:{
            default:null,
            type: cc.EditBox   
        },
        zsNode:{
            default:null,
            type: cc.Node    
        },
        userNameLabel:{
            default:null,
            type: cc.Label      
        },
        myjbs:{
            default:null,
            type: cc.Label      
        },
        qdBut:{
            default:null,
            type: cc.Sprite     
        },
        qxBut:{
            default:null,
            type: cc.Sprite     
        },
        
    },
    //头像
    txCreateNodeCallback(userinfo,currentNode){
        var txid = Number(userinfo.id)%31;
        //加载头像
        HeadPortraitsLoad.Load(currentNode.getChildByName("txSprite"),userinfo.txUrl?userinfo.txUrl:CommonConfig.getHttpUrl()+'/image/user/'+txid+'.jpg');
    },
    nrCreateNodeCallback(userinfo,currentNode){
        let vipLabelString = '';
        if(userinfo.isVip=='1'||userinfo.isVip=='2'||userinfo.isVip=='3'){ 
        vipLabelString= "管理员";
        }else if(userinfo.isVip=='4'){
        vipLabelString= "VIP玩家";
        }else {
        vipLabelString= "非VIP玩家";
        }
        currentNode.getChildByName("usernameLabel").getComponent(cc.Label).string =userinfo.name;
        currentNode.getChildByName("vipLabel").getComponent(cc.Label).string =vipLabelString;
        var loginTime = userinfo.loginTime;
        var endTime = parseInt(new Date().getTime() / 1000) - new Date(loginTime).getTime() / 1000 ;
        var timeDay = parseInt(endTime / 60 / 60 / 24);        //相差天数
        if(timeDay>0){
            currentNode.getChildByName("sjLabel").getComponent(cc.Label).string =timeDay+"天前";
            return ;
        }
        endTime = endTime - timeDay * 60 * 60 * 24;
        var timeHour = parseInt(endTime / 60 / 60);            //相差小时
        if(timeHour>0){
            currentNode.getChildByName("sjLabel").getComponent(cc.Label).string =timeHour+"小时前";
            return ;
        }
        endTime = endTime - timeHour * 60 * 60;
        var timeMinutes = parseInt(endTime / 60);              //相差分钟
        if(timeMinutes>0){
            currentNode.getChildByName("sjLabel").getComponent(cc.Label).string =timeMinutes+"分钟前";
            return ;
        }
        currentNode.getChildByName("sjLabel").getComponent(cc.Label).string ="刚刚";
        // currentNode.getChildByName("zssLabel").getComponent(cc.Label).string =userinfo.zss;
    },
    tbCreateNodeCallback(userinfo,currentNode){
        let self = this;
        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickUserInfo(userinfo,currentNode.__itemID);

        }, currentNode);
    },
    recycleNodeCallback(recycleNode,prefabName,userinfo){
        recycleNode.targetOff(cc.Node.EventType.TOUCH_END);
    },
    clickUserInfo(userinfo,userinfo_index){
        let self = this;
        self.userNameLabel.string = userinfo.name+"\n(ID:"+userinfo.id+")"; 
        self.myjbs.string = userinfo.jbs;
        self.zsNode.active = true;
        self.selectedUser = userinfo;   
        self.selecteduserinfo_index = userinfo_index;
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        Title.creation("会员列表");
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("memberList");
        },this);

        this.scrollViewUtil = this.userScrollView.getComponent('ScrollView');
        
        this.clubInfo =   GlobalData.getScenesParameter();
        this.scrollViewUtil.init([
            {
                name:"txNodePrefab", 
                prefab:self.txNodePrefab,
                createNodeCallback:self.txCreateNodeCallback.bind(self)
            },
            {
                name:"tbNodePrefab", 
                prefab:self.tbNodePrefab,
                createNodeCallback:self.tbCreateNodeCallback.bind(self),
                recycleNodeCallback:self.recycleNodeCallback.bind(self)
            },
            {
                name:"nrNodePrefab", 
                prefab:self.nrNodePrefab,
                createNodeCallback:self.nrCreateNodeCallback.bind(self)
            }
        ]);
        self.queryUserPage();
        this.userScrollView.node.on('bounce-bottom', this.queryUserPage, this);
        this.qxBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qxBut.node,function(){
                self.zsNode.active = false;
            });
        },this);
        this.qdBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qdBut.node,function(){
                if(!self.selectedUser){
                    return ;
                }
                // self.delUser();
                self.userKickClub();
            });
        },this);

        this.searchBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.searchBut.node,function(){
                self.searchUser();
            });
        },this);

    },
    delUser(){
        let self = this;
        // self.selectedUser = userinfo;   
        // self.selecteduserinfo_index = userinfo_index;
        var finallyUserId;
        // var queryUserCurPage(finallyUserId)
        self.scrollViewUtil.updateDataList(function(prefabArr,useNodeArr,pool,dataList,scrollView){
            dataList.splice(self.selecteduserinfo_index,1);
            
            self.userViewContent.height = self.userViewContent.height -scrollView.itemHeight- scrollView.spacingY;
            prefabArr.forEach(function(prefabItem,index){
                let prefabName = prefabItem.name;
                if(!useNodeArr[prefabName]||useNodeArr[prefabName].length==0){
                    return ;
                }
                let items =  useNodeArr[prefabName];
                var delIndex;
                for (let i in items){
                    let item = items[i];
                    if(item.__itemID>=self.selecteduserinfo_index){
                        if(prefabItem.recycleNodeCallback&&typeof prefabItem.recycleNodeCallback === "function") {
                            prefabItem.recycleNodeCallback(item,prefabName,dataList[item.__itemID]);
                        }
                        if(dataList[item.__itemID]){                
                             //刷新item内容 
                             // item.getComponent('ItemNode').updateItem(this.data[item.__itemID]);
                             if( prefabItem.createNodeCallback&&typeof  prefabItem.createNodeCallback === "function") {               
                                 prefabItem.createNodeCallback(dataList[item.__itemID],item,prefabName);
                             } 
                        }else{
                            item.getComponent(cc.Widget).top = 0;
                            item.removeFromParent();
                            pool[prefabName].put(item);
                            delIndex = i;
                        }
                        
                    }
                }
                if(delIndex||delIndex == 0){
                    useNodeArr[prefabName].splice(delIndex,1);
                }
                

            })
            if(dataList[dataList.length-1]){
                finallyUserId = dataList[dataList.length-1].id;
            }
            
        });   
        if(self.queryType == "all"){
            self.queryUserCurPage(finallyUserId);
        }else{
            Loading.close(); 
        }

        self.zsNode.active = false;
    },
    showGoldNode(list){
        let self = this;
        if(self.scrollViewUtil.updateNode){
            self.scrollViewUtil.updateNode(list);  
        }
        
    },
    queryUserPage(){
        let self = this;
        let clubid = this.clubInfo.id;
        this.curPage = this.curPage?this.curPage+1:1;
        if(self.total&&self.pageSize&&self.curPage){
            if(self.total<=self.pageSize*(self.curPage-1)){
                return ; 
            }
        }
        if(this.curPage==1){
            self.scrollViewUtil.recycleNodeAll(function(){
                    self.userViewContent.height = 0;
                });
        }
        self.queryType = "all";
        NetUtil.pomeloRequest("game.gameHandler.queryClubUserDteByClubIdPage",{clubid:clubid,curPage:self.curPage},function(data){
            if(data.code!=200){
                return ;
            }
            self.pageSize = data.data.pageSize;
            self.total = data.data.total;
            if( data.data.list&& data.data.list.length>0){
                self.showGoldNode(data.data.list);
            }
        });
    },
    //踢出成员后查询当前最后一页
    queryUserCurPage(finallyUserId){
        let self = this;
        let clubid = this.clubInfo.id;
        if(self.total&&self.pageSize&&self.curPage){
            if(self.total<=self.pageSize*(self.curPage-1)){
                Loading.close();
                return ; 
            }
        }
        self.queryType = "all";
        NetUtil.pomeloRequest("game.gameHandler.queryClubUserDteByClubIdPage",{clubid:clubid,curPage:self.curPage},function(data){
            Loading.close();
            if(data.code!=200){
                return ;
            }
            self.pageSize = data.data.pageSize;
            self.total = data.data.total;
            if( data.data.list&& data.data.list.length>0){
                var addList = [];
                for(var i=data.data.list.length;i>0;i--){
                    var item =data.data.list[i-1];
                    if(item.id == finallyUserId){
                        break;
                    }
                    addList.push(item);
                }
                self.showGoldNode(addList);
            }
        },false); 
    },
    //踢出俱乐部
    userKickClub(){
        let self = this;
        Loading.show(function(){
            NetUtil.pomeloRequest("game.gameHandler.userKickClub",{clubid:self.clubInfo.id,kickUserId:self.selectedUser.id},function(data){
                if(data.code!=200){
                    Loading.close();
                    Alert.show(data.msg);   
                    return ;
                }
                self.delUser();
            },false);
        });
        
    },
    searchUser(){
        let self = this;
        let searchId = self.userIdInput.string.trim();
        let clubid = this.clubInfo.id;
       
        if(searchId){

            self.scrollViewUtil.recycleNodeAll(function(){
                self.userViewContent.height = 0;
            });
            self.queryType = "single";
            NetUtil.pomeloRequest("game.gameHandler.queryUserDate",{clubid:clubid,userid:searchId},function(data){
                if(data.code!=200){
                    return ;
                }
                self.showGoldNode(data.data.list);
            });
        }else{
            this.curPage = 0;
            self.queryUserPage();
        }
    },
    clickPresentedGold(item){
        console.log(item);
    },
    start () {

    },

    // update (dt) {},
});
