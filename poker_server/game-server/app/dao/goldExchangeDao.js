var pomelo = require('pomelo');
var clubUserDao = require('./clubUserDao');
var userDao = require('./userDao');
var tradingRecordDao = require('./tradingRecordDao');
var goldExchangeDao = module.exports;
// var async = require('async');
goldExchangeDao.queryAll = function(cb){
    var sql ='SELECT id,goldNumberStr,jewelNumber FROM goldexchange ';
    var args = [];
    pomelo.app.get('dbclient').findListBySql(sql, args,cb)
}

goldExchangeDao.queryById = function(id,cb){
    var sql ='SELECT id,goldNumber,jewelNumber FROM goldexchange WHERE id =? ';
    var args = [id];
    pomelo.app.get('dbclient').findOneBySql(sql, args,cb);
}

goldExchangeDao.userGoldExchangeDao = function(userid,clubid,goldNumber,jewelNumber,callback){
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(userid,-jewelNumber,client,cb);
			},
			function(cb){
				clubUserDao.updateGoldNumberByCulbIdAndUserIdclient(clubid,userid,goldNumber,client,cb);
			},
			function(cb){
				clubUserDao.findGoldNumberByCulbIdAndUserIdclient(clubid,userid,client,cb);
			},
			function(balance,cb){
				var tradingRecord = {
					userId:userid,
					participateUserId:userid,
					sum:goldNumber,
					creationDate:currentDate,
					type:"1",
					clubId:clubid,
					details:"购买金币(消费钻石:"+jewelNumber+")",
					consumeType:"10",
					balance:balance
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				userDao.findJewelNumberByByIdclient(userid,client,cb);
			},
			function(balance,cb){
				var tradingRecord = {
					userId:userid,
					sum:-jewelNumber,
					creationDate:currentDate,
					type:"2",
					details:"购买金币(数目:"+goldNumber+")",
					consumeType:"10",
					balance:balance
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			}
		];
	},callback)

}
