var pomelo = require('pomelo');
var utils = require('../util/utils');

var userDao = module.exports;
/**
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
userDao.getUserById = function (uid, cb){
	var sql = 'select * from user where id = ?';
	var args = [uid];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
};
userDao.findRoomUserInfoById = function (uid, cb){
	var sql = 'select id,name,accountType,headPortraitType,headPortraitUrl from user where id = ? AND accountStatus = 1';
	var args = [uid];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
};
userDao.updateUserTokenByid = function(id,token,cb){
	var sql = 'UPDATE `user` SET  token = ?  WHERE id =?';
	var args = [token,id];
	pomelo.app.get('dbclient').updateSql(sql, args,cb)
};
userDao.updateUserJewelNumberByid = function(id,expendJewelNumber,cb){
	var sql = 'UPDATE `user` SET jewelNumber = jewelNumber-? WHERE id = ?';
	var args = [expendJewelNumber,id];
	pomelo.app.get('dbclient').updateSql(sql, args,cb)
};

userDao.updateUserIsCreatClubByid = function(id,cb){
	var sql = 'UPDATE `user` SET isCreatClub = ? WHERE id = ?';
	var args = ["1",id];
	pomelo.app.get('dbclient').updateSql(sql, args,cb)
};

userDao.updateJewelNumberByIdclient = function(id,expendJewelNumber,client,cb){
	var sql = 'UPDATE `user` SET jewelNumber = jewelNumber+? WHERE id = ?';
	var args = [expendJewelNumber,id];
	pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
}
userDao.updateIsCreatClubByIdclient = function(id,isCreatClub,client,cb){
	var sql = 'UPDATE `user` SET isCreatClub = ? WHERE id = ?';
	var args = [isCreatClub,id];
	pomelo.app.get('dbclient').executeSqlByclient(sql,args,client,cb);
}
userDao.findJewelNumberByByIdclient= function(id,client,cb){
	var sql = 'SELECT jewelNumber FROM user WHERE id =?';
	var args = [id];
	pomelo.app.get('dbclient').findOneSqlByclient(sql,args,client,function(err,obj){
		if(err||!obj){
			cb("查询失败！");
			return ;
		}
		cb(null,obj.jewelNumber);
	});
}

userDao.findJewelNumberByById = function(id,cb){
	var sql = 'SELECT jewelNumber FROM user WHERE id =?';
	var args = [id];
	pomelo.app.get('dbclient').findOneBySql(sql,args,function(err,obj){
		if(err||!obj){
			cb("查询失败！");
			return ;
		}
		cb(null,obj.jewelNumber);
	});
}