var _poolModule = require('generic-pool');
var mysql = require('mysql');
/*
 * Create mysql connection pool.
 */
var createMysqlPool = function(app) {
	var mysqlConfig = app.get('mysql');
	return _poolModule.createPool({
		name: 'mysql',
		create: function(callback) {	
			return  mysql.createConnection({
				host: mysqlConfig.host,
				user: mysqlConfig.user,
				password: mysqlConfig.password,
				database: mysqlConfig.database
			  });
		},
		destroy: function(client) {
			client.disconnect();
		},
	},{
		max: mysqlConfig.connectionPoolMax, // maximum size of the pool
		min: mysqlConfig.connectionPoolMin // minimum size of the pool
	  });
};

exports.createMysqlPool = createMysqlPool;
