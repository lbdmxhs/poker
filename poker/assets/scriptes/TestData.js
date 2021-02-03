class TestData {};
TestData.clubInfoList = [];
//传递参数
TestData.parameterData = null;
TestData.setParameterData = function(item){
  this.parameterData = item;  
}
TestData.getParameterData = function(item){
   return  this.parameterData;
}

TestData.UserInfo = {
    id:"1111",
    name:"大富翁",
    txUrl:"",
    isCreatClub:"0",//是否已经创建俱乐部
    isAlliance:"0",//是否已经加入联盟或者创建联盟
    zss:"99999",//钻石数
};
TestData.addClubInfo = function(item){
    if(!this.clubInfoList){
        this.clubInfoList = [];  
    }
    this.clubInfoList.push(item);
}

//生成从minNum到maxNum的随机数
TestData.randomNum = function(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 
//获取俱乐部用户信息
TestData.getUserInfoLis = function(){
    let userInfoList = [];
    for(let i=0;i<200;i++){
        userInfoList.push({
            id:"1111", //ID
            name:"长啥样韩"+i,//名称
            isVip:"0",//是否VIP
            txUrl:"http://192.168.1.3:3001/image/user/defaultUser.jpg",//头像
            jbs:"123456",// 金币数
            zss:"123456",//钻石数
            dlsj:"1天前"//最后登录时间
        });
    } 
    return userInfoList;
}
TestData.getQueryUserInfoLis = function(){
    let userInfoList = [];
    for(let i=0;i<1;i++){
        userInfoList.push({
            id:"1111", //ID
            name:"长啥样韩"+i,//名称
            isVip:"0",//是否VIP
            txUrl:"http://192.168.1.3:3001/image/user/defaultUser.jpg",//头像
            jbs:"123456",// 金币数
            zss:"123456",//钻石数
            dlsj:"1天前"//最后登录时间
        });
    } 
    return userInfoList;
}
TestData.getUserInfoLisPage = function(page){
    let userInfoList = [];
    for(let i=1+(100*(page-1));i<=100*page;i++){
        userInfoList.push({
            id:"1111", //ID
            name:"长啥样韩"+i,//名称
            isVip:"0",//是否VIP
            txUrl:"http://192.168.1.3:3001/image/user/defaultUser.jpg",//头像
            jbs:"123456",// 金币数
            zss:"123456",//钻石数
            dlsj:"1天前"//最后登录时间
        });
    } 
    return userInfoList;
}
//获取账户详细
TestData.getAccountDetails = function(){
    let AccountDetails = [];
    for(let i=0;i<20;i++){
        let userid = TestData.randomNum(100000,99999999); 
        let je = TestData.randomNum(100,99999999); 
        let type = TestData.randomNum(1,2); 
        AccountDetails.push({
            id:"1",
            type:""+type,//1：金币 2：砖石
            userId:""+userid,//对象id
            je:""+je,//金额
            timeDate:"19/08/11 15:12:10"
        });
    }

    return  AccountDetails;
}
//钻石购买信息
//获取钻石兑换信息
TestData.getDiamondExchangeInfoList = function(){
    let DiamondExchangeInfoList = [
        {
            id:1,
            zss:10,//钻石数
            jbs:1//颈部数
        },
        {
            id:2,
            zss:50,//钻石数
            jbs:5//颈部数
        },
        {
            id:3,
            zss:100,//钻石数
            jbs:10//颈部数
        },
        {
            id:4,
            zss:500,//钻石数
            jbs:50//颈部数
        },
        {
            id:5,
            zss:1000,//钻石数
            jbs:100//颈部数
        },
        {
            id:6,
            zss:5000,//钻石数
            jbs:500//颈部数
        },
    ]
    return DiamondExchangeInfoList;
}


//获取金币购买信息
TestData.getGoldExchangeList = function(){
    let GoldExchangeList = [
        {
            id:1,
            zss:"5W",//金币数
            jbs:500//钻石数
        },
        {
            id:2,
            zss:"10W",//金币数
            jbs:1000//钻石数
        },
        {
            id:3,
            zss:"50W",//金币数
            jbs:5000//钻石数
        },
        {
            id:4,
            zss:"100W",//金币数
            jbs:10000//钻石数
        },
        {
            id:5,
            zss:"500W",//金币数
            jbs:50000//钻石数
        },
        {
            id:6,
            zss:"1000W",//金币数
            jbs:100000//钻石数
        },
    ]
    return GoldExchangeList;
}
//获取查询的俱乐部
TestData.searchClubInfo = function(searchid){
    return   {
        id:searchid,//俱乐部id
        name:"金鹏俱乐部"+searchid,//俱乐部名称
        // txUrl:"http://img.pyeword.cn/18-11-9/23568504.jpg", //俱乐部头像
        txUrl:"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=612537270,4229148240&fm=11&gp=0.jpg", //俱乐部头像
        isSelf:'0',//是否是自己的俱乐部 1：是 0：否
        isAlliance:'0',//是否是自己的联盟 1：是 0：否
        synopsis:"东方红郡的设计师的减肥黄金时代和飞机上的积分很多事时间的回复是的的烦得很",//俱乐部简介
        isJewelExchange:"1",//是否开启钻石兑换
        maxUser:"1",//人数上限
        currentHeadcount:"1",//当前人数
        clubGold:"1"//拥有俱乐部金币
    }   
}
//获取个人信息
TestData.getUserInfo = function(){
    return TestData.UserInfo;
}
//获取俱乐部信息
TestData.getClubList = function(){
    let clubXx = [
        {
            id:"88451",//俱乐部id
            name:"金鹏俱乐部1",//俱乐部名称
            // txUrl:"http://img.pyeword.cn/18-11-9/23568504.jpg", //俱乐部头像
            txUrl:"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=612537270,4229148240&fm=11&gp=0.jpg", //俱乐部头像
            isSelf:'1',//是否是自己的俱乐部 1：是 0：否
            isAlliance:'1',//是否是自己的联盟 1：是 0：否
            synopsis:"东方红郡的设计师的减肥黄金时代和飞机上的积分很多事时间的回复是的的烦得很",//俱乐部简介
            isJewelExchange:"1",//是否开启钻石兑换
            maxUser:"1",//人数上限
            currentHeadcount:"1",//当前人数
            clubGold:"1"//拥有俱乐部金币
        }
    
    ];
    if(!this.clubInfoList){
        this.clubInfoList = [];
    }
    return this.clubInfoList;
}

TestData.getcardTableList = function(clubId){
    let cardTableArr = [
        {
            cardTableId:"1",//牌桌ID
            clubId:"",//俱乐部ID
            cardTableName:clubId+"场德州",//桌子名称
            type:"1",//1:德州 2:牛牛 3:金花
            atLeastCarry:"2000",//最少携带
            timeRemaining:"5小时23分",//剩余时间
            maxNumberOfPeople:"9",//最大人数
            currentNumberOfPeople:"8",//当前人数
            risingPouring:"",//底注
            minBlinds:"2",//小盲注
            maxBlinds:"4",//大盲
            gameStatus:"1"//0:等待中 1:游戏中 
        }
    ];
    for(var i=0;i<31;i++){
        cardTableArr.push({
            cardTableId:"1"+i,//牌桌ID
            clubId:"",//俱乐部ID
            cardTableName:clubId+"场德州"+i,//桌子名称
            type:"1",//1:德州 2:牛牛 3:金花
            atLeastCarry:"2000",//最少携带
            timeRemaining:"5小时23分",//剩余时间
            maxNumberOfPeople:"9",//最大人数
            currentNumberOfPeople:"9",//当前人数
            risingPouring:"1000",//底注
            minBlinds:"2",//小盲注
            maxBlinds:"4",//大盲
            gameStatus:"1"//0:等待中 1:游戏中 
        });
    }
    for(var i=0;i<18;i++){
        cardTableArr.push({
            cardTableId:"2"+i,//牌桌ID
            clubId:"",//俱乐部ID
            cardTableName:clubId+"场牛牛"+i,//桌子名称
            type:"2",//1:德州 2:牛牛 3:金花
            atLeastCarry:"2000",//最少携带
            timeRemaining:"5小时23分",//剩余时间
            maxNumberOfPeople:"9",//最大人数
            currentNumberOfPeople:"9",//当前人数
            risingPouring:"1000",//底注
            minBlinds:"2",//小盲注
            maxBlinds:"4",//大盲
            gameStatus:"0"//0:等待中 1:游戏中 
        });
    }
    for(var i=0;i<30;i++){
        cardTableArr.push({
            cardTableId:"3"+i,//牌桌ID
            clubId:"",//俱乐部ID
            cardTableName:clubId+"场金花"+i,//桌子名称
            type:"3",//1:德州 2:牛牛 3:金花
            atLeastCarry:"2000",//最少携带
            timeRemaining:"5小时23分",//剩余时间
            maxNumberOfPeople:"9",//最大人数
            currentNumberOfPeople:"9",//当前人数
            risingPouring:"1000",//底注
            minBlinds:"2",//小盲注
            maxBlinds:"4",//大盲
            gameStatus:"0"//0:等待中 1:游戏中 
        });
    }
    return cardTableArr;
}
module.exports=TestData
