/**
 * 交易记录
 */
var pomelo = require('pomelo');
var clubUserDao =  require('./clubUserDao');
var userDao = require('./userDao');
var tradingRecordDao = module.exports;
tradingRecordDao.saveTradingRecord = function(tradingRecord,client,cb){
	pomelo.app.get('dbclient').insertTableByClient(tradingRecord,"tradingRecord",client,cb);
}
//金币赠送
tradingRecordDao.saveTransaction = function(transfeUserId,receiveUserId,sum,clubId,callback){
	var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,transfeUserId,-sum,client,cb);
			},
			function(cb){
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,receiveUserId,sum,client,cb);
			},
			function(cb){
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,transfeUserId,client,cb);
			},
			function(goldNumber,cb){
				var tradingRecord = {
					userId:transfeUserId,
					participateUserId:receiveUserId,
					sum:-sum,
					clubId:clubId,
					creationDate:currentDate,
					type:"1",
					details:"赠送金币",
					consumeType:"1",
					balance:goldNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,receiveUserId,client,cb);
			},
			function(goldNumber,cb){
				var tradingRecord = {
					userId:receiveUserId,
					participateUserId:transfeUserId,
					sum:sum,
					clubId:clubId,
					creationDate:currentDate,
					type:"1",
					details:"收到金币",
					consumeType:"2",
					balance:goldNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			}
		]
	},callback);
}
//钻石赠送
tradingRecordDao.saveTransactionJewel = function(transfeUserId,receiveUserId,sum,clubId,callback){
	var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(transfeUserId,-sum,client,cb);
				// clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,transfeUserId,-sum,client,cb);
			},
			function(cb){
				userDao.updateJewelNumberByIdclient(receiveUserId,sum,client,cb);
				// clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,receiveUserId,sum,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(transfeUserId,client,cb);
				// clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,transfeUserId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:transfeUserId,
					participateUserId:receiveUserId,
					sum:-sum,
					clubId:clubId,
					creationDate:currentDate,
					type:"2",
					details:"赠送钻石",
					consumeType:"8",
					balance:jewelNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(receiveUserId,client,cb);
				// clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,receiveUserId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:receiveUserId,
					participateUserId:transfeUserId,
					sum:sum,
					clubId:clubId,
					creationDate:currentDate,
					type:"2",
					details:"收到钻石",
					consumeType:"9",
					balance:jewelNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			}
		]
	},callback);
}
//查询用户在俱乐部的交易记录
tradingRecordDao.queryTradingRecordByUserIdAndClubId = function(userid,clubid,curPage,pageSize,cb){
	var sql ='SELECT participateUserId as userId,sum as je,type,creationDate as timeDate,consumeType FROM tradingrecord '+
	'WHERE clubId = ? AND userId = ? ORDER BY creationDate DESC,participateUserId asc  limit ?,?';
	var args = [clubid,userid,(curPage-1)*pageSize,pageSize];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
//查询俱乐部交易记录
tradingRecordDao.queryTradingRecordByClubId = function(clubid,curPage,pageSize,cb){
	var sql ='SELECT userId,sum as je,type,creationDate as timeDate,consumeType FROM tradingrecord '+
	'WHERE clubId = ? ORDER BY creationDate DESC,type asc,userId asc  limit ?,?';
	var args = [clubid,(curPage-1)*pageSize,pageSize];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}
//查询总记录数

tradingRecordDao.countByUserIdAndClubId = function(userid,clubid,cb){
	var sql ='SELECT count(1) as count FROM tradingrecord WHERE clubId = ? AND userId = ?';
	var args = [clubid,userid];
    pomelo.app.get('dbclient').countBySql(sql, args,cb)
}

//查询总记录数
tradingRecordDao.countByClubId = function(clubid,cb){
	var sql ='SELECT count(1) as count FROM tradingrecord WHERE clubId = ?';
	var args = [clubid];
    pomelo.app.get('dbclient').countBySql(sql, args,cb)
}

//购买钻石
tradingRecordDao.saveTransactionJewelExchange = function(transfeUserId,receiveUserId,exchangeJewelNumber,exchangeGoldNumber,clubId,callback){
	var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(transfeUserId,exchangeJewelNumber,client,cb);
			},
			function(cb){
				userDao.updateJewelNumberByIdclient(receiveUserId,-exchangeJewelNumber,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(transfeUserId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:transfeUserId,
					participateUserId:receiveUserId,
					sum:exchangeJewelNumber,
					clubId:clubId,
					creationDate:currentDate,
					type:"2",
					details:"购买俱乐部钻石(消耗："+exchangeGoldNumber+"金币)",
					consumeType:"6",
					balance:jewelNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(receiveUserId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:receiveUserId,
					participateUserId:transfeUserId,
					sum:-exchangeJewelNumber,
					clubId:clubId,
					creationDate:currentDate,
					type:"2",
					details:"俱乐部钻石被购买(收到:"+exchangeGoldNumber+"金币)",
					consumeType:"7",
					balance:jewelNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,transfeUserId,-exchangeGoldNumber,client,cb);
			},
			function(cb){
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubId,receiveUserId,exchangeGoldNumber,client,cb);
			},
			function(cb){
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,transfeUserId,client,cb);
			},
			function(goldNumber,cb){
				var tradingRecord = {
					userId:transfeUserId,
					participateUserId:receiveUserId,
					sum:-exchangeGoldNumber,
					clubId:clubId,
					creationDate:currentDate,
					type:"1",
					details:"购买俱乐部钻石(购买："+exchangeJewelNumber+"钻石)",
					consumeType:"6",
					balance:goldNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubId,receiveUserId,client,cb);
			},
			function(goldNumber,cb){
				var tradingRecord = {
					userId:receiveUserId,
					participateUserId:transfeUserId,
					sum:exchangeGoldNumber,
					clubId:clubId,
					creationDate:currentDate,
					type:"1",
					details:"俱乐部钻石被购买(被购买:"+exchangeJewelNumber+"钻石)",
					consumeType:"7",
					balance:goldNumber
				}
				self.saveTradingRecord(tradingRecord,client,cb);
			}
		]
	},callback);
}