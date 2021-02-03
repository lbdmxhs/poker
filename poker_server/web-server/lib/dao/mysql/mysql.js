// mysql CRUD
var sqlclient = module.exports;

var _pool = null;

var NND = {};

/*
 * Innit sql connection pool
 * @param {Object} app The app for the server.
 */
NND.init = function(){
	if(!_pool)
		_pool = require('./dao-pool').createMysqlPool();
};

/**
 * Excute sql statement
 * @param {String} sql Statement The sql need to excute.
 * @param {Object} args The args for the sql.
 * @param {fuction} callback Callback function.
 * 
 */
NND.query = function(sql, args){
	return  new Promise(function (resolve,reject) {
		_pool.acquire().then(function(client) {

			client.query(sql, args, function(err, res) {
				_pool.release(client);
				if (!!err) {
					reject(err.message)
					return;
				}
				resolve(res)
			});
	  })
	  .catch(function(err) {
		if (!!err) {
				reject(err.stack)
				//console.error('[sqlqueryErr] '+stack);
				return;
		}
	  });
	})
	
};
NND.findOne = function(sql, args){
	return  new Promise(function (resolve,reject) {
		_pool.acquire().then(function(client) {

			client.query(sql, args, function(err, res) {
				_pool.release(client);
				if (!!err) {
					reject(err.message)
					return;
				}
				if(res||res.length>0){
					resolve(res[0])
				}else{
					resolve(null)
				}
				
			});
	  })
	  .catch(function(err) {
		if (!!err) {
				reject(err.stack)
				//console.error('[sqlqueryErr] '+stack);
				return;
		}
	  });
	})
	
};


/**
 * Close connection pool.
 */
NND.shutdown = function(){
	_pool.destroyAllNow();
};

/**
 * init database
 */
sqlclient.init = function() {
	if (!!_pool){
		return sqlclient;
	} else {
		NND.init();
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		//sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
		sqlclient.findOne = NND.findOne;
    return sqlclient;
	}
};

/**
 * shutdown database
 */
sqlclient.shutdown = function() {
	NND.shutdown();
};






