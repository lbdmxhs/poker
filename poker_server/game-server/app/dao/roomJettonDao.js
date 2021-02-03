var pomelo = require('pomelo');
var roomJettonDao = module.exports;
var tradingRecordDao = require('./tradingRecordDao');
var userDao = require('./userDao');
var clubUserDao = require('./clubUserDao');
var roomDao =  require('./roomDao');
roomJettonDao.saveRoomJetton = function(roomJetton,client,cb){
	pomelo.app.get('dbclient').insertTableByClient(roomJetton,"roomJetton",client,cb);
}
//上分
roomJettonDao.roomAddJetton = function(userid,roomid,clubid,jetton,consumeJewel,callback){
    var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
            //扣钻石
            function(cb){
				userDao.updateJewelNumberByIdclient(userid,-consumeJewel,client,cb);
            },
            function(cb){
				userDao.findJewelNumberByByIdclient(userid,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:userid,
					sum:-consumeJewel,
					creationDate:currentDate,
					type:"2",
					details:"上分(roomid:"+roomid+")",
					consumeType:"18",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
            },
            //扣金币
            function(cb){
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubid,userid,-jetton,client,cb);
			},
			function(cb){
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubid,userid,client,cb);
			},
			function(goldNumber,cb){
				var tradingRecord = {
					userId:userid,
					sum:-jetton,
					clubId:clubid,
					creationDate:currentDate,
					type:"1",
					details:"上分(roomid:"+roomid+")",
					consumeType:"16",
					balance:goldNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
            },

            //房间上分
            function(cb){
                var sql = "SELECT * FROM roomjetton WHERE userid = ? AND roomid = ? and clubid=? ORDER BY creationDate DESC LIMIT 1";
                var args = [userid,roomid,clubid];
                pomelo.app.get('dbclient').findOneSqlByclient(sql, args,client,cb)
            },
			function(roomJetton,cb){
                var currentJetton = 0;
                if(roomJetton){
                    currentJetton = roomJetton.currentJetton;
                }
                var roomJetton = {
                    roomid:roomid,
                    userid:userid,
                    currentJetton:currentJetton+jetton,
                    chnageJetton:jetton,
                    chnageJettonType:"1",
                    creationDate:currentDate,
                    clubid:clubid
                };
                self.saveRoomJetton(roomJetton,client,cb);
            }
			
		]
	},callback); 
}
var userRemoveJetton = function (userid,roomid,clubid,jetton,funArr,client) {
    var currentDate = new Date();
    funArr.push( //金币
        function(cb){
            clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubid,userid,jetton,client,cb);
        });  
    funArr.push(function(cb){
        clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubid,userid,client,cb);
    }); 
    funArr.push(function(goldNumber,cb){
        var tradingRecord = {
            userId:userid,
            sum:jetton,
            clubId:clubid,
            creationDate:currentDate,
            type:"1",
            details:"下分(roomid:"+roomid+")",
            consumeType:"17",
            balance:goldNumber
        }
        tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
    });  
    funArr.push(//房间下分
        function(cb){
            var sql = "SELECT * FROM roomjetton WHERE userid = ? AND roomid = ? and clubid = ? ORDER BY creationDate DESC LIMIT 1";
            var args = [userid,roomid,clubid];
            pomelo.app.get('dbclient').findOneSqlByclient(sql, args,client,cb)
        });  
    funArr.push(function(roomJetton,cb){
        var currentJetton = 0;
        if(roomJetton){
            currentJetton = roomJetton.currentJetton;
        }
        var roomJetton = {
            roomid:roomid,
            userid:userid,
            currentJetton:currentJetton-jetton,
            chnageJetton:-jetton,
            chnageJettonType:"2",
            creationDate:currentDate,
            clubid:clubid
        };
        roomJettonDao.saveRoomJetton(roomJetton,client,cb);
    });   
}
//下分
roomJettonDao.roomRemoveJetton = function(userid,roomid,clubid,jetton,callback){
    var self = this;

	pomelo.app.get('dbclient').Transaction(function(client){
        var funArr = [];
        userRemoveJetton(userid,roomid,clubid,jetton,funArr,client)
		return funArr;
	},callback); 
}

roomJettonDao.roomRemoveJettonBatch = function(userArr,roomid,callback) {
    var self = this;

    if(!userArr||userArr.length<=0){
        callback();
        return ;
    }
  
	pomelo.app.get('dbclient').Transaction(function(client){
        var funArr = [];
        userArr.forEach(function(item) {
            if(item.jetton&&item.jetton>0){
                userRemoveJetton(item.id,roomid,item.clubid,item.jetton,funArr,client) 
            }
        });
		return funArr;
	},callback);     
}
//游戏
roomJettonDao.roomGameJetton = function(userArr,roomid,callback){
    var self = this;
    var currentDate = new Date();

    if(!userArr||userArr.length<=0){
        callback();
        return ;
    }
  
	pomelo.app.get('dbclient').Transaction(function(client){
        var arr = [];
        userArr.forEach(function(item){
            var userid = item.id;
            var jetton = item.jetton;
            var clubid = item.clubid;
            arr.push( //房间下分
                function(cb){
                    var sql = "SELECT * FROM roomjetton WHERE userid = ? AND roomid = ? and clubid=? ORDER BY creationDate DESC LIMIT 1";
                    var args = [userid,roomid,clubid];
                    pomelo.app.get('dbclient').findOneSqlByclient(sql, args,client,cb)
                });
            arr.push(function(roomJetton,cb){
                var currentJetton = 0;
                if(roomJetton){
                    currentJetton = roomJetton.currentJetton;
                }
                var roomJetton = {
                    roomid:roomid,
                    userid:userid,
                    currentJetton:jetton,
                    chnageJetton:jetton-currentJetton,
                    chnageJettonType:"3",
                    creationDate:currentDate,
                    clubid:clubid
                };
                self.saveRoomJetton(roomJetton,client,cb);
            });
        });
		return arr;
	},callback); 
}

//查询房间未结算的用户
roomJettonDao.quryClearingUser = function(roomid,cb){
    var sql = 'SELECT r.currentJetton as jetton,r.clubId as clubid,u.id,u.name,u.accountType,u.headPortraitType,u.headPortraitUrl FROM  roomjetton as r LEFT JOIN user u ON r.userid = u.id  ,'
    +'(SELECT userid,MAX(id) as id FROM roomjetton WHERE roomid = ?   GROUP BY userid) as t WHERE r.userid = t.userid AND r.id = t.id AND  r.currentJetton!=0';
	var args = [roomid];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}



