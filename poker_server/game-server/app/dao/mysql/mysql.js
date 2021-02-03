// mysql CRUD
var utils = require('../../util/utils');
var async = require('async');

var sqlclient = module.exports;

var _pool;

var NND = {};

/*
 * Init sql connection pool
 * @param {Object} app The app for the server.
 */
NND.init = function(app){
	_pool = require('./dao-pool').createMysqlPool(app);
};

/**
 * Excute sql statement
 * @param {String} sql Statement The sql need to excute.
 * @param {Object} args The args for the sql.
 * @param {fuction} cb Callback function.
 * 
 */
NND.query = function(sql, args, cb){
	_pool.acquire().then(function(client) {

		client.query(sql, args, function(err, res) {
			_pool.release(client);
			cb(err, res);
		});
  })
  .catch(function(err) {
    if (!!err) {
			console.error('[sqlqueryErr] '+err.stack);
			return;
		}
  });
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
sqlclient.init = function(app) {
	if (!!_pool){
		return sqlclient;
	} else {
		NND.init(app);
		sqlclient.pool = _pool;
		sqlclient.insert = NND.query;
		sqlclient.update = NND.query;
		sqlclient.delete = NND.query;
		sqlclient.query = NND.query;
		return sqlclient;
	}
};

/**
 * shutdown database
 */
sqlclient.shutdown = function(app) {
	NND.shutdown(app);
};

sqlclient.Transaction = function(waterfallArrFun,callback){
	var pool = sqlclient.pool;
	
	pool.acquire().then(function(client) {
		client.beginTransaction();
		var waterfallArr = waterfallArrFun(client);
		if(!waterfallArr||waterfallArr.length == 0){
			client.rollback();	
			pool.release(client);
			utils.invokeCallback(callback, "保存失败");
			return ;
		}
		async.waterfall(waterfallArr,function(err){
			if(err){
				client.rollback();
			}else{
				client.commit();
			}	
			pool.release(client);
			if(err){
				console.error('[sqlqueryErr] '+(err.stack?err.stack:err));
				utils.invokeCallback(callback, "保存失败");
				return ;
			}
			utils.invokeCallback(callback, null);
		});
	}).catch(function(err) {
		if (!!err) {
				console.error('[sqlqueryErr] '+err.stack);
				utils.invokeCallback(callback, "保存失败");
				return;
			}	
	  });
}
sqlclient.insertSql = function(obj,tableName,cb){
	if(!obj){
		console.error('[sqlqueryErr] '+tableName+'对象为空');
		utils.invokeCallback(cb, "保存失败");
		return ;
	}
	var sqlFieldStr= "";
	var sqlParameterStr = "";
	var args = [];
	for (var key in obj){
		if(sqlFieldStr){
			sqlFieldStr+=",";
		}
		sqlFieldStr+=key;

		if(sqlParameterStr){
			sqlParameterStr+=",";
		}
		sqlParameterStr+="?";
		args.push(obj[key]); 
	}
	if(!sqlFieldStr|| !sqlParameterStr||args.length == 0){
		console.error('[sqlqueryErr] 参数转换失败！');
		utils.invokeCallback(cb, "保存失败");
		return ;
	}
	var sql = 'INSERT INTO '+tableName+' ('+sqlFieldStr+') VALUES ('+sqlParameterStr+')';
	cb(sql,args);
}
sqlclient.insertTableByClient = function(obj,tableName,client,cb){
	sqlclient.insertSql(obj,tableName,function(sql,args){
		sqlclient.executeSqlByclient(sql,args,client,cb);
	});
}
sqlclient.insertTableByClientRet = function(obj,tableName,client,cb){
	sqlclient.insertSql(obj,tableName,function(sql,args){
		sqlclient.executeSqlByclientRet(sql,args,client,cb);
	});
}
sqlclient.insertTable = function(obj,tableName,cb){
	sqlclient.insertSql(obj,tableName,function(sql,args){
		sqlclient.saveSql(sql,args,cb);
	});
}
sqlclient.executeSqlByclientRet = function(sql, args,client,cb){
	client.query(sql, args, function(err, res) {
		if(err){

			console.error('[sqlqueryErr] [sql:'+sql+']'+err.stack);
			utils.invokeCallback(cb, "保存失败");
			return ;
		}
		if (!!res) {
			utils.invokeCallback(cb, null,res);	
		} else {
			console.error('[sqlqueryErr] [sql:'+sql+'] 未修改任何数据');
			utils.invokeCallback(cb, "保存失败");	
		}
	});
}

sqlclient.executeSqlByclient = function(sql, args,client,cb){
	client.query(sql, args, function(err, res) {
		if(err){

			console.error('[sqlqueryErr] [sql:'+sql+']'+err.stack);
			utils.invokeCallback(cb, "保存失败");
			return ;
		}
		if (!!res && res.affectedRows>0) {
			utils.invokeCallback(cb, null);	
		} else {
			console.error('[sqlqueryErr] [sql:'+sql+'] 未修改任何数据');
			utils.invokeCallback(cb, "保存失败");	
		}
	});
}

sqlclient.findOneSqlByclient = function(sql, args,client,cb){
	client.query(sql, args, function(err, res) {
		if(err){
			console.error('[sqlqueryErr] '+err.stack);
			cb("查询失败");
			return ;
		}
		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, res[0]);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}
sqlclient.findOneSql = function(sql, args,cb){
	sqlclient.query(sql, args, function(err, res) {
		if(err){
			console.error('[sqlqueryErr] '+err.stack);
			cb("查询失败");
			return ;
		}
		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, res[0]);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}
sqlclient.saveSql = function(sql, args,cb){
	sqlclient.insert(sql, args,function(err, res){
		
		if(err){
			console.error('[sqlqueryErr] '+err.stack);
			utils.invokeCallback(cb,"保存失败", false);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				console.error('[sqlqueryErr] [sql:'+sql+'] 未保存任何数据');
				utils.invokeCallback(cb,"保存失败", false);
			}
		}
	})
}

sqlclient.updateSql =  function(sql, args,cb){
	// sqlclient.saveSql(sql, args,cb);
	sqlclient.insert(sql, args,function(err, res){
		
		if(err){
			console.error('[sqlqueryErr] '+err.stack);
			utils.invokeCallback(cb,"修改失败", false);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				console.error('[sqlqueryErr] [sql:'+sql+'] 未修改任何数据');
				utils.invokeCallback(cb,"修改失败", false);
			}
		}
	})
}

sqlclient.findListBySql = function(sql, args,cb){
	sqlclient.query(sql,args,function(err, res){
		if(err){
			console.error('[sqlqueryErr] '+err.stack);
			utils.invokeCallback(cb,"查询失败", null);
			return;
		}
		utils.invokeCallback(cb, null, res);
	});
}
sqlclient.findOneBySql = function(sql, args,cb){
	sqlclient.query(sql,args,function(err, res){
		if(err){
			console.error('[sqlqueryErr] '+err.stack);
			utils.invokeCallback(cb,"查询失败", null);
			return;
		}
		if (!!res && res.length > 0) {
			utils.invokeCallback(cb, null, res[0]);
		} else {
			utils.invokeCallback(cb, null, null);
		}
	});
}
sqlclient.countBySql = function(sql, args,cb){
	sqlclient.findOneBySql(sql, args,function(err, res){
		if(err){
			utils.invokeCallback(cb,err, null);
			return;
		}
		if(!res){
			utils.invokeCallback(cb,null, 0);
		}else{
			var count = 0;
			for (var key in res){
				count =res[key]; 
			}
			utils.invokeCallback(cb,null, count);	
		}
	});
}




