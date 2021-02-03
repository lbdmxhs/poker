// var exp = module.exports;
var roomDao = require('../../../dao/roomDao');
var roomJettonDao = require('../../../dao/roomJettonDao');
var async = require('async');
module.exports = function (app) {
        return new Remote(app);
};

var Remote = function (app) {
        this.app = app;
};

var pro = Remote.prototype;

pro.test = function (params, cb) {
        console.log("------roomRemote.test-----------");
        cb();
};


pro.creationRoom = function (params, cb) {
        var self = this;
        if (!this.app.get("roomMap")) {
                this.app.set("roomMap", {});
        }
        
        var room = params.room;
        var roomid = params.roomid;
        room["id"] = roomid;
        //房间中所有的人员
        //坐下的人员
        room["allUser"] = [];
        room["takeSeatUser"] = {};
        room["gameUser"] = [];
        room["button"] = -1;
        room["pot"] = 0;

        this.app.get("roomMap")[roomid] = room;
        var interval = setInterval(function(){
                roomTimeOut(room,self.app,interval);
        },1000);
        this.app.set("roomTimeOutInterval"+roomid, interval);
        
        async.waterfall([
                function(cb){
                        roomJettonDao.quryClearingUser(roomid,cb);
                }
        ],function(err,userArr){
                if(err) {
                        cb(err);
                }
                room["allUser"] = userArr;
                cb(); 
        });
}
//判断游戏结束,游戏结束后清除相关数据
var roomTimeOut = function(room,app,interval){
        if(room["endDate"] ){
                var cd = new Date();
                var ed = new Date(room.endDate);
                if(cd.getTime() > ed.getTime()){
                        clearTimeout(interval);
                        if(room.isStart){
                                return;
                        }
                        console.log("--------------44444444444444-----------------"+room.id);
                        room.isStart = true;
                        if(room.allUser&&room.allUser.length>0){
                                async.waterfall([
                                        function(cb){
                                                roomJettonDao.roomRemoveJettonBatch(room.allUser,room.id,cb)	
                                        },
                                        function(cb){
                                                roomDao.updateStatus(room.id,"2",cb);
                                        },
                                        function(cb){
                                                app.get('globalChannelService').pushMessage("connector","onRoom",{type:"11"},"roomuser_"+room.id,{isPush: true},cb);      
                                        },
                                        function(fails,cb){
                                                //清除房间频道
                                                app.get('globalChannelService').destroyChannel("roomuser_"+room.id, function(){});
                                                //清除数据缓存
                                                if(room.allUser){
                                                        room.allUser.forEach(function(item){
                                                                app.get('redisClient').srem('userRoom_'+item.id,room.id, function(err,data) {})
                                                        });
                                                }
                                                room["allUser"] = [];
                                                var roomMap = app.get("roomMap");
                                                delete roomMap[room.id];
                                                cb();
                        
                                        }
                                ],function(err){

                                })
                            
                        }

                        app.get('redisClient').del("peopleNumber_"+room.id,function(){});  
                        app.set("room_userPkMap_"+room.id,{});
                        app.set("room_commonpk"+room.id,[]);
                        app.set("room_pkArr"+room.id,[]);  
                        delete app.settings["room_userPkMap_"+room.id];
                        delete app.settings["room_commonpk"+room.id];
                        delete app.settings["room_pkArr"+room.id];
                        delete app.settings["timeOutInterval"+room.id];
                        delete app.settings["roomTimeOutInterval"+room.id];


                }
        }

}

