var pomelo = require('pomelo');
var configDao = module.exports;

configDao.getConfigByKey = function(key,cb){
    var sql = 'SELECT * FROM config WHERE `key` = ?';
	var args = [key];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);
}