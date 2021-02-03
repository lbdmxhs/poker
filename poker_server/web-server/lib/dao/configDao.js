var mysql = require('./mysql/mysql');
var configDao = module.exports;
configDao.getConfigByKey = async function (key){
    var sql = 'SELECT * FROM config WHERE `key` = ?';
    var args = [key];
    var configObj = await mysql.findOne(sql,args).catch(function (err) {
      user = null;
      //console.error(err.message);
      return Promise.reject(err);
    });
    return Promise.resolve(configObj);
  };