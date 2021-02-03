var pomelo = require('pomelo');
var async = require('async');
var userDao= require('./userDao');
var clubUserDao = require('./clubUserDao');
var tradingRecordDao = require('./tradingRecordDao');
var clubDao = module.exports;

clubDao.saveClub = function(club,client,cb){
	pomelo.app.get('dbclient').insertTableByClient(club,"club",client,cb);
}

clubDao.save = function(id,name,headPortraitUrl,userid,cb){
    var sql = 'INSERT INTO club (`id`, `name`, `headPortraitUrl`, `creatorUserId`, `creationTime`) VALUES (?, ?, ?, ?, ?)';
	var args = [id,name,headPortraitUrl,userid,new Date()];
    pomelo.app.get('dbclient').saveSql(sql, args,cb)
}

clubDao.saveTransaction = function(id,name,headPortraitUrl,userid,expendJewelNumber,callback){
	var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(userid,-expendJewelNumber,client,cb);
			},
			function(cb){
				var club = {
					id:id,
					name:name,
					headPortraitUrl:headPortraitUrl,
					creatorUserId:userid,
					creationTime:currentDate
				}
				self.saveClub(club,client,cb);
			},
			function(cb){
				userDao.updateIsCreatClubByIdclient(userid,"1",client,cb);
			},
			function(cb){
				var clubUser = {
					userid:userid,
					clubid:id,
					goldNumber:0,
					isClubAuth:"1"
				};
				clubUserDao.saveClubUser(clubUser,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(userid,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:userid,
					sum:-expendJewelNumber,
					creationDate:currentDate,
					type:"2",
					details:"创建俱乐部",
					consumeType:"3",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			}
		]
	},callback);


};
/**
 * 查询用户所在俱乐部
 * @param {} uid 
 * @param {*} cb 
 */
clubDao.getUserClubByUserId = function (uid, cb){
	var sql = 'SELECT c.id,c.`name`,c.headPortraitUrl as txUrl,cu.isClubAuth as isSelf,'
	+'c.synopsis,c.isJewelExchange,c.maxUser,cu.goldNumber as clubGold,c.isSearch,c.isCreatorAlliance FROM clubUser cu LEFT JOIN club c ON cu.clubid = c.id WHERE cu.userid = ? and c.status = "1" ORDER BY cu.isClubAuth asc,cu.id asc';
	var args = [uid];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
};
/**
 * 查询用户所在俱乐部人数
 * @param {*} uid 
 * @param {*} cb 
 */
clubDao.getUserClubMemberNumberByUserId = function (uid, cb){
	var sql = 'SELECT cu.clubid,COUNT(1) as currentHeadcount FROM clubUser cu WHERE cu.clubid in ( SELECT clubid FROM clubUser WHERE userid =?)  GROUP BY cu.clubid';
	var args = [uid];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
};
clubDao.findClubByName = function (name, cb){
	var sql = 'SELECT * FROM club c WHERE name = ?';
	var args = [name];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
};

/**
 * 查询俱乐部人数
 * @param {*} uid 
 * @param {*} cb 
 */
clubDao.getUserClubMemberNumberByClubId = function (clubid, cb){
	var sql = 'SELECT COUNT(1) as currentHeadcount FROM clubUser cu WHERE cu.clubid =?';
	var args = [clubid];
	pomelo.app.get('dbclient').countBySql(sql,args,cb);
};
/**
 * 根据俱乐部ID 查询俱乐部
 * @param {} id 
 * @param {*} cb 
 */
clubDao.getClubById = function (id, cb){
	var sql = 'SELECT c.id,c.name,c.headPortraitUrl as txUrl,c.maxUser,c.synopsis,'+
	'(SELECT count(1) FROM clubuser cu WHERE cu.clubid = c.id) as currentHeadcount FROM club c WHERE id = ? AND c.status = "1"';
	var args = [id];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
};

clubDao.userSearchClubById = function (id, cb){
	var sql = 'SELECT c.id,c.name,c.headPortraitUrl as txUrl,c.maxUser,c.synopsis,'+
	'(SELECT count(1) FROM clubuser cu WHERE cu.clubid = c.id) as currentHeadcount FROM club c WHERE id = ? AND isSearch = "1" AND c.status = "1"';
	var args = [id];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
};

//修改钻石兑换比例
clubDao.updateJewelExchangeRatioById = function (id,jewelExchangeRatio, cb){
	var sql = 'UPDATE club SET JewelExchangeRatio = ? WHERE id = ?';
	var args = [jewelExchangeRatio,id];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);
};


//开启钻石兑换
clubDao.updateIsJewelExchangeById = function (id,isJewelExchange, cb){
	var sql = 'UPDATE club SET isJewelExchange = ? WHERE id = ?';
	var args = [isJewelExchange,id];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);
}; 

//修改俱乐部简介
clubDao.updateSynopsisById = function (id,synopsis, cb){
	var sql = 'UPDATE club SET synopsis = ? WHERE id = ?';
	var args = [synopsis,id];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);
}; 
//修改俱乐部是否允许搜索
clubDao.updateIsSearchById = function (id,isSearch, cb){
	var sql = 'UPDATE club SET isSearch = ? WHERE id = ?';
	var args = [isSearch,id];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);
};

clubDao.queryClubById = function (id, cb){
	var sql = 'SELECT * FROM club WHERE id = ?';
	var args = [id];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
}; 
//添加俱乐部人数上限
clubDao.addClubMaxUser = function(clubid,userid,jewelNumber,peopleNumber,callback){
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(userid,-jewelNumber,client,cb);
			},
			function(cb){
				var sql = 'UPDATE `club` SET maxUser = maxUser+? WHERE id = ?';
				var args = [peopleNumber,clubid];
				pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(userid,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:userid,
					sum:-jewelNumber,
					creationDate:currentDate,
					type:"2",
					details:"添加俱乐部人数上线("+peopleNumber+")",
					consumeType:"4",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			}
		];
	},callback);
}

clubDao.updateClubNameById = function (id,userid,name,expendJewelNumber, cb){
	// var sql = 'SELECT c.id,c.name,c.headPortraitUrl as txUrl,c.maxUser,c.synopsis,'+
	// '(SELECT count(1) FROM clubuser cu WHERE cu.clubid = c.id) as currentHeadcount FROM club c WHERE id = ? AND c.status = "1"';
	// var args = [id];
	// pomelo.app.get('dbclient').updateSql(sql,args,cb);
	var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(userid,-expendJewelNumber,client,cb);
			},
			function(cb){
				var sql = 'UPDATE `club` SET name = ? WHERE id = ?';
				var args = [name,id];
				pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(userid,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:userid,
					sum:-expendJewelNumber,
					creationDate:currentDate,
					type:"2",
					details:"修改俱乐部信息",
					consumeType:"11",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			}
		]
	},cb);
};

//查询俱乐部创建人
clubDao.queryCreationUserId = function(id,cb){
	var sql = 'SELECT c.id,c.creatorUserId FROM club c WHERE id = ?';
	var args = [id];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
}

//解散俱乐部
clubDao.dissolveClub = function(id,userId,cb){
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateIsCreatClubByIdclient(userId,"0",client,cb);
			},
			function(cb){
				var sql = 'UPDATE club SET status = "0" WHERE id = ?';
				var args = [id];
				pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
			}
		];
	},cb)
}