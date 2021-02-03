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
var GlobalData = require("GlobalData");
var NetUtil = require("NetUtil");
var HeadPortraitsLoad =require("HeadPortraitsLoad");
var CommonConfig = require("CommonConfig");
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
        zsNode:{
            default:null,
            type: cc.Node    
        },
        qdBut:{
            default:null,
            type: cc.Sprite     
        },
        qxBut:{
            default:null,
            type: cc.Sprite     
        },
        jbEditBox:{
            default:null,
            type: cc.EditBox      
        },
        userNameLabel:{
            default:null,
            type: cc.Label      
        },
        myzss:{
            default:null,
            type: cc.Label      
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
        }
    },
    //头像
    txCreateNodeCallback(userinfo,currentNode){
        var txid = Number(userinfo.id)%31;
        //加载头像
        HeadPortraitsLoad.Load(currentNode.getChildByName("txSprite"),userinfo.txUrl?userinfo.txUrl:CommonConfig.getHttpUrl()+'/image/user/'+txid+'.jpg');
    },
    tbCreateNodeCallback(userinfo,currentNode){
        let self = this;
        currentNode.on(cc.Node.EventType.TOUCH_END,function (args) {
            self.clickUserInfo(userinfo);
        }, currentNode);
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
        currentNode.getChildByName("zssLabel").getComponent(cc.Label).string =userinfo.zss;
        this.userInfoMap[userinfo.id] = userinfo;
        this.userNodeMap[userinfo.id] = currentNode;
    },
    recycleNodeCallback(recycleNode,prefabName,userinfo){
        recycleNode.targetOff(cc.Node.EventType.TOUCH_END);
        if(userinfo){
            delete this.userNodeMap[userinfo.id];
        }
    },
    updateGold(userid,number,isSub){
        let userinfo =  this.userInfoMap[userid];
        let userNode =  this.userNodeMap[userid];
        if(userinfo){
           if(isSub){
                userinfo.zss =Number(userinfo.zss) -Number(number);
           }else{
                userinfo.zss = Number(userinfo.zss) +Number(number);
           }
        }
        if(userinfo&&userNode){
            userNode.getChildByName("zssLabel").getComponent(cc.Label).string =userinfo.zss; 
        }
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING,function(){
            Title.setPrevScenes("presentedDiamond");
        },this);
        this.scrollViewUtil = this.userScrollView.getComponent('ScrollView');
        

        Title.creation("赠送钻石");
        this.userInfoMap = {};
        this.userNodeMap = {};
        this.clubInfo =   GlobalData.getScenesParameter();
        this.myUserInfo = GlobalData.getParameter("user"); 
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
        this.qdBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qdBut.node,function(){
                let zss = self.jbEditBox.string; 
                if(!zss||!self.selectedUser){
                    return ;
                }
                if(self.myUserInfo.id == self.selectedUser.id){
                    Alert.show("不能赠送给自己！");
                    return ;
                }
                zss = Math.abs( Math.floor(Number(zss)));
                let ts = "确定赠送"+zss+"钻石？"
                Alert.show(ts,function(str){
                    if("确定" == str){
                        // console.log(selectedUser);
                        self.jewelTrading(self.clubInfo.id,self.myUserInfo.id,self.selectedUser.id,zss);
                        //self.updateGold(userid,number,isSub)
                    }
                },"确定","取消");
            });
        },this);
        this.qxBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.qxBut.node,function(){
                self.zsNode.active = false;
            });
        },this);
        this.searchBut.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            ButAnimation.play(self.searchBut.node,function(){
                self.searchUser();
            });
        },this);
    },
    clickUserInfo(userinfo){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.queryJewelByUser",{clubid:self.clubInfo.id},function(data){
            if(data.code!=200){
                Alert.show("查询失败！");
                return ;
            }
            self.userNameLabel.string = userinfo.name+"\n(ID:"+userinfo.id+")"; 
            self.myzss.string = data.data.jewelNumber;
            self.jbEditBox.string = ""; 
            self.zsNode.active = true;
            self.selectedUser = userinfo;   
        });

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
                    self.userInfoMap = {};
                    self.userNodeMap = {};
                });
        }
        NetUtil.pomeloRequest("game.gameHandler.queryClubUserJewelByClubIdPage",{clubid:clubid,curPage:self.curPage},function(data){
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
    jewelTrading(clubid,myUserInfoId,receiveUserId,sum){
        let self = this;
        NetUtil.pomeloRequest("game.gameHandler.jewelTrading",{clubid:clubid,receiveUserId:receiveUserId,sum:sum},function(data){
            if(data.code!=200){
                Alert.show(data.msg);
                return ;
            }
           
            self.updateGold(myUserInfoId,sum,true);
            self.updateGold(receiveUserId,sum,false);
            self.zsNode.active = false;
            Alert.show("赠送成功");
        });
    },
    searchUser(){
        let self = this;
        let searchId = self.userIdInput.string.trim();
        let clubid = this.clubInfo.id;
       
        if(searchId){
            self.scrollViewUtil.recycleNodeAll(function(){
                self.userViewContent.height = 0;
                self.userInfoMap = {};
                self.userNodeMap = {};
            });
            NetUtil.pomeloRequest("game.gameHandler.queryUserJewel",{clubid:clubid,userid:searchId},function(data){
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
