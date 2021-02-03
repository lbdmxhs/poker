var pomelo = require('pomelo');
var utils = require('../util/utils');
var tradingRecordDao = require('./tradingRecordDao');
var clubUserDao = module.exports;
clubUserDao.saveClubUser  =  function(clubUser,client,cb){
	pomelo.app.get('dbclient').insertTableByClient(clubUser,"clubUser",client,cb);
}
clubUserDao.save = function(id,userid,cb){
    var sql = 'INSERT INTO clubUser (`userid`, `clubid`, `goldNumber`, `isClubAuth`) VALUES (?, ?, ?, ?)';
    var args = [userid,id,0,"5"];
    pomelo.app.get('dbclient').saveSql(sql, args,cb)
}
clubUserDao.getClubUserById = function(id,userid,cb){
    var sql = 'SELECT * FROM clubuser WHERE userid = ? AND clubid = ?';
    var args = [userid,id];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}

//查询俱乐部下所有用户(包含金币)
clubUserDao.getClubAllUserGoldByClubId = function(id,curPage,pageSize,cb){
	var sql = 'SELECT u.id,u.name,cu.isClubAuth as isVip,u.headPortraitType,u.headPortraitUrl,cu.goldNumber as jbs FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? ORDER BY cu.isClubAuth asc,u.loginTime desc,cu.id asc limit ?,?';

    var args = [id,(curPage-1)*pageSize,pageSize];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
//查询俱乐部下所有用户(包含钻石)
clubUserDao.getClubAllUserJewelByClubId = function(id,curPage,pageSize,cb){
	var sql = 'SELECT u.id,u.name,cu.isClubAuth as isVip,u.headPortraitType,u.headPortraitUrl,u.jewelNumber as zss FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? ORDER BY cu.isClubAuth asc,u.loginTime desc,cu.id asc limit ?,?';
    var args = [id,(curPage-1)*pageSize,pageSize];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
//查询俱乐部下所有用户(登录时间)
clubUserDao.getClubAllUserDateByClubId = function(id,curPage,pageSize,cb){
	var sql = 'SELECT u.id,u.name,cu.isClubAuth as isVip,u.headPortraitType,u.headPortraitUrl,u.loginTime,cu.goldNumber as jbs FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? ORDER BY cu.isClubAuth asc,u.loginTime desc,cu.id asc limit ?,?';
    var args = [id,(curPage-1)*pageSize,pageSize];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}

//查询俱乐部下用户(简易信息)
clubUserDao.queryClubUserSimpleByClubId = function(id,curPage,pageSize,cb){
	var sql = 'SELECT u.id,u.headPortraitType,u.headPortraitUrl,u.vipExpirationTime FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? ORDER BY cu.isClubAuth asc,u.vipExpirationTime desc,u.loginTime desc,cu.id asc limit ?,?';
    var args = [id,(curPage-1)*pageSize,pageSize];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
/**
 * 查询俱乐部总人数
 * @param {} id 
 * @param {*} cb 
 */
clubUserDao.getClubUserCountByClubId = function(id,cb){
	var sql = 'SELECT count(1) as count FROM clubuser  cu WHERE cu.clubid = ?';
    var args = [id];
    pomelo.app.get('dbclient').countBySql(sql, args,cb)
}
/**
 * 查询用户是否在俱乐部中
 */
clubUserDao.queryUserExistByClubId = function(clubId,userid,cb){
	var sql = 'SELECT count(1) as count FROM clubuser  cu LEFT JOIN club c ON cu.clubid = c.id WHERE cu.clubid = ? and cu.userid = ? AND c.status = 1';
    var args = [clubId,userid];
    pomelo.app.get('dbclient').countBySql(sql, args,function(err, res){
		if(err){
			utils.invokeCallback(cb,err.message, null);
		}else{
			utils.invokeCallback(cb, null, res>0?true:false);
		}
	})
}

// 查询俱乐部中的用户(包含金币)
clubUserDao.queryUserByClubIdAndUserId = function(clubId,userid,cb){
	var sql = 'SELECT u.id,u.name,cu.isClubAuth as isVip,u.headPortraitType,u.headPortraitUrl,cu.goldNumber as jbs FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? and cu.userid = ?';
    var args = [clubId,userid];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
// 查询俱乐部中的用户(包含钻石)
clubUserDao.queryUserJewelByClubIdAndUserId = function(clubId,userid,cb){
	var sql = 'SELECT u.id,u.name,cu.isClubAuth as isVip,u.headPortraitType,u.headPortraitUrl,u.jewelNumber as zss FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? and cu.userid = ?';
    var args = [clubId,userid];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
// 查询俱乐部中的用户(登录时间)
clubUserDao.queryUserDateByClubIdAndUserId = function(clubId,userid,cb){
	var sql = 'SELECT u.id,u.name,cu.isClubAuth as isVip,u.headPortraitType,u.headPortraitUrl,u.loginTime,cu.goldNumber as jbs FROM clubuser  cu LEFT JOIN user u ON cu.userid = u.id '+
	'WHERE cu.clubid =? and cu.userid = ?';
    var args = [clubId,userid];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
//查询用户金额
clubUserDao.queryUserGoldByUserid = function(clubId,userid,cb){
	var sql = 'SELECT * FROM clubuser WHERE userid = ? AND clubid = ?';
    var args = [userid,clubId];
    pomelo.app.get('dbclient').findOneBySql(sql, args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
		} else {
			if (res) {
				utils.invokeCallback(cb, null, res.goldNumber);
			} else {
				utils.invokeCallback(cb, null, 0);
			}
		}
	})
}

//查询用俱乐部下用户信息
clubUserDao.queryUserByCulbIdAndUserId = function(clubId,userid,cb){
	var sql = 'SELECT * FROM clubuser WHERE clubid = ? AND userid = ?';
    var args = [clubId,userid];
    pomelo.app.get('dbclient').findOneBySql(sql, args,cb)
}
clubUserDao.findGoldNumberByCulbIdAndUserIdclient = function(clubid,userid,client,cb){
	var sql = 'SELECT goldNumber FROM clubuser WHERE userid = ? AND clubid = ?';
	var args = [userid,clubid];
	pomelo.app.get('dbclient').findOneSqlByclient(sql,args,client,function(err,obj){
		if(err||!obj){
			utils.invokeCallback(cb,"查询失败！",null);
			return ;
		}
		utils.invokeCallback(cb,null,obj.goldNumber);
	});
}

clubUserDao.findGoldNumberByCulbIdAndUserId = function(clubid,userid,cb){
	var sql = 'SELECT goldNumber FROM clubuser WHERE userid = ? AND clubid = ?';
	var args = [userid,clubid];
	pomelo.app.get('dbclient').findOneSql(sql,args,function(err,obj){
		if(err||!obj){
			utils.invokeCallback(cb,"查询失败！",null);
			return ;
		}
		utils.invokeCallback(cb,null,obj.goldNumber);
	});
}

clubUserDao.updateGoldNumberByCulbIdAndUserIdclient = function(clubid,userid,sum,client,cb){
	var sql = 'UPDATE clubuser SET goldNumber = goldNumber+? WHERE userid = ? AND clubid = ?';
	var args = [sum,userid,clubid];
	pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
}

//删除俱乐部用户
clubUserDao.deleteByCulbIdAndUserId = function(clubId,adminId,userid,surplusGold,cb){
	var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				if(!surplusGold||surplusGold<=0){
					cb();
					return ;
				}
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,userid,-surplusGold,client,cb);
			},
			function(cb){
				if(!surplusGold||surplusGold<=0){
					cb();
					return ;
				}
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,adminId,surplusGold,client,cb);
			},
			function(cb){
				if(!surplusGold||surplusGold<=0){
					cb();
					return ;
				}
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,userid,client,cb);
			},
			function(goldNumber,cb){
				if(!surplusGold||surplusGold<=0){
					cb();
					return ;
				}
				var tradingRecord = {
					userId:userid,
					participateUserId:adminId,
					sum:-surplusGold,
					clubId:clubId,
					creationDate:currentDate,
					type:"1",
					details:"赠送金币",
					consumeType:"1",
					balance:goldNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				if(!surplusGold||surplusGold<=0){
					cb();
					return ;
				}
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,adminId,client,cb);
			},
			function(goldNumber,cb){
				if(!surplusGold||surplusGold<=0){
					cb();
					return ;
				}
				var tradingRecord = {
					userId:adminId,
					participateUserId:userid,
					sum:surplusGold,
					clubId:clubId,
					creationDate:currentDate,
					type:"1",
					details:"收到金币",
					consumeType:"2",
					balance:goldNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				var sql = 'DELETE FROM clubuser WHERE clubid = ? AND userid = ?';
				var args = [clubId,userid];
				pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
			}


		]
	},cb);
	
}


