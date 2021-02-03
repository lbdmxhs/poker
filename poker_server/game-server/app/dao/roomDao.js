var pomelo = require('pomelo');
var roomDao = module.exports;

var tradingRecordDao = require('./tradingRecordDao');
var userDao= require('./userDao');

roomDao.saveRoom = function(room,client,cb){
	pomelo.app.get('dbclient').insertTableByClientRet(room,"room",client,cb);
}

//创建房间
roomDao.creationRoom = function(room,userid,creationRoomJewel,session,callback){
    var self = this;
	var currentDate = new Date();
	var roomid;
	pomelo.app.get('dbclient').Transaction(function(client){
		return [
			function(cb){
				userDao.updateJewelNumberByIdclient(userid,-creationRoomJewel,client,cb);
            },
            function(cb){
                self.saveRoom(room,client,cb);
			},
			function(rec,cb){
				roomid = rec.insertId;
				userDao.findJewelNumberByByIdclient(userid,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:userid,
					sum:-creationRoomJewel,
					creationDate:currentDate,
					type:"2",
					details:"创建牌局",
					consumeType:"15",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
			},
			function(cb){
				pomelo.app.rpc.room.roomRemote.creationRoom(session, {roomId:roomid,room:room},cb);
			}
		]
	},callback);

}

//查询俱乐部房间
roomDao.queryRoomByClubId = function(clubId,cb){
	var sql = 'SELECT * FROM room r WHERE r.allianceId in (SELECT ac.allianceId FROM allianceclub ac WHERE ac.clubId = ?) and r.status!=2';
	var args = [clubId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}

//查询俱乐部房间
roomDao.queryRoomByallianceId = function(allianceId,cb){
	var sql = 'SELECT * FROM room r WHERE r.allianceId = ? and r.status!=2';
	var args = [allianceId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
} 

//房间号查询房间信息
roomDao.queryRoomById = function(roomid,cb){
	var sql = 'select * from room where id = ?';
	var args = [roomid];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
}
//开始时间 
roomDao.updateStartDate = function (roomid,startDate,endDate,cb) {
    var sql = 'UPDATE room SET startDate = ? ,endDate = ?,status = "1" WHERE id = ?';
	var args = [startDate,endDate,roomid];
	pomelo.app.get('dbclient').updateSql(sql, args,cb)
}
//
roomDao.updateStatus = function (roomid,status,cb) {
    var sql = 'UPDATE room SET status = ? WHERE id = ?';
	var args = [status,roomid];
	pomelo.app.get('dbclient').updateSql(sql, args,cb)
}