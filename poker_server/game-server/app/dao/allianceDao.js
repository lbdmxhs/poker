var pomelo = require('pomelo');
var async = require('async');
var userDao= require('./userDao');
var tradingRecordDao= require('./tradingRecordDao');
var allianceclubDao =  require('./allianceclubDao');
var allianceDao = module.exports;

allianceDao.saveAllianceClient = function(alliance,client,cb){
	pomelo.app.get('dbclient').insertTableByClientRet(alliance,"alliance",client,cb);
}

allianceDao.saveAlliance = function(alliance,cb){
	pomelo.app.get('dbclient').insertTable(alliance,"alliance",cb);
}
//查询是否可以创建联盟（俱乐部创建人，并且都未创建联盟或者加入联盟才可以创建）
allianceDao.isCreationAlliance = function(userId,clubId,cb){
    async.waterfall([
        function(cb){
            pomelo.app.get('dbclient').findOneBySql("SELECT * FROM club WHERE `status` = '1' AND id = ? AND creatorUserId = ?",[clubId,userId],cb);
        },
        function(club,cb){
            if(!club||!club.id){
                cb("不是俱乐部创建人");
                return ;
            }
            pomelo.app.get('dbclient').findOneBySql("SELECT * FROM alliance WHERE creatorClubId = ? AND status = 1",[clubId],cb); 
        },
        function(alliance,cb){
            if(alliance&&alliance.id){
                cb("已经创建过俱乐部！");
                return ;
            }
            pomelo.app.get('dbclient').findOneBySql("SELECT * FROM alliance WHERE creatorUserId = '' AND status = 1",[userId],cb); 
        },
        function(alliance,cb){
            if(alliance&&alliance.id){
                cb("已经创建过俱乐部！");
                return ;
            }

           pomelo.app.get('dbclient').findListBySql("SELECT ac.id FROM  allianceclub as ac LEFT JOIN alliance as a ON ac.allianceId = a.id  WHERE clubId = ? AND status = 1",[clubId],cb); 
        },
        function(allianceclubList,cb){
            if(allianceclubList&&allianceclubList.length>0){
                cb("已经加入俱乐部！");
                return ;
            }
            cb();
        }
    ],
    function(err){
        if(err){
            console.log(err);
            cb(null,false);
            return ;  
        }
        cb(null,true); 
    });
    
	
}
//创建联盟
allianceDao.creationAlliance = function(allianceinfo,addAllianceJewel,cb){
	var self = this;
    var currentDate = new Date();
    var allianceid;
	pomelo.app.get('dbclient').Transaction(function(client){
        return [
            function(cb){
                userDao.updateJewelNumberByIdclient(allianceinfo.creatorUserId,-addAllianceJewel,client,cb);
            }, 
            function(cb){
                self.saveAllianceClient(allianceinfo,client,cb);  
            },
			function(rec,cb){
                allianceid = rec.insertId;
				userDao.findJewelNumberByByIdclient(allianceinfo.creatorUserId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:allianceinfo.creatorUserId,
					sum:-addAllianceJewel,
					creationDate:currentDate,
					type:"2",
					details:"创建联盟",
					consumeType:"12",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
            },
            function(cb){
                var allianceclub = {
                    allianceId:allianceid,
                    clubId:allianceinfo.creatorClubId,
                    creatorUserId:allianceinfo.creatorUserId,
                    creationTime:currentDate
                }
                allianceclubDao.saveAllianceclubClient(allianceclub,client,cb);
            },
            function(cb){
                pomelo.app.get('dbclient').executeSqlByclient("UPDATE club SET isCreatorAlliance = 1 WHERE id = ?",[allianceinfo.creatorClubId],client,cb); 
            }
        ];
    },cb);
}

//增加俱乐部上限数
allianceDao.addAllianceMaxClubNumber = function(allianceId,userId,addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel,cb){
    var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
        return [
            function(cb){
                userDao.updateJewelNumberByIdclient(userId,-addAllianceMaxClubNumberJewel,client,cb);
            }, 
			function(cb){
				userDao.findJewelNumberByByIdclient(userId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:allianceId,
					sum:-addAllianceMaxClubNumberJewel,
					creationDate:currentDate,
					type:"2",
					details:"添加联盟俱乐部上限(id:"+allianceId +" "+addAllianceMaxClubNumber+")",
					consumeType:"13",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
            },
            function(cb){
                pomelo.app.get('dbclient').executeSqlByclient("UPDATE alliance SET maxClubNumber = maxClubNumber+? WHERE id = ?",[addAllianceMaxClubNumber,allianceId],client,cb); 
			}
        ];
    },cb);
}

//修改简介 
allianceDao.updateSynopsis = function(allianceId,synopsis,cb){
	var sql = 'UPDATE alliance SET synopsis = ? WHERE id = ?';
	var args = [synopsis,allianceId];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);
}

//修改抽成
allianceDao.updateCommissioner = function(allianceId,commissionercentage,commissiontype,cb){
    var sql = 'UPDATE alliance SET commissionercentage = ? , commissiontype = ? WHERE id = ?';
	var args = [commissionercentage,commissiontype,allianceId];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);   
}

//修改联盟名称
allianceDao.updateAllianceName = function(allianceId,userId,name,updateAllianceNameJewel,cb){
    var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
        return [
            function(cb){
                userDao.updateJewelNumberByIdclient(userId,-updateAllianceNameJewel,client,cb);
            }, 
			function(cb){
				userDao.findJewelNumberByByIdclient(userId,client,cb);
			},
			function(jewelNumber,cb){
				var tradingRecord = {
					userId:userId,
					sum:-updateAllianceNameJewel,
					creationDate:currentDate,
					type:"2",
					details:"修改联盟信息",
					consumeType:"14",
					balance:jewelNumber
				}
				tradingRecordDao.saveTradingRecord(tradingRecord,client,cb);
            },
            function(cb){
                pomelo.app.get('dbclient').executeSqlByclient("UPDATE alliance SET name = ? WHERE id = ?",[name,allianceId],client,cb); 
			}
        ];
    },cb);
}

//根据创建的俱乐部ID查询联盟信息
allianceDao.queryByClubId = function(clubId,cb){
    var sql = 'SELECT * FROM alliance WHERE creatorClubId = ?';
	var args = [clubId];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);   
}


allianceDao.queryById = function(id,cb){
    var sql = 'SELECT * FROM alliance WHERE id = ?';
	var args = [id];
	pomelo.app.get('dbclient').findOneBySql(sql,args,cb);   
}

//解散联盟
allianceDao.dissolveAlliance = function(id,clubId,userId,cb){
    
    var self = this;
	var currentDate = new Date();
	pomelo.app.get('dbclient').Transaction(function(client){
        return [
            function(cb){
                var args = [userId,currentDate,id];
                pomelo.app.get('dbclient').executeSqlByclient("UPDATE alliance SET `status` = 0,updateUserId = ?,updateTime = ? WHERE id=?",args,client,cb); 
            }, 
            function(cb){
                pomelo.app.get('dbclient').executeSqlByclient("UPDATE club SET isCreatorAlliance = 0 WHERE id = ?",[clubId],client,cb); 
			}
        ];
    },cb);
}

//查询用户所有联盟
allianceDao.findListByUserId = function(userId,cb){
    var sql = 'SELECT distinct ac.allianceId FROM allianceclub ac LEFT JOIN alliance as a ON ac.allianceId = a.id WHERE  '+
    'a.status = 1 AND ac.clubId in (SELECT cu.clubid FROM clubuser cu LEFT JOIN club c ON cu.clubid = c.id WHERE c.status = 1 AND cu.userid = ?)';
	var args = [userId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}


