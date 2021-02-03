var GlobalData = require("GlobalData");
var CommonConfig = require("CommonConfig");
var Loading = require("Loading");
var Alert = require("Alert");
class NetUtil{};
NetUtil.init = function(gateConfig,uid,callback){
    if(!gateConfig||!gateConfig.host||!gateConfig.port){
        callback("连接服务器失败！");
        return ;
    }
   pomelo.disconnect();
   pomelo.off("disconnect");

    this.gateConfig = gateConfig;
    this.queryEntry(gateConfig, uid,function(err,host, port) {
        if(err){
            callback("连接服务器失败！");
            return ;
        }
        pomelo.init({
            host: host,
            port: port,
            log: true
        }, function() {
            pomelo.on('disconnect', function(reason) {
                // cc.log("pomelo.on() disconnect: ", reason);
                Alert.show("断开连接，重新登陆！",function(){
                    cc.director.loadScene("login");
                });   
            });
            callback(null);  
        });
    });
}

NetUtil.entry = function(gateConfig,uid,token,callback){
    if(!token||!uid){
        return ;
    }
    this.init(gateConfig,uid,function(err){
        if(err){
            callback(err);
            return ;
        }
        var route = "connector.entryHandler.entry";
        pomelo.request(route, {
            token: token
        }, function(data) {
            if(data.code!=200){
                callback("连接服务失败！",null);
                return ;
            }
            callback(null,data);
            //cc.log("pomelo.request return data: ", data);
            // if(data.error) {
            //     that.showError(DUPLICATE_ERROR);
            //     return;
            // }
            
        });
    });
  
}



NetUtil.queryEntry = function(gateConfig,uid, callback) {
    var that = this;
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: gateConfig.host,
        port: gateConfig.port,
        log: true
    }, function() {
        pomelo.request(route, {
            uid: uid
        }, function(data) {
            cc.log("pomelo.request return data: ", data);
            
            pomelo.disconnect();
            if(data.code === 500) {
               callback("连接服务器失败！","","");
                return;
            }
            // 返回的data.host为"127.0.0.1"，
// 			测试时需要改成本机ip否则Android手机连接不上
            callback("",data.host, data.port);
        });
    });
}

NetUtil.pomeloRequest = function(route,parameter,callback,isLoading){
    if(typeof(isLoading) == "undefined"||isLoading){
        Loading.show(function(){
            pomelo.request(route,parameter, function(data) {
                Loading.close();
                callback(data);
            });
        });
    }else{
        pomelo.request(route,parameter, function(data) {
            callback(data);
        });
    }
}

NetUtil.queryClubByUser = function(cb){
    var route = "game.gameHandler.queryClubByUser";
        pomelo.request(route, {}, function(data) {
            if(data.code!=200){
                if(data.msg){
                    // Alert.show(data.msg);
                }
                return ;
            }           
            var memberNumberList = data.data.memberNumberList;
            var clubXx = data.data.userClubList;
            var memberNumberMap = {};
            memberNumberList.forEach(function(item,index){
                memberNumberMap[item.clubid] = item.currentHeadcount;
            });
            clubXx.forEach(function(item,index){
                //     id:id,//俱乐部id
                //     name:name,//俱乐部名称
                //     txUrl:"http://img.pyeword.cn/18-11-9/23568504.jpg", //俱乐部头像
                //     isSelf:'1',//是否是自己的俱乐部 1：是 0：否
                //     isAlliance:'0',//是否是自己的俱乐部 1：是 0：否
                //     synopsis:"东方红郡的设计师的减肥黄金时代和飞机上的积分很多事时间的回复是的的烦得很",//俱乐部简介
                //     isJewelExchange:"1",//是否开启钻石兑换
                //     maxUser:"20",//人数上限
                //     currentHeadcount:"20",//当前人数
                //     clubGold:"20"//拥有俱乐部金币
                //memberNumberMap[item.clubid] = item.currentHeadcount;
                item["currentHeadcount"] = memberNumberMap[item.id];
                item.isAlliance = '1';//是否是联盟
                item.synopsis = item.synopsis?item.synopsis:"暂无简介";
                item.txUrl = "http://"+CommonConfig.httpconfig.host+":"+CommonConfig.httpconfig.port+item.txUrl;
            });
            GlobalData.setParameter("clubXx",clubXx);
            cb(clubXx);
        });
}

module.exports = NetUtil;
