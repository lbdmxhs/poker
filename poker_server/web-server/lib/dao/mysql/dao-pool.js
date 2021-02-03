var _poolModule = require('generic-pool');
var mysqlConfig = require('../../../../shared/config/mysql');
var mysql = require('mysql');

var env = process.env.NODE_ENV || 'development';
if(mysqlConfig[env]) {
  mysqlConfig = mysqlConfig[env];
}

/*
 * Create mysql connection pool.
 */
var createMysqlPool = function(){
  return _poolModule.createPool({
    create   : function() {
	  return  mysql.createConnection({
        host: mysqlConfig.host,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        database: mysqlConfig.database
      });
    },
    destroy  : function(client) { client.disconnect(); }
  },{
  max: mysqlConfig.connectionPoolMax, // maximum size of the pool
  min: mysqlConfig.connectionPoolMin // minimum size of the pool
});
};

exports.createMysqlPool = createMysqlPool;
