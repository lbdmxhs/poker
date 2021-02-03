var Code = require('../../../../../shared/code');
var roomDao = require('../../../dao/roomDao');
var allianceDao = require('../../../dao/allianceDao');
var userDao = require('../../../dao/userDao');
var roomJettonDao = require('../../../dao/roomJettonDao');
var configDao = require('../../../dao/configDao');
var clubUserDao = require('../../../dao/clubUserDao');
var TexasPoker = require('../../../util/TexasPoker');
var async = require('async');
var pkArr = ["FK_2","FK_3","FK_4","FK_5","FK_6","FK_7","FK_8","FK_9","FK_10","FK_11","FK_12","FK_13","FK_14",
			 "HT_2","HT_3","HT_4","HT_5","HT_6","HT_7","HT_8","HT_9","HT_10","HT_11","HT_12","HT_13","HT_14",
			 "HX_2","HX_3","HX_4","HX_5","HX_6","HX_7","HX_8","HX_9","HX_10","HX_11","HX_12","HX_13","HX_14",
			 "MH_2","MH_3","MH_4","MH_5","MH_6","MH_7","MH_8","MH_9","MH_10","MH_11","MH_12","MH_13","MH_14"];
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

Handler.prototype.test = function(msg, session, next){
	
	var self = this;
    // this.app.rpc.room.roomRemote.test(session, {tableId:"12232323231"}, function(err){
	// 	console.log("------------app.rpc.room.roomRemote---------------------");
	// });
	console.log("------------app.rpc.room.roomRemote---------------------"+session.get("rid"));
	var uids = [session.get("rid")];
	var count = 1
	var aaa = setInterval(function(){
		self.app.get('statusService').pushByUids(uids, "test", {test:count}, function(err) {
			if(err) {
				console.error('send message to user %s failed, error: %j', uid, err);
				return;
			}
			
		});
		count++;
	},1000);
	
	
	next(null, {code: Code.OK});
} 

var verifyRoom = function(userid,room,cb){
	async.waterfall([
		function(cb){
			allianceDao.findListByUserId(userid,cb);
		},
		function(list,cb){
			var isExist = false;

			list.forEach(function(item,index){
				if(item.allianceId == room.allianceId){
					isExist = true;
				}
			});
			if(!isExist){
				cb("房间不存在！");
			}
			cb();
		}
		],function(err){
			cb(err);
	})	
}
Handler.prototype.getRoom = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var clubid = msg.clubid;
	var roomid = msg.roomid;
	if(!clubid||!userid||!roomid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
	async.waterfall([
        function(cb){
			if(!self.app.get("roomMap")||!self.app.get("roomMap")[roomid]){
				roomDao.queryRoomById(roomid,cb);
			}else{
				cb(null,self.app.get("roomMap")[roomid]);	
			}
	
        },
        function(room,cb){
			// console.log(room);
			if(!self.app.get("roomMap")||!self.app.get("roomMap")[roomid]){
				self.app.rpc.room.roomRemote.creationRoom(session, {roomid:roomid,room:room},cb);
			}else{
				cb();
			}
		},function(cb){

			verifyRoom(userid,self.app.get("roomMap")[roomid],cb);
		}
    ],function(err){       
        if(err) {
			next(null, {code: Code.FAIL,msg:err});
			return;
		}
	
		var room = self.app.get("roomMap")[roomid];
		var userPkMap = self.app.get("room_userPkMap_"+roomid);
		var selfPk;
		if(userPkMap&&userPkMap[userid]){
			selfPk= userPkMap[userid];
		}
		next(null, {code: Code.OK,data:{room:room,selfPk:selfPk}});
    });
}
//退出房间
Handler.prototype.quitRoom = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var clubid = msg.clubid;
	var roomid = msg.roomid;
	if(!clubid||!userid||!roomid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}
	self.app.get('globalChannelService').leave("roomuser_"+roomid, userid,session.get('serverId'), function(err) {});	
	self.app.get('redisClient').srem('userRoom_'+userid,roomid, function(err,data) {})
	next(null, {code: Code.OK});
}
//进入房间
Handler.prototype.enterRoom = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var clubid = msg.clubid;
	var roomid = msg.roomid;
	if(!clubid||!userid||!roomid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
	var room = self.app.get("roomMap")[roomid];
	var oldUser;
	async.waterfall([
       	function(cb){
			verifyRoom(userid,self.app.get("roomMap")[roomid],cb);
		},
		function(cb){
			userDao.findRoomUserInfoById(userid,cb);
		},
		function(user,cb){
	
			if(!user){
				cb("获取用户信息失败");
				return ;
			}
			var allUser = room.allUser;
			var isUserExist = false;

			allUser.forEach(function(item){
				if(item.id == userid){
					if(!item.jetton){
						item.clubid = clubid;		
					}
					oldUser = item;
					isUserExist = true;
				}
			});
			if(!isUserExist){
				user.clubid = clubid;
				oldUser = user;
				allUser.push(user);
			}
			
			self.app.get('globalChannelService').add("roomuser_"+roomid, userid, session.get('serverId'), function(err) {

				if(err){
					console.err(err);
				}
			});
			self.app.get('redisClient').sadd("userRoom_"+userid,roomid, function(err,data){
				if(err){
					console.err(err);
				}
			});
			cb();
		}
    ],function(err){       
        if(err) {
			next(null, {code: Code.FAIL,msg:err});
			return;
		}
		next(null, {code: Code.OK,data:{clubid:oldUser.clubid}});
    });
}

//空位坐下
Handler.prototype.takeSeatRoom = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var clubid = msg.clubid;
	var roomid = msg.roomid;
	var seatnumber = msg.seatnumber;
	if(!clubid||!userid||!roomid||("0"!=seatnumber&&!seatnumber)){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}
	var room = self.app.get("roomMap")[roomid];
	var seatUser = room.takeSeatUser[seatnumber];
	if(seatUser){
		next(null, {code: Code.FAIL,msg:"该位置已存在用户！"}); 
        return; 	
	} 

	async.waterfall([
       function(cb){
			verifyRoom(userid,room,cb);
		},
		function(cb){
			// userDao.findRoomUserInfoById(userid,cb);
			var user;
			room.allUser.forEach(function(item){
				if(item.id == userid){
					user = 	item;
				}
			});
			if(!user){
				cb("数据错误！");
				return;
			}
			cb(null,user);
		},
		function(userinfo,cb){
			if(room.takeSeatUser){
				for (var key in room.takeSeatUser){
					if(room.takeSeatUser[key]&&room.takeSeatUser[key].id == userid){
						next(null, {code: Code.FAIL,msg:"你已经有位置！"}); 
						return; 
					}
				}
			}
			userinfo.seatnumber = seatnumber;
			room.takeSeatUser[seatnumber] = userinfo;
			userinfo.operationType=0;
			seatUser = userinfo;

			self.app.get('redisClient').get("peopleNumber_"+roomid,function(err,data){
				if(!data){
					data = 0;
				}
				self.app.get('redisClient').set("peopleNumber_"+roomid,Number(data) +1,cb);
			});

			// self.app.get('redisClient').set("peopleNumber_"+roomid, "",cb);
			// self.app.get('globalChannelService').add("allUser", userid, self.app.get('serverId'), function(err) {});
			// self.app.get('globalChannelService').add("roomuser_"+roomid, userid, self.app.get('serverId'), function(err) {});
		},
		function(data,cb){

			self.app.get('globalChannelService').pushMessage("connector","onRoom",{type:"1",data:{user:seatUser,seatnumber:seatnumber}},"roomuser_"+roomid,{isPush: true},function(err, fails) {
				if(err) {
					console.error('send message to all users error: %j, fail ids: %j', err, fails);
					return;
				}
				cb();
			});
		}
    ],function(err){    

        if(err) {
			next(null, {code: Code.FAIL,msg:err});
			return;
		}
		startGame(room,self.app);
		// var room = self.app.get("roomMap")[roomid];
		next(null, {code: Code.OK});
    });
	
}
//查询金币以及上分消耗钻石
Handler.prototype.queryJettonJewelConfig = function(msg, session, next){
	var userid = session.get("rid");
	var clubid = msg.clubid;
    var roomAddJettonJewel,totalJewel,goldNumber;
    async.waterfall([
        function(cb){
            configDao.getConfigByKey("roomAddJettonJewel",cb);
        },
        function(configInfo,cb){
            roomAddJettonJewel = configInfo.value;
			userDao.findJewelNumberByById(userid,cb);
		},
		function(jewel,cb){
			totalJewel = jewel;
			clubUserDao.findGoldNumberByCulbIdAndUserId(clubid,userid,cb)
		}
    ],function(err,gold){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        goldNumber =gold;
        next(null, {code: Code.OK,data:{roomAddJettonJewel:roomAddJettonJewel,totalJewel:totalJewel,goldNumber:goldNumber}}); 
    });
}


//上分
Handler.prototype.roomAddJettonJewel = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var clubid = msg.clubid;
	var roomid = msg.roomid;
	var jetton = msg.jetton;

	jetton = Math.abs(Math.floor(Number(jetton)));
	if(!clubid||!userid||!roomid||("0"!=jetton&&!jetton)){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}
	
	var room = self.app.get("roomMap")[roomid];
	var user ;
	if(room.allUser&&room.allUser.length>0){
		room.allUser.forEach(function(item,index){
			if(item.id == userid){
				if(clubid!=item.clubid){
					next(null, {code: Code.FAIL,msg:"参数错误！"}); 
					return; 
				}
				user = item;
			}	
		});
	}
	if(room.minBringBankRoll>(jetton+(user.jetton?user.jetton:0))){
		next(null, {code: Code.FAIL,msg:"最低筹码为"+room.minBringBankRoll }); 
        return;  
	}
	// var user = room.takeSeatUser[seatnumber];
	async.waterfall([

        function(cb){
			if(user.id!=userid){
				cb("参数错误！");
				return ;
			}
            configDao.getConfigByKey("roomAddJettonJewel",cb);
        },
        function(configInfo,cb){
            roomAddJettonJewel = configInfo.value;
			userDao.findJewelNumberByById(userid,cb);
		},
		function(jewel,cb){
			totalJewel = jewel;
			if(totalJewel<roomAddJettonJewel){
				cb("钻石不足");
				return ;
			}
			clubUserDao.findGoldNumberByCulbIdAndUserId(clubid,userid,cb)
		},
		function(gold,cb){
			goldNumber =gold;
			if(goldNumber<jetton){
				cb("金币不足");
				return ;
			}
			roomJettonDao.roomAddJetton(userid,roomid,clubid,jetton,roomAddJettonJewel,cb);
		},
		function(cb){
			if(!user["jetton"]){
				user["jetton"] = 0;
			}
			user.jetton = user.jetton+jetton;
			self.app.get('globalChannelService').pushMessage("connector","onRoom",{type:"2",data:{user:user}},"roomuser_"+roomid,{isPush: true},cb);		
		}
    ],function(err){
        if(err) {
			console.error(err);
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
		startGame(room,self.app);
        next(null, {code: Code.OK}); 
    });
}

//站起围观
var userStand = function(userid,room,app){
	var roomid = room.id;
	var user ,seatnumber;
	if(room.takeSeatUser){
		// console.log(room.takeSeatUser);
		for(var key in room.takeSeatUser){
			if(room.takeSeatUser[key]&&room.takeSeatUser[key].id == userid){
				user = room.takeSeatUser[key];
				seatnumber = key;
				room.takeSeatUser[key] = null;
			}	
		}

	}
	app.get('redisClient').get("peopleNumber_"+roomid,function(err,data){
		if(!data){
			data = 0;
		}
		app.get('redisClient').set("peopleNumber_"+roomid,Number(data) -1,function(){});
	});
	app.get('globalChannelService').pushMessage("connector","onRoom",{type:"3",data:{seatnumber:seatnumber,userid:userid}},"roomuser_"+roomid,{isPush: true},function(){});
}
//todo加判断，判断游戏中弃牌后才能站起
Handler.prototype.userStand = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var roomid = msg.roomid;
	if(!userid||!roomid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}

	var room = self.app.get("roomMap")[roomid];
	var isGame = false;
	for(var i=0;i<room.gameUser.length;i++){
		var user = room.gameUser[i];
		if(user.id == userid){
			isGame = true;	
		}
	}
	if(isGame){
		if(!room["leaveGameUser"]){
			room["leaveGameUser"] = [];
		}
		room["leaveGameUser"].push(userid);
	}else{
		userStand(userid,room,self.app);	
	}

	next(null, {code: Code.OK}); 
}

//用户结算
//todo加判断，站起后才能结算
Handler.prototype.userClosing = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var roomid = msg.roomid;
	var room = self.app.get("roomMap")[roomid];
	var clubid = msg.clubid;
	if(!userid||!roomid||!clubid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}

	var user,isExist;
	if(room.takeSeatUser){
		for(var key in room.takeSeatUser){
			if(room.takeSeatUser[key]&&room.takeSeatUser[key].id == userid){
				isExist = true;
			}	
		}

	}
	if(isExist){
		next(null, {code: Code.FAIL,msg:"请先站起"}); 
        return;  
	}
	if(room.allUser&&room.allUser.length>0){
		room.allUser.forEach(function(item,index){
			if(item.id == userid){
				if(clubid!=item.clubid){
					next(null, {code: Code.FAIL,msg:"参数错误！"}); 
					return; 
				}
				user = item;
			}	
		});
	}
	if(!user.jetton){
		next(null, {code: Code.OK}); 
        return;  
	}
	async.waterfall([
		function(cb){
			roomJettonDao.roomRemoveJetton(userid,roomid,clubid,user.jetton,cb);
		}
    ],function(err){
		user.jetton = 0;
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }

        next(null, {code: Code.OK}); 
    });
}
//用户下注
Handler.prototype.userAnte = function(msg, session, next){
	var self = this;
	var userid = session.get("rid");
	var roomid = msg.roomid;
	var room = self.app.get("roomMap")[roomid];
	var type =  msg.type;
	if(!userid||!roomid||!room){
		next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}
	if(room["operationUser"].id!=userid){
		next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
	}
	var user;
	room.gameUser.forEach(function(item){
		if(item.id == userid){
			user = item;
		}
	});
	if(user.operationType == 3||user.operationType == 5){
		next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  	
	}

	var operationType = 0; 	//0 未进行任何操作 1加注 2跟注 3弃牌 4看牌 5allin\

	var maxBet = room.maxBet,pot = room.pot;
	if(type =="-1"){
		if(!msg.ante){
			next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        	return;  
		}
		var ante = msg.ante;
		if(ante>user.jetton){
			ante = user.jetton
		}
		if(ante == user.jetton){
			operationType = 5;	
		}else if(ante+user.currentBet == maxBet){
			operationType = 2;	
		}else if(ante+user.currentBet > maxBet){
			operationType = 1;	
		}
		room.pot = 	room.pot+ante;
		user.currentBet = user.currentBet+ante;	
		user.totalBet = user.totalBet+ante;
		user.jetton = user.jetton - ante;
		if(user.currentBet> room.maxBet){
			room.maxBet = user.currentBet;
		}
	}else if(type =="0"){
		operationType = 3;
	}else if(type =="0_1"){
		if(room.maxBet ==0){
			operationType = 4;	
		}else{
			operationType = 3;	
		}	
	}else if(type =="1"){
		if(maxBet-user.currentBet>=user.jetton){
			operationType = 5;	
			room.pot = 	room.pot+user.jetton;
			user.currentBet = user.currentBet+user.jetton;	
			user.totalBet = user.totalBet+user.jetton;
			user.jetton = 0;
		}else{
			operationType = 2;	
			room.pot = 	room.pot+(maxBet-user.currentBet);
			user.jetton = user.jetton-(maxBet-user.currentBet);
			user.totalBet = user.totalBet+(maxBet-user.currentBet);
			user.currentBet = maxBet;	
		}
	}else if(type =="1_3"||type =="1_2"||type =="2_3"||type =="3_4"||type =="1_1"){
		var zs = 0;
		if(type =="1_3"){
			zs = Math.ceil(pot/3)+maxBet;
		}
		if(type =="1_2"){
			zs = Math.ceil(pot/2)+maxBet;
		}
		if(type =="2_3"){
			zs =  Math.ceil((pot/3)*2)+maxBet;
		}
		if(type =="3_4"){
			zs =  Math.ceil((pot/4)*3)+maxBet;
		}
		if(type =="1_1"){
			zs = pot+maxBet;
		}
		if(zs-user.currentBet>=user.jetton){
			operationType = 5;	
			room.pot = 	room.pot+user.jetton;
			user.currentBet = user.currentBet+user.jetton;	
			user.totalBet = user.totalBet+user.jetton;
			user.jetton = 0;
		}else{
			operationType = 1;	
			room.pot = 	room.pot+(zs-user.currentBet);	
			user.jetton = user.jetton-(zs-user.currentBet);
			user.totalBet = user.totalBet+(zs-user.currentBet);
			user.currentBet = zs;	

		}
		if(user.currentBet> room.maxBet){
			room.maxBet = user.currentBet;
		}
	}
	user.operationType = operationType;
	// self.app.get("timeOutInterval");
	if(self.app.get("timeOutInterval"+roomid)){
		clearTimeout(self.app.get("timeOutInterval"+roomid));
	}
	async.waterfall([
		function(cb){
			self.app.get('globalChannelService').pushMessage("connector","onRoom",{type:"8",data:{user:user}},"roomuser_"+roomid,{isPush: true},cb);
		},
		function(data,cb){
			userOperation(self.app,room);
			cb();
		}
	],function(err){
		if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
	});


}
	//判断游戏结束,游戏结束后清除相关数据
var roomTimeOut = function(room,app){
	if(room["endDate"] ){
		var cd = new Date();
		var ed = new Date(room.endDate);
		if(cd.getTime() > ed.getTime()){
			//防止定时任务重复删除
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
			return true;
		}
	}
	return false;
}

var startGame = function(room,app){
	//判断游戏结束,游戏结束后清除相关数据
	var s = roomTimeOut(room,app);
	if(s){
		return ;
	}
	if(room.isStart){
		return ;
	}
	room.isStart = true;
	var userArr = [];
	var tempArr = [];
	var gametempMap ={};
	if(room.takeSeatUser){
		for(var key in room.takeSeatUser){
			var user =room.takeSeatUser[key];
			if(user&&user.jetton&&user.jetton>(room.ante+(room.bigBlinds*2))){
				tempArr[key] = user;
				gametempMap[key] = user;
			}
		}
	}

	tempArr.forEach(function(item){
		if(item){
			userArr.push(item);
		}
	
	});

	if(!userArr||userArr.length<2||userArr.length<Number(room.startPeopleNumber)){
		room.isStart = false;
		return ;
	}
	room.isStart = true;
	//判断庄家
	var buttonUser = getButtonIndex(room,gametempMap);
	room.gameUser = userArr;

	var gameIndex = 0;
	room.gameUser.forEach(function(item,index){
		if(item.id == buttonUser.id){
			gameIndex = index;
		}
		//底注
		item.currentBet	= room.ante;
		item.totalBet = room.ante;
		room.pot = room.pot+room.ante;
		item.jetton = item.jetton - room.ante;
	});
	room["gameIndex"] = gameIndex;
	//庄家在玩家中的位置
	room["buttonGameIndex"] = gameIndex;
	var roomid = room.id;
	//阶段 （1：Perflop 2：Flop 3：Turn 4：River 5：比牌）
	room["phaseType"] = 1;
	//已发的扑克牌
	room["dealCards"] = [];
	async.waterfall([
	  function(cb) {
		if(!room.startDate&&!room.endDate){
			room.startDate = new Date();
			room.endDate = 	new Date(room.startDate.getTime() + parseInt(3600 * 1000 * room.duration));
			roomDao.updateStartDate(roomid,room.startDate ,room.endDate,cb);
		}else{
			cb(null,true);
		}	  
	  },
      function(date,cb){
		  if(!date){
			cb("修改开始时间失败");
			return ;
		  }
		//底注 发牌（庄家，底池）
		app.get('globalChannelService').pushMessage("connector","onRoom",{type:"4",data:{gameUser:room.gameUser,button:buttonUser.seatnumber,pot:room.pot}},"roomuser_"+roomid,{isPush: true},cb);
	  },
	  function(data,cb){
		//玩家发牌
		var tempPkArr = app.get("room_pkArr"+roomid);
		if(!tempPkArr||tempPkArr.length==0){
			tempPkArr = pkArr;
		}
		var tempPkArr = shuffle(tempPkArr);
		app.set("room_pkArr"+roomid,tempPkArr);
		var userPkMap = {};
		app.set("room_userPkMap_"+roomid,userPkMap);
		var funArr = [];
		var pkindex = 0;
		room.gameUser.forEach(function(item){
			item.currentBet	= 0;
			var pk1 = tempPkArr[pkindex];
			pkindex = pkindex+1;
			var pk2 = tempPkArr[pkindex];
			pkindex = pkindex+1;
			userPkMap[item.id] = [pk1,pk2];
			funArr.push(function(cb1){
				app.get('statusService').pushByUids([item.id], "onRoom", {type:"5",pkarr:[pk1,pk2]},function(err){
					cb1(err);
				});
			});	
		});
		app.set("room_commonpk"+roomid,[
			tempPkArr[pkindex],
			tempPkArr[pkindex+1],
			tempPkArr[pkindex+2],
			tempPkArr[pkindex+3],
			tempPkArr[pkindex+4],
		]);	
		async.waterfall(funArr,function(err){
			cb(err);
		})
	  },
	  function(cb){
			room.gameUser.forEach(function(item){
				item.currentBet = 0;
				//0 未进行任何操作 1加注 2跟注 3弃牌 4看牌 5allin 6Straddle
				item.operationType = 0;

			});
			room.maxBet = room.bigBlinds;
		  //大小盲注
		  var SBUser = getNextUser(room);
			//小盲
			SBUser.currentBet = room.smallBlinds;
			SBUser.totalBet = SBUser.totalBet+room.smallBlinds;
			room.pot = room.pot+room.smallBlinds;
			SBUser.jetton = SBUser.jetton - room.smallBlinds;
			SBUser.operationType = 7;
			//大盲
			var BBUser = getNextUser(room);
			BBUser.currentBet	= room.bigBlinds;
			BBUser.totalBet = BBUser.totalBet+room.bigBlinds;
			room.pot = room.pot+room.bigBlinds;
			BBUser.jetton = BBUser.jetton - room.bigBlinds;
			BBUser.operationType = 8;
			//Straddle
			var StraddleUser = getNextUser(room);
			var s = room.bigBlinds*2-StraddleUser.currentBet;
			StraddleUser.currentBet	= room.bigBlinds*2;
			StraddleUser.totalBet = StraddleUser.totalBet+s;
			room.pot = room.pot+s;
			StraddleUser.jetton = StraddleUser.jetton - s;
			room.maxBet = StraddleUser.currentBet;
			StraddleUser.operationType = 6;
			app.get('globalChannelService').pushMessage("connector","onRoom",{type:"6",data:{SBUser:SBUser,BBUser:BBUser,pot:room.pot,StraddleUser:StraddleUser}},"roomuser_"+roomid,{isPush: true},cb);

	  },
	  function(data,cb){
			userOperation(app,room);
			cb();
	  }

    ],function(err,data){
        if(err) {
			console.error(err);
        }
    });

}
//玩家发表意见
var userOperation = function(app,room){
	//非弃牌玩家个数
	var playingUserArr = [];
	room.gameUser.forEach(function(item){
		if(item.operationType !="3"){
			playingUserArr.push(item);
		}
	});

	if(playingUserArr.length <=1){
		gameOver(app,room,playingUserArr);
		return ;
	}
		  //该用户发表意见
	var tempUser = getNextUser(room);
	//进入下一阶段
	if(!tempUser){
		var interval = setInterval(function(){
			clearTimeout(interval);
			gamePhase(app,room,playingUserArr);
		},500);
		
		return ;
	}
	var roomid = room.id;
	room["maxTimeout"] = 30;
	room["timeout"] = 30;
	room["operationUser"] = tempUser;
	app.get('globalChannelService').pushMessage("connector","onRoom",{type:"7",data:{userid:tempUser.id,seatnumber:tempUser.seatnumber,
		timeout:room.timeout,maxTimeout:room.maxTimeout,pot:room.pot,maxBet:room.maxBet,user:tempUser}},"roomuser_"+roomid,{isPush: true},function(){});	
	var interval = setInterval(function(){
		room.timeout = room.timeout-1;
		if(room.timeout<=0){
			clearTimeout(interval);
			tempUser.operationType = 3;
			app.get('globalChannelService').pushMessage("connector","onRoom",{type:"8",data:{user:tempUser}},"roomuser_"+roomid,{isPush: true},function(){
				userOperation(app,room);
				// if(!room["leaveGameUser"]){
				// 	room["leaveGameUser"] = [];	
				// }
				// room["leaveGameUser"].push(tempUser.id);
			});	
		}
	},1000);
	app.set("timeOutInterval"+roomid,interval);

}
//游戏进入下一阶段
//todo 进入下一阶段只剩1位玩家没有allin 的情况直接再次进入下一阶段
var gamePhase = function(app,room,playingUserArr){
	room.gameIndex = room["buttonGameIndex"];
	room.maxBet =0;
	room.gameUser.forEach(function(item){
		item.currentBet = 0;
		if(item.operationType!=3&&item.operationType!=5){
			item.operationType = 0;
		}
		
	});
	var roomid = room.id;
	var commonpk = app.get("room_commonpk"+roomid);
	// room["dealCards"] = [];
		//阶段 （1：Perflop 2：Flop 3：Turn 4：River 5：比牌）
		// room["phaseType"] = 1;
	room.phaseType = room.phaseType+1;	
	if(room.phaseType == 2){
		room.dealCards.push(commonpk[0]);
		room.dealCards.push(commonpk[1]);
		room.dealCards.push(commonpk[2]);
	}else if(room.phaseType == 3){
		room.dealCards.push(commonpk[3]);
	}else if(room.phaseType == 4){
		room.dealCards.push(commonpk[4]);
	}
	else if(room.phaseType == 5){
		gameOver(app,room,playingUserArr);
		return ;
	}
	async.waterfall([
		function(cb){
			app.get('globalChannelService').pushMessage("connector","onRoom",{type:"9",data:{phaseType:room.phaseType,dealCards:room.dealCards}},"roomuser_"+roomid,{isPush: true},cb);
		},
		function(data,cb){
			userOperation(app,room);
			cb();
		}
	],function(err){
		if(err) {
			console.error(err);
        }
	});
}
//结束本剧游戏计算输赢
var gameOver = function(app,room,playingUserArr){

	var roomid = room.id;
	if(playingUserArr.length<=1){
		//将底池的筹码给剩余的玩家
		var winBet = room.pot - playingUserArr[0].totalBet
		playingUserArr[0].winBet = winBet;
		playingUserArr[0].jetton =playingUserArr[0].jetton+ room.pot;
		
		app.get('globalChannelService').pushMessage("connector","onRoom",{type:"10",data:{winUserArr:[playingUserArr[0]]}},"roomuser_"+roomid,{isPush: true},function(){
			clearData(app,room);
			room.isStart = false;
			var interval = setInterval(function(){
				if(room["leaveGameUser"]){
					room["leaveGameUser"].forEach(function(id){
						userStand(id,room,app);		
					});
					room["leaveGameUser"] = [];
				}
				clearTimeout(interval);
				startGame(room,app);
			},3000);
			
		});

	}else{
		var potArr = calcPot(room.gameUser);
		console.log(potArr);
		// var cardTypeMap = {};
		var dealCards = room.dealCards;
		room.gameUser.forEach(function(item){

			if(item.operationType !=3){
				var userCards = app.get("room_userPkMap_"+roomid)[item.id];
				var userAllPk = dealCards.concat(userCards);
				var cardType = TexasPoker.score(userAllPk);
				item.pkArr = userCards;
				item.cardType = cardType;
			}else{
				item.cardType = {
					type:11,
					resultArr:[],
					compare:[]
				};
			}
			
		});

		var retWinUser = [];
		//重复Map
		var winMap = {};
		potArr.forEach(function(item){
			var pot = item.pot;
			var userArr = item.userArr;
			//根据牌型大小排序
			userArr.sort(function (p1, p2) {
				if(p1.cardType.type == p2.cardType.type){
					for(var i=0;i<p1.cardType.compare.length;i++){
						var compareNum1 = p1.cardType.compare[i];
						var compareNum2 = p2.cardType.compare[i];
						if(compareNum1!=compareNum2){
							return compareNum2 - compareNum1; 
						}	
					}
					return 0;
				}else{
					return p1.cardType.type - p2.cardType.type;
				}

			});

			//获取赢的用户
			var winUserArr = [userArr[0]];
			var compareStr = userArr[0].cardType.type+","+ userArr[0].cardType.compare.join(",");
			//判断相同牌型相同大小的用户
			for(var i=1;i<userArr.length;i++){
				var s = userArr[i].cardType.type+","+ userArr[i].cardType.compare.join(",");
				if(s!=compareStr){
					break;
				}
				winUserArr.push( userArr[i]);
			}
			// 
			winUserArr.forEach(function(item,index){
				var fPot = Math.floor(pot/(winUserArr.length-index));
				pot = pot -fPot;
				if(!item["winBet"]){
					item["winBet"] = 0;
				}
				item["winBet"] = item["winBet"] +fPot ;
				item.jetton =item.jetton+ fPot;
				if(!winMap[item.id]){
					retWinUser.push(item);
					winMap[item.id] = item;
				}

			});
		});
		playingUserArr.forEach(function(item){
			if(!item["winBet"]){
				item["winBet"] = 0;
			}
			item["winBet"] = item["winBet"] - item.totalBet ;
		});
		
		app.get('globalChannelService').pushMessage("connector","onRoom",{type:"10",data:{winUserArr:retWinUser,playingUserArr:playingUserArr}},"roomuser_"+roomid,{isPush: true},function(){
			clearData(app,room);
			room.isStart = false;
			var interval = setInterval(function(){
				if(room["leaveGameUser"]){
					room["leaveGameUser"].forEach(function(id){
						userStand(id,room,app);		
					});
					room["leaveGameUser"] = [];
				}
				clearTimeout(interval);
				startGame(room,app);
			},5000);
		});	
	}
}

//清空上一局数据
var clearData = function(app,room){
	
	var roomid = room.id;
	roomJettonDao.roomGameJetton (room.gameUser,roomid,function(err) {
		if(err){
			console.error(err);
		}	
			//清空数据
		room.dealCards = [];
		room.maxBet = 0;
		room.phaseType = "1";
		room.pot = 0;
		room.operationUser = null;
		room.gameUser.forEach(function(item){
			item.pkArr = [];
			item.cardType = null;
			item.totalBet = 0;
			item.currentBet = 0;
			item.operationType = 0;
			item.winBet = 0;
		});
		room.gameUser = [];
		app.set("room_userPkMap_"+roomid,{});
		app.set("room_commonpk"+roomid,[]);
	});
}
//分池
var calcPot = function(userArr){
    var potArr = [];
    var a = userArr.sort(function (p1, p2) {
        return p1.totalBet-p2.totalBet;
    });
    var prevTotalBet = 0;
    userArr.forEach(function(item,index){
        if(item.totalBet - prevTotalBet>0){
            var sum = (item.totalBet - prevTotalBet)*(userArr.length-index);
            potArr.push({
                pot: sum,
                userArr:userArr.slice(index,userArr.length)
            });
            prevTotalBet = item.totalBet;
        }
    });
    
    return potArr;
}
//获取游戏中下一位玩家
var getNextUser = function(room){
	var gameIndex = room.gameIndex;
	var nextUser = null;
	for(var x=gameIndex+1;x<room.gameUser.length;x++){
		var user = room.gameUser[x];
		if(user.operationType==4&&room.maxBet==0){
			//直接进入下一阶段
			return null;
		}
		//下未玩家应该是没弃牌 没allin 没有
		//0 未进行任何操作 1加注 2跟注 3弃牌 4看牌 5allin
		if(user.operationType!=3&&user.operationType!=5){
			if(room.maxBet==0){
				nextUser = user;
				gameIndex = x;
				break;
			}else if(user.currentBet<room.maxBet){
				nextUser = user;
				gameIndex = x;
				break;
			}
			
		}

	}
	if(!nextUser){
		for(var x=0;x<gameIndex;x++){
			var user = room.gameUser[x];
			if(user.operationType==4&&room.maxBet==0){
				//直接进入下一阶段
				return null;
			}
			//下未玩家应该是没弃牌 没allin 没有
			//0 未进行任何操作 1加注 2跟注 3弃牌 4看牌 5allin
			if(user.operationType!=3&&user.operationType!=5){
				if(room.maxBet==0){
					nextUser = user;
					gameIndex = x;
					break;
				}else if(user.currentBet<room.maxBet){
					nextUser = user;
					gameIndex = x;
					break;
				}
			}
	
		}	
	}
	if(nextUser){
		room.gameIndex = gameIndex;
	}
	return nextUser;
	// room.gameUser.forEach(function(item){

	// });
	// var gameIndex = room.gameIndex+1;
	// if(gameIndex>=room.gameUser.length){
	// 	gameIndex = 0;
	// }
	// room.gameIndex = gameIndex;
	// return room.gameUser[gameIndex];
}

//判断段庄家位置
var getButtonIndex = function(room,gametempMap){
	room.button =room.button+1;
	if(room.button>=room.maxPeopleNumber){
		room.button = 0;
	}
	if(gametempMap[room.button]){
		return gametempMap[room.button];
	}else{
		return getButtonIndex(room,gametempMap);	
	}
}

//洗牌算法
var shuffle = function (arr){
    var length = arr.length,
        temp,
        random;
    while(0 != length){
        random = Math.floor(Math.random() * length)
        length--;
        // swap
        temp = arr[length];
        arr[length] = arr[random];
        arr[random] = temp;
    }
    return arr;
}



