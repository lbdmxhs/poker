var Code = require('../../../../../shared/code');
var configDao = require('../../../dao/configDao');
var allianceDao = require('../../../dao/allianceDao');
var clubUserDao = require('../../../dao/clubUserDao');
var allianceclubDao = require('../../../dao/allianceclubDao');
var userDao = require('../../../dao/userDao');
var roomDao = require('../../../dao/roomDao');
var clubDao = require('../../../dao/clubDao');
var async =  require('async');
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

//查询俱乐部联盟
Handler.prototype.queryAllianceByclub = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceclubDao.findListByClubId(clubid,cb);
        }
    ],function(err,list){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK,data:{list:list}}); 
    });   
}


//查询是否可以创建联盟（俱乐部创建人，并且都未创建联盟或者加入联盟才可以创建）

Handler.prototype.isCreationAlliance = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    allianceDao.isCreationAlliance(userid,clubid,function(err,isCreationAlliance){
        next(null,{code: Code.OK,data:{isCreationAlliance:isCreationAlliance}}); 
    });
}

//查询创建俱乐部参数
Handler.prototype.queryCreationAllianceConfig = function(msg, session, next){
   
    var allianceMaxClubNumber,addAllianceJewel;
    async.waterfall([
        function(cb){
            configDao.getConfigByKey("allianceMaxClubNumber",cb);
        },
        function(configInfo,cb){
            allianceMaxClubNumber = configInfo.value;
            configDao.getConfigByKey("addAllianceJewel",cb);
        }
    ],function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        addAllianceJewel = configInfo.value;
        next(null, {code: Code.OK,data:{allianceMaxClubNumber:allianceMaxClubNumber,addAllianceJewel:addAllianceJewel}}); 
    });
}
//查询增加俱乐部上限数量以及消耗钻石
Handler.prototype.queryAddAllianceMaxClubAllianceConfig = function(msg, session, next){
   
    var addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel;
    async.waterfall([
        function(cb){
            configDao.getConfigByKey("addAllianceMaxClubNumber",cb);
        },
        function(configInfo,cb){
            addAllianceMaxClubNumber = configInfo.value;
            configDao.getConfigByKey("addAllianceMaxClubNumberJewel",cb);
        }
    ],function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        addAllianceMaxClubNumberJewel = configInfo.value;
        next(null, {code: Code.OK,data:{addAllianceMaxClubNumber:addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel:addAllianceMaxClubNumberJewel}}); 
    });
}

//创建俱乐部
Handler.prototype.creationAlliance = function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var headPortraitUrl  =  msg.headPortraitUrl;
    var name  =  msg.name;
    if(!clubid||!userid||!name){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    var allianceMaxClubNumber,addAllianceJewel,defCommissionercentage,defCommissiontype;
    async.waterfall([
        function(cb){
            allianceDao.isCreationAlliance(userid,clubid,cb);
        },
        function(isCreationAlliance,cb){
            if(!isCreationAlliance){
                next(null, {code: Code.FAIL,msg:"不可以创建联盟"}); 
                return; 
            }
            
            configDao.getConfigByKey("allianceMaxClubNumber",cb);
        },
        function(configInfo,cb){
            allianceMaxClubNumber = configInfo.value;
            configDao.getConfigByKey("addAllianceJewel",cb);
        },
        function(configInfo,cb){
            addAllianceJewel = configInfo.value;
            configDao.getConfigByKey("defCommissionercentage",cb);
        },
        function(configInfo,cb){
            defCommissionercentage = configInfo.value;
            configDao.getConfigByKey("defCommissiontype",cb);
        },
        function(configInfo,cb){
            defCommissiontype = configInfo.value;
            userDao.getUserById(userid,cb);
        },
        function(userinfo,cb){
            if(!userinfo||!userinfo.id){
                cb("保存失败！");
                return;
            }
            var userJewelNumber = Number(userinfo.jewelNumber);
            if(userJewelNumber<addAllianceJewel){
                cb("钻石不足！");
                return;
            }
            var currentDate = new Date();
            var alliance = {
                name:name,
                maxClubNumber:allianceMaxClubNumber,
                headPortraitUrl:headPortraitUrl?headPortraitUrl:"/image/club/defaultClub.png",
                creatorUserId:userid,
                creationTime:currentDate,
                creatorClubId:clubid,
                commissionercentage:defCommissionercentage,
                commissiontype:defCommissiontype
            };
            allianceDao.creationAlliance(alliance,addAllianceJewel,cb);
        }
    ],
    function(err){
        if(err) {
			next(null, {code: Code.FAIL,msg:err});
			return;
		}
		next(null, {code: Code.OK});
    });

}

//查询俱乐部创建的联盟
Handler.prototype.queryClubCreationAlliance = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var allianceinfo,addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("查询失败！");
                return ;
            }
            configDao.getConfigByKey("addAllianceMaxClubNumber",cb);
        },
        function(configInfo,cb){
            addAllianceMaxClubNumber = configInfo.value;
            configDao.getConfigByKey("addAllianceMaxClubNumberJewel",cb);
        }
    ],function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        addAllianceMaxClubNumberJewel = configInfo.value;
        next(null, {code: Code.OK,data:{alliance:allianceinfo,addAllianceMaxClubNumber:addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel:addAllianceMaxClubNumberJewel}}); 
    }); 
}

Handler.prototype.addAllianceMaxClubNumber = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var allianceinfo,addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL}); 
        return; 
    }

    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("查询失败！");
                return ;
            }
            configDao.getConfigByKey("addAllianceMaxClubNumber",cb);
        },
        function(configInfo,cb){
            addAllianceMaxClubNumber = configInfo.value;
            configDao.getConfigByKey("addAllianceMaxClubNumberJewel",cb);
        },
        function(configInfo,cb){
            addAllianceMaxClubNumberJewel = configInfo.value;
            allianceDao.addAllianceMaxClubNumber(allianceinfo.id,userid,addAllianceMaxClubNumber,addAllianceMaxClubNumberJewel,cb)
        }
    ],function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
      
        next(null, {code: Code.OK}); 
    }); 
}

//查询修改联盟需要的钻石数
Handler.prototype.queryUpdateAllianceJewel = function(msg, session, next){
   
    configDao.getConfigByKey("updateAllianceNameJewel",function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        next(null, {code: Code.OK,data:{value:configInfo.value}}); 
    });
}


Handler.prototype.updateAllianceName= function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var name = msg.name;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"保存失败"}); 
        return; 
    }
    if(!name){
        next(null, {code: Code.FAIL,msg:"修改名称不能空！"}); 
        return; 
    }
    var addAllianceJewel;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("保存失败！");
                return ;
            }
            if(name == allianceinfo.name){
                cb("名称相同！");
                return ;
            }
            configDao.getConfigByKey("updateAllianceNameJewel",cb);
        },
        function(configInfo,cb){
            addAllianceJewel = configInfo.value;
            allianceDao.updateAllianceName(allianceinfo.id,userid,name,addAllianceJewel,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
      
        next(null, {code: Code.OK}); 
    }); 
}

//修改简介
Handler.prototype.updateSynopsis = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var synopsis = msg.synopsis;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"保存失败"}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("保存失败！");
                return ;
            }
            allianceDao.updateSynopsis (allianceinfo.id,synopsis,cb)
        },

    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
      
        next(null, {code: Code.OK}); 
    }); 
}

//退出联盟
Handler.prototype.quitAlliance = function(msg, session, next){
     //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var allianceid =  msg.allianceid;
    if(!clubid||!userid||!allianceid){
        next(null, {code: Code.FAIL,msg:"参数错误"}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryById(allianceid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            if(allianceinfo.creatorClubId == clubid){
                cb("创建俱乐部不能退出联盟！");
                return ;
            }
            allianceclubDao.deleteByAllianceIdAndClubId(allianceid,clubid,cb);
        },

    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
      
        next(null, {code: Code.OK}); 
    }); 
}

//解散联盟
Handler.prototype.dissolveAlliance = function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误"}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceDao.dissolveAlliance(allianceinfo.id,clubid,userid,cb);
        }

    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
      
        next(null, {code: Code.OK}); 
    }); 
}


//查询联盟下所有俱乐部
Handler.prototype.queryListByAllianceId = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);

        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.findListByAllianceId(allianceinfo.id,cb);
        }
    ],function(err,list){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK,data:{list:list}}); 
    });   
}

//邀请俱乐部
Handler.prototype.inviteClub = function(msg, session, next){
    var clubid = msg.clubid;
    var inviteClubid =  msg.inviteClubid;
    var userid = session.get("rid");
    if(!clubid||!userid||!inviteClubid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.joinAlliance(inviteClubid,allianceinfo.id,userid,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    }); 
}
//增加额度上限
Handler.prototype.increaseQuota = function(msg, session, next){
    var clubid = msg.clubid;
    var selectClubid = msg.selectClubid
    var increaseQuota =  msg.increaseQuota;
    increaseQuota = Math.abs(Math.floor(Number(increaseQuota)));
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(!increaseQuota){
        next(null, {code: Code.FAIL,msg:"请输入正确金额！"}); 
        return;  
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.increaseMaxquota(allianceinfo.id,selectClubid,increaseQuota,cb)
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });  
}

//重置额度
Handler.prototype.recoverQuotaInit = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var selectClubid = msg.selectClubid
    if(!clubid||!userid||!selectClubid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);

        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.recoverQuotaInit(allianceinfo.id,selectClubid,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });   
}


//修改最大额度
Handler.prototype.updateMaxQuota = function(msg, session, next){
    var clubid = msg.clubid;
    var selectClubid = msg.selectClubid
    var quota =  msg.quota;
    quota = Math.abs(Math.floor(Number(quota)));
    var userid = session.get("rid");
    if(!clubid||!userid||!selectClubid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(!quota){
        next(null, {code: Code.FAIL,msg:"请输入正确金额！"}); 
        return;  
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.updateMaxquota (allianceinfo.id,selectClubid,quota,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });  
}

//修改默认额度
Handler.prototype.updateDefaultQuota = function(msg, session, next){
    var clubid = msg.clubid;
    var selectClubid = msg.selectClubid
    var quota =  msg.quota;
    quota = Math.abs(Math.floor(Number(quota)));
    var userid = session.get("rid");
    if(!clubid||!userid||!selectClubid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(!quota){
        next(null, {code: Code.FAIL,msg:"请输入正确金额！"}); 
        return;  
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.updateDefaultmaxquota (allianceinfo.id,selectClubid,quota,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });  
}

//踢出联盟
Handler.prototype.kickOutAlliance = function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var selectClubid = msg.selectClubid
    var userid = session.get("rid");
    if(!clubid||!userid||!selectClubid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(clubid==selectClubid){
        next(null, {code: Code.FAIL,msg:"不能踢出联盟！"}); 
        return;
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            allianceclubDao.deleteByAllianceIdAndClubId(allianceinfo.id,selectClubid,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });  
}

//修改抽成
Handler.prototype.updateCommissioner = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var commissionercentage  =  msg.commissionercentage;
    var commissiontype = msg.commissiontype;
    commissionercentage = Math.abs(Math.floor(Number(commissionercentage)));
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }

    if(!commissionercentage&&commissionercentage!=0){
        next(null, {code: Code.FAIL,msg:"请输入正确比例！"}); 
        return;  
    }
    if(commissiontype!="1"){
        commissiontype = "2";
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");id
                return ;
            }
           //修改抽成
            allianceDao.updateCommissioner(allianceinfo.id,commissionercentage,commissiontype,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });  
}

//查询创建牌局配置
Handler.prototype.queryCreationRoomConfig = function(msg, session, next){
    var userid = session.get("rid");
    if(!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    var creationRoomJewel,userJewel;
    async.waterfall([
        function(cb){
            configDao.getConfigByKey("creationRoomJewel",cb);
        },
        function(configInfo,cb){
            creationRoomJewel = configInfo.value;
            // configDao.getConfigByKey("addAllianceJewel",cb);
            userDao.getUserById(userid,cb);
        }
    ],function(err,userInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        userJewel = userInfo.jewelNumber;
        next(null, {code: Code.OK,data:{creationRoomJewel:creationRoomJewel,userJewel:userJewel}}); 
    });
}

//联盟创建房间
Handler.prototype.creationRoom = function(msg, session, next){
    var userid = session.get("rid");
    var clubid = msg.clubid;
    var room = msg.room;
    if(!userid||!clubid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(room.type!="1"&&room.type!="2"&&room.type!="3"){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }

    if(room.type=="1"){
        if(!room.smallBlinds||!room.bigBlinds){
            next(null, {code: Code.FAIL,msg:"参数错误！"}); 
            return;  
        }
    }

    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            if(!allianceinfo){
                cb("操作失败！");
                return ;
            }
            room.allianceId = allianceinfo.id;
            room.creatorUserId = userid;
            room.creationTime =  new Date();
            configDao.getConfigByKey("creationRoomJewel",cb);
        },
        function(configInfo,cb){
            roomDao.creationRoom (room,userid,configInfo.value,session,cb);   
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    });  
}

//用户查询俱乐部房间
Handler.prototype.queryRoomByUser = function(msg, session, next){
    var userid = session.get("rid");
    var clubid = msg.clubid;
    if(!clubid&&!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"});   
        return; 
    }
    var roomList = [];
    var self = this;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            roomDao.queryRoomByClubId(clubid,cb);
        },
        function(list,cb){
            roomList = list;
            var roomIdList = getRoomIdList(list);
            if(!roomIdList||roomIdList.length<=0){
                cb(); 
            }else{
                self.app.get('redisClient').mget(roomIdList, cb);
            }
 
        }
    ],function(err,peopleNumberList){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK,data:{list:roomList,peopleNumberList:peopleNumberList}}); 
    });
}

//查询联盟房间

Handler.prototype.queryRoomByalliance = function(msg, session, next){
    var userid = session.get("rid");
    var clubid = msg.clubid;
    if(!clubid&&!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"});   
        return; 
    }
    var roomList = [];
    var self = this;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            allianceDao.queryByClubId(clubid,cb);
        },
        function(alliance,cb){
            allianceinfo = alliance;
            roomDao.queryRoomByallianceId(allianceinfo.id,cb);
        },
        function(list,cb){
            roomList = list;
            var roomIdList = getRoomIdList(list);
            if(!roomIdList||roomIdList.length<=0){
                cb(); 
            }else{
                self.app.get('redisClient').mget(roomIdList, cb);
            }
 
        }
    ],function(err,peopleNumberList){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK,data:{list:roomList,peopleNumberList:peopleNumberList}}); 
    });
}

var getRoomIdList = function(list){
    if(!list||list.length<=0){
        return [];
    }
    var roomIdArr = [];
    list.forEach(function(item){
        roomIdArr.push("peopleNumber_"+item.id);
    });
    return roomIdArr;
}


