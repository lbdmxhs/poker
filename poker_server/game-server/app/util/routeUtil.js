var dispatcher = require('./dispatcher');
var exp = module.exports;

exp.game =function(session, msg, app, cb) {
	var servers = app.getServersByType('game');

	  if(!servers || servers.length === 0) {
		  cb(new Error('can not find game servers.'));
		  return;
	  }
	  
	  var res = dispatcher.dispatch(session.get('rid'), servers);
	  cb(null, res.id);
  };

  exp.room =function(session, msg, app, cb) {
	var servers = app.getServersByType('room');

	if(!servers || servers.length === 0) {
		cb(new Error('can not find room servers.'));
		return;
	}
	var tableId = "1";
	if(msg.service == "msgRemote"){
		if(msg.args&&msg.args[0]&&msg.args[0].body){
			tableId = msg.args[0].body["roomid"];
		}
	}else{
		if(msg.args&&msg.args[0]){
			tableId = msg.args[0]["roomid"];
		}	
	}

	if(!tableId){
		tableId = "1";
	}
	var res = dispatcher.dispatchTable(tableId, servers);
	
	console.log( "room servers："+tableId+"-"+res.id);
	app.get('redisClient').set("roomServers_"+tableId,res.id, function(err,data){});
	cb(null, res.id);
  };


