var async = require('async');
var tokenService = require('../../../../../shared/token');
var Code = require('../../../../../shared/code');
var userDao = require('../../../dao/userDao');
var clubDao = require('../../../dao/clubDao');
var allianceDao = require('../../../dao/allianceDao');
module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

/**
 * New client entry.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
	var token = msg.token, self = this;

	if(!token) {
		next(null, {code: Code.FAIL});
		return;
  }
  var uid,userinfo,userClubIdArr,userAllianceIdArr;
  async.waterfall([
    function(cb){
      self.app.rpc.auth.authRemote.auth(session, token, cb);
    },
    function(code,user,newtoken,cb){
      if(code !== Code.OK) {
				next(null, {code: code});
				return;
			}

			if(!user) {
				next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
				return;
      }
      uid = user.id;
      userinfo = user;
      token = newtoken;
      cb();
    },
    function(cb){
      self.app.get('sessionService').kick(uid, cb);
    },
    function(cb){
      session.bind(uid, cb);

    },
    function(cb){
      clubDao.getUserClubByUserId(uid,cb);
    },
    function(list,cb){
      userClubIdArr = [];
      list.forEach(function(item,index){
        self.app.get('globalChannelService').add("clubUser_"+item.id, uid, self.app.get('serverId'), function(err) {
        });
        userClubIdArr.push(item.id); 
      });
      allianceDao.findListByUserId(uid,cb);
    },
    function(list,cb){
      userAllianceIdArr = [];
      list.forEach(function(item,index){
          self.app.get('globalChannelService').add("allianceUser_"+item.allianceId, uid, self.app.get('serverId'), function(err) {
          });
          userAllianceIdArr.push(item.allianceId); 
      });
      session.set('serverId', self.app.get('serverId'));
      session.set('userAllianceIdArr', userAllianceIdArr);
      session.set('userClubIdArr', userClubIdArr);
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
      // console.log(list);
      //todo 存放session信息
      session.set('rid', uid);

      session.on('closed', onUserLeave.bind(null, self.app));
			session.pushAll(cb);
    },function(cb){
      //dodo channel消息频道的创建
      // console.log("-------------------"+self.app.get('serverId'));
      self.app.get('globalChannelService').add("allUser", uid, self.app.get('serverId'), function(err) {
      });
      cb();
    },function(cb){
      userDao.updateUserTokenByid(uid,token,cb);
    }
  ], function(err) {
		if(err) {
			next(err, {code: Code.FAIL});
			return;
    }
    // id:"1111",
    // name:"大富翁",
    // txUrl:"",
    // isCreatClub:"0",//是否已经创建俱乐部
    // isAlliance:"0",//是否已经加入联盟或者创建联盟
    // zss:"99999",//钻石数
    var txUrl = "";
    if(!userinfo.headPortraitUrl){
      txUrl = "/image/user/defaultUser.jpg";
    }
    var data = {
      id:userinfo.id,
      name:userinfo.id,
      txUrl:txUrl,
      isCreatClub:userinfo.isCreatClub,//是否已经创建俱乐部
      isAlliance:"0",//todo//是否已经加入联盟或者创建联盟
      zss:userinfo.jewelNumber
    };
		next(null, {code: Code.OK,data:{token:token,user:data}});
	})
};
var onUserLeave = function (app, session, reason) {
	if(!session || !session.uid) {
		return;
  }
  var self = this;
  // console.log(session);
  var userAllianceIdArr = session.get("userAllianceIdArr");
  var userClubIdArr = session.get("userClubIdArr");
  // console.log(userAllianceIdArr);
  userClubIdArr.forEach(function(id,index){
    app.get('globalChannelService').leave("clubUser_"+id, session.uid,  session.set('serverId'), function(err) {});
  });
  userAllianceIdArr.forEach(function(id,index){
    app.get('globalChannelService').leave("allianceUser_"+id, session.uid,  session.set('serverId'), function(err) {});
  });
  //房间

  app.get('redisClient').smembers('userRoom_'+session.uid, function(err,data) {
      if(data&&data.length>0){
     
        data.forEach(function(id){
            app.get('redisClient').get("roomServers_"+id,function (err,serverId) {
            app.get('globalChannelService').leave("roomuser_"+id, session.uid, serverId, function(err) {});	
          })

        });
      }
  })
  
	//utils.myPrint('1 ~ OnUserLeave is running ...');
	// app.rpc.area.playerRemote.playerLeave(session, {playerId: session.get('playerId'), instanceId: session.get('instanceId')}, function(err){
	// 	if(!!err){
	// 		logger.error('user leave error! %j', err);
	// 	}
	// });
  //	app.rpc.chat.chatRemote.kick(session, session.uid, null);
};

/**
 * Publish route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
// Handler.prototype.publish = function(msg, session, next) {
// 	var result = {
// 		topic: 'publish',
// 		payload: JSON.stringify({code: 200, msg: 'publish message is ok.'})
// 	};
//   next(null, result);
// };

/**
 * Subscribe route for mqtt connector.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
// Handler.prototype.subscribe = function(msg, session, next) {
// 	var result = {
// 		topic: 'subscribe',
// 		payload: JSON.stringify({code: 200, msg: 'subscribe message is ok.'})
// 	};
//   next(null, result);
// };
