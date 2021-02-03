var Code = require('../../../../../shared/code');
var configDao = require('../../../dao/configDao');
var IdsUtil = require('../../../../../shared/IdsUtil');
var userDao = require('../../../dao/userDao');
var clubDao = require('../../../dao/clubDao');
var clubUserDao = require('../../../dao/clubUserDao');
var tradingRecordDao= require('../../../dao/tradingRecordDao');
var goldExchangeDao = require('../../../dao/goldExchangeDao');
var async = require('async');
module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

Handler.prototype.addclub = function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var name = msg.name;
    if(!name){
        next(null, {code: Code.FAIL});
        return ;
    }
    var headPortraitUrl = msg.headPortraitUrl;
    if(!headPortraitUrl){
        //todo 默认头像地址
        headPortraitUrl = "/image/club/defaultClub.png";
    }
    var userid = session.get("rid");
    if(!userid){
        next(null, {code: Code.FAIL,msg:"操作失败！"});
        return;
    }
    var clubid,userJewelNumber,expendJewelNumber;
    async.waterfall([
        function(cb){
            clubDao.findClubByName(name,cb);
        },
        function(clubinfo,cb){
            if(clubinfo){
                cb("俱乐部名称已经存在！");
                return ;
            }
            IdsUtil.getIdTwo("clubids",cb);
        },
        function(id,cb){
            if(!id){
                cb("保存失败！");
                return;
            }
            clubid = id;
            configDao.getConfigByKey("creationClubJewel",cb); 
        },
        function(configInfo,cb){
            expendJewelNumber = Number(configInfo.value);
            userDao.getUserById(userid,cb);
        },
        function(userinfo,cb){
            if(!userinfo||!userinfo.id){
                cb("保存失败！");
                return;
            }
            if(userinfo.isCreatClub=="1"){
                cb("不能重复创建！");
                return;  
            }
            userJewelNumber = Number(userinfo.jewelNumber);
            if(userJewelNumber<expendJewelNumber){
                cb("钻石不足！");
                return;
            }
            clubDao.saveTransaction(clubid,name,headPortraitUrl,userid,expendJewelNumber,cb);
        }
    ],function(err){       
        if(err) {
			next(null, {code: Code.FAIL,msg:err});
			return;
		}
		next(null, {code: Code.OK});
    });
}
//查询创建俱乐部所需钻石
Handler.prototype.creationClubJewel = function(msg, session, next){
    configDao.getConfigByKey("creationClubJewel",function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        next(null, {code: Code.OK,data:{value:configInfo.value}});  
    });

}
//查询创建添加俱乐部人数上限需要的钻石和人数
Handler.prototype.addClubMaxPeopleNumberJewel = function(msg, session, next){
   
    var jewelNumber,peopleNumber;
    async.waterfall([
        function(cb){
            configDao.getConfigByKey("addClubMaxPeopleNumberJewel",cb);
        },
        function(configInfo,cb){
            jewelNumber = configInfo.value;
            configDao.getConfigByKey("addClubMaxPeopleNumber",cb);
        }
    ],function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        peopleNumber = configInfo.value;
        next(null, {code: Code.OK,data:{jewelNumber:jewelNumber,peopleNumber:peopleNumber}}); 
    });
}

Handler.prototype.queryClubByUser = function(msg, session, next){
    var userid = session.get("rid");
    if(!userid){
        next(null, {code: Code.FAIL,msg:"查询失败！"});
        return;
    }
    var userClubList,memberNumberList;
    async.waterfall([
        function(cb){
            clubDao.getUserClubByUserId(userid,cb);
        },
        function(list,cb){
            userClubList = list;
            clubDao.getUserClubMemberNumberByUserId(userid,cb);
        },
        function(list,cb){
            memberNumberList = list;
            cb();
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        next(null, {code: Code.OK,data:{userClubList:userClubList,memberNumberList:memberNumberList}}); 
    });
}
Handler.prototype.queryClubById = function(msg, session, next){
    var clubid = msg.clubid;
    if(!clubid){
        return ;
    }
    clubDao.userSearchClubById(clubid,function(err,clubInfo){
      
        if(err) {
            next(null, {code: Code.OK,data:{}}); 
			return;
        }
       
        next(null,{code: Code.OK,data:{clubInfo:clubInfo}} ); 
    });
}

/**
 * 加入俱乐部
 * todo 消息通过 （未做）
 * @param {*} msg 
 * @param {*} session 
 * @param {*} next 
 */
Handler.prototype.saveClubUser = function(msg, session, next){
   //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubUserDao.getClubUserById(clubid,userid,cb);
        },
        function(dataList,cb){
            if(dataList&&dataList.length>0){
                cb("已加入俱乐部！");
                return;
            }
            clubDao.getClubById(clubid,cb);
        },
        function(clubInfo,cb){
            if(clubInfo.maxUser<=clubInfo.currentHeadcount){
                cb("人数已满！");
                return;
            }
            clubUserDao.save(clubid,userid,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }    
        next(null,{code: Code.OK}); 
    });
}
/**
 * 分页查询俱乐成员（包含金币）
 */

Handler.prototype.queryClubUserByClubIdPage = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var curPage = msg.curPage;
    if(!clubid&&!userid){
        next(null, {code: Code.OK}); 
        return;  
    }
    if(!curPage){
        curPage = 1;
    }
    var pageSize = 30;
    var total = 0;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.getClubUserCountByClubId(clubid,cb);
            
        },
        function(count,cb){
            if(count<=pageSize*(curPage-1)){
                cb("超出总页码");
                return ; 
            }
            total = count;
            clubUserDao.getClubAllUserGoldByClubId(clubid,curPage,pageSize,cb);
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }   
        next(null, {code: Code.OK,data:{list:list,curPage:curPage,pageSize:pageSize,total:total}}); 
    });

}

/**
 * 分页查询俱乐成员（包含钻石）
 */
Handler.prototype.queryClubUserJewelByClubIdPage = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var curPage = msg.curPage;
    if(!clubid&&!userid){
        next(null, {code: Code.OK}); 
        return;  
    }
    if(!curPage){
        curPage = 1;
    }
    var pageSize = 30;
    var total = 0;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            clubUserDao.getClubUserCountByClubId(clubid,cb);
            
        },
        function(count,cb){
            if(count<=pageSize*(curPage-1)){
                cb("超出总页码");
                return ; 
            }
            total = count;
            clubUserDao.getClubAllUserJewelByClubId(clubid,curPage,pageSize,cb);
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }   
        next(null, {code: Code.OK,data:{list:list,curPage:curPage,pageSize:pageSize,total:total}}); 
    });

}

// 查询俱乐部中的用户
Handler.prototype.queryClubUser = function(msg, session, next){
    var clubid = msg.clubid;
    var queryuserid = msg.userid;
    var userid = session.get("rid");
    if(!clubid&&!userid&&!queryuserid){
        next(null, {code: Code.OK}); 
        return;  
    }
    async.waterfall([
        function(cb){
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.queryUserByClubIdAndUserId(clubid,queryuserid,cb); 
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }
        next(null, {code: Code.OK,data:{list:list}}); 
    });
}

// 查询俱乐部中的用户(钻石)
Handler.prototype.queryUserJewel = function(msg, session, next){
    var clubid = msg.clubid;
    var queryuserid = msg.userid;
    var userid = session.get("rid");
    if(!clubid&&!userid&&!queryuserid){
        next(null, {code: Code.OK}); 
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
            clubUserDao.queryUserJewelByClubIdAndUserId(clubid,queryuserid,cb); 
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }
        next(null, {code: Code.OK,data:{list:list}}); 
    });
}

/**
 * 俱乐部金币交易
 */
Handler.prototype.goldTrading = function(msg, session, next){
    var clubid = msg.clubid;
    var receiveUserId = msg.receiveUserId;
    var sum	 = msg.sum;
    sum = Math.abs(Math.floor(Number(sum)))
    var userid = session.get("rid");
    if(sum=="0"){
        next(null, {code: Code.FAIL,msg:"转账金额不能为0！"}); 
        return;     
    }
    if(!clubid||!receiveUserId||!sum||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }

    async.waterfall([
        function(cb){
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.queryUserExistByClubId(clubid,receiveUserId,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.queryUserGoldByUserid(clubid,userid,cb);
        },
        function(goldNumber,cb){
            if(goldNumber<sum){
                cb("金额不足！");
                return ; 
            }
            tradingRecordDao.saveTransaction(userid,receiveUserId,sum,clubid,cb);
        }
    ],function(err){
        if(err) {
            console.error(err);
            next(null, {code: Code.FAIL,msg:err}); 
            return 
        }
        next(null, {code: Code.OK}); 
    });
   
}
/**
 * 俱乐部钻石交易
 */
Handler.prototype.jewelTrading = function(msg, session, next){
    var clubid = msg.clubid;
    var receiveUserId = msg.receiveUserId;
    var sum	 = msg.sum;
    sum = Math.abs(Math.floor(Number(sum)))
    var userid = session.get("rid");
    if(sum=="0"){
        next(null, {code: Code.FAIL,msg:"转账金额不能为0！"}); 
        return;     
    }
    if(!clubid||!receiveUserId||!sum||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
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
            clubUserDao.queryUserExistByClubId(clubid,receiveUserId,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            // clubUserDao.queryUserGoldByUserid(clubid,userid,cb);
            userDao.findJewelNumberByById(userid,cb);
        },
        function(jewelNumber,cb){
            if(jewelNumber<sum){
                cb("钻石不足！");
                return ; 
            }
            tradingRecordDao.saveTransactionJewel(userid,receiveUserId,sum,clubid,cb);
        }
    ],function(err){
        if(err) {
            console.error(err);
            next(null, {code: Code.FAIL,msg:err}); 
            return 
        }
        next(null, {code: Code.OK}); 
    });
   
}
/**
 * 查询用户在俱乐部的金额
 */
Handler.prototype.queryGoldByUser = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    clubUserDao.queryUserGoldByUserid(clubid,userid,function(err,goldNumber){
        if(err) {
            console.error(err);
            next(null, {code: Code.FAIL}); 
            return 
        }
        next(null, {code: Code.OK,data:{goldNumber:goldNumber}}); 
    });
}

/**
 * 查询用户钻石数
 */
Handler.prototype.queryJewelByUser = function(msg, session, next){
    var userid = session.get("rid");
    if(!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    userDao.findJewelNumberByById(userid,function(err,jewelNumber){
        if(err) {
            console.error(err);
            next(null, {code: Code.FAIL}); 
            return 
        }
        next(null, {code: Code.OK,data:{jewelNumber:jewelNumber}}); 
    });
}
/**
 * 查询用户在俱乐部的交易记录
 */
Handler.prototype.queryTradingRecordByUserId  = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var curPage = msg.curPage;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }

    if(!curPage){
        curPage = 1;
    }
    var pageSize = 30;
    var total = 0;

    async.waterfall([
        function(cb){
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            tradingRecordDao.countByUserIdAndClubId(userid,clubid,cb);
            
        },
        function(count,cb){
            if(count<=pageSize*(curPage-1)){
                cb("超出总页码");
                return ; 
            }
            total = count;
            tradingRecordDao.queryTradingRecordByUserIdAndClubId(userid,clubid,curPage,pageSize,cb);
        }
    ],function(err,list){
        if(err) {
            console.error(err);
        }   
        next(null, {code: Code.OK,data:{list:list,curPage:curPage,pageSize:pageSize,total:total}}); 
    });
}
//查询俱乐部的交易记录
Handler.prototype.queryTradingRecordByClubId = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var curPage = msg.curPage;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }

    if(!curPage){
        curPage = 1;
    }
    var pageSize = 30;
    var total = 0;

    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            tradingRecordDao.countByClubId(clubid,cb);
            
        },
        function(count,cb){
            if(count<=pageSize*(curPage-1)){
                cb("超出总页码");
                return ; 
            }
            total = count;
            tradingRecordDao.queryTradingRecordByClubId(clubid,curPage,pageSize,cb);
        }
    ],function(err,list){
        if(err) {
            console.error(err);
        }   
        next(null, {code: Code.OK,data:{list:list,curPage:curPage,pageSize:pageSize,total:total}}); 
    });
}
//添加俱乐部最大人数
Handler.prototype.addCulbMaxUserNumber = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    var jewelNumber,peopleNumber;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
       
            configDao.getConfigByKey("addClubMaxPeopleNumberJewel",cb);
        },
        function(configInfo,cb){
            jewelNumber = configInfo.value;
            userDao.getUserById(userid,cb);
        },
        function(userinfo,cb){
            var userJewelNumber = Number(userinfo.jewelNumber);
            if(userJewelNumber<jewelNumber){
                cb("钻石不足！");
                return;
            }
            configDao.getConfigByKey("addClubMaxPeopleNumber",cb);
        },
        function(configInfo,cb){
            peopleNumber = configInfo.value;
            clubDao.addClubMaxUser(clubid,userid,jewelNumber,peopleNumber,cb);   
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });
}

/**
 * 查询俱乐部兑换金币列表
 */
Handler.prototype.queryCulbGoldexchangeList = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
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
       
            goldExchangeDao.queryAll(cb);
        },
    
    ],function(err,list){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        next(null, {code: Code.OK,data:{list:list}}); 
    });
}
Handler.prototype.culbGoldExchange = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var goldExchangeId = msg.goldExchangeId
    if(!clubid||!userid||!goldExchangeId){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    var goldNumber,jewelNumber;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            goldExchangeDao.queryById(goldExchangeId,cb);
        },function(goldExchangeInfo,cb){
            if(!goldExchangeInfo){
                cb("兑换失败！");
                return ;
            }
            goldNumber = goldExchangeInfo.goldNumber;
            jewelNumber = goldExchangeInfo.jewelNumber;
            userDao.getUserById(userid,cb);
        },
        function(userinfo,cb){
            var userJewelNumber = Number(userinfo.jewelNumber);
            if(userJewelNumber<jewelNumber){
                cb("钻石不足！");
                return;
            }
            goldExchangeDao.userGoldExchangeDao(userid,clubid,goldNumber,jewelNumber,cb);
        },
    
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK,data:{goldNumber:goldNumber}}); 
    });

}
/**
 * 查询俱乐部钻石兑换
 */
Handler.prototype.queryClubJewelExchange = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    clubDao.queryClubById(clubid,function(err,club){
        if(err){
            next(null, {code: Code.FAIL}); 
			return;
        }
        next(null, {code: Code.OK,data:{isJewelExchange:club.isJewelExchange,jewelExchangeRatio:club.jewelExchangeRatio}}); 
    });
}

//修改钻石兑换比例
Handler.prototype.updateJewelExchangeRatio = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var jewelExchangeRatio = msg.jewelExchangeRatio;
    jewelExchangeRatio = Math.abs(Math.floor(Number(jewelExchangeRatio)))
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(!jewelExchangeRatio){
        next(null, {code: Code.FAIL,msg:"请设置正确比例！"}); 
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
            clubDao.updateJewelExchangeRatioById(clubid,jewelExchangeRatio,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    }); 
}

//开启钻石兑换
Handler.prototype.updateIsJewelExchange = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var isJewelExchange = msg.isJewelExchange;
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
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
            if(isJewelExchange!="1"){
                isJewelExchange = "0";
            }
            clubDao.updateIsJewelExchangeById(clubid,isJewelExchange,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
            return;
        }
        next(null, {code: Code.OK}); 
    }); 
}

/**
 * 分页查询俱乐成员（登录时间）
 */
Handler.prototype.queryClubUserDteByClubIdPage = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var curPage = msg.curPage;
    if(!clubid&&!userid){
        next(null, {code: Code.OK}); 
        return;  
    }
    if(!curPage){
        curPage = 1;
    }
    var pageSize = 30;
    var total = 0;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            clubUserDao.getClubUserCountByClubId(clubid,cb);
            
        },
        function(count,cb){
            if(count<=pageSize*(curPage-1)){
                cb("超出总页码");
                return ; 
            }
            total = count;
            clubUserDao.getClubAllUserDateByClubId(clubid,curPage,pageSize,cb);
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }   
        next(null, {code: Code.OK,data:{list:list,curPage:curPage,pageSize:pageSize,total:total}}); 
    });

}
// 查询俱乐部中的用户(登录时间)
Handler.prototype.queryUserDate = function(msg, session, next){
    var clubid = msg.clubid;
    var queryuserid = msg.userid;
    var userid = session.get("rid");
    if(!clubid&&!userid&&!queryuserid){
        next(null, {code: Code.OK}); 
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
            clubUserDao.queryUserDateByClubIdAndUserId(clubid,queryuserid,cb); 
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }
        next(null, {code: Code.OK,data:{list:list}}); 
    });
}


/**
 * 俱乐部金币交易
 */
Handler.prototype.jewelExchange = function(msg, session, next){
    var clubid = msg.clubid;
    var sum	 = msg.sum;
    sum = Math.abs(Math.floor(Number(sum)))
    var userid = session.get("rid");
    if(sum=="0"){
        next(null, {code: Code.FAIL,msg:"兑换数量不能为0！"}); 
        return;     
    }
    if(!clubid||!sum||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    var jewelExchangeNumber = 0;
    var receiveUserId = "";
    async.waterfall([
        function(cb){
            clubDao.queryClubById(clubid,cb);
        },
        function(obj,cb){
            // {isJewelExchange:club.isJewelExchange,jewelExchangeRatio:club.jewelExchangeRatio}
            if(obj.isJewelExchange!="1"){
                cb("未开启钻石兑换");
                return ; 
            }
            if(!obj.jewelExchangeRatio){
                cb("俱乐部未设置兑换比例");
                return ; 
            }
            jewelExchangeNumber = obj.jewelExchangeRatio*sum;
            receiveUserId = obj.creatorUserId;
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.queryUserExistByClubId(clubid,receiveUserId,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.queryUserGoldByUserid(clubid,userid,cb);
        },
        function(goldNumber,cb){
            if(goldNumber<sum){
                cb("金额不足！");
                return ; 
            }
            userDao.findJewelNumberByById(receiveUserId,cb);
        },
        function(jewelNumber,cb){
            if(jewelNumber<jewelExchangeNumber){
                cb("钻石不足！");
                return ; 
            } 
            tradingRecordDao.saveTransactionJewelExchange(userid,receiveUserId,jewelExchangeNumber,sum,clubid,cb);
        }
    ],function(err){
        if(err) {
            console.error(err);
            next(null, {code: Code.FAIL,msg:err}); 
            return 
        }
        next(null, {code: Code.OK}); 
    });
   
}   

//修改俱乐部名称需要的钻石
Handler.prototype.queryUpdateClubNameJewel = function(msg, session, next){
   
    async.waterfall([
        function(cb){
            configDao.getConfigByKey("updateClubNameJewel",cb);
        }
    ],function(err,configInfo){
        if(err) {
            next(null, {code: Code.FAIL}); 
			return;
        }
        var updateClubNameJewel = configInfo.value;
        next(null, {code: Code.OK,data:{value:updateClubNameJewel}}); 
    });
}
Handler.prototype.updateClubInfo = function(msg, session, next){
    var clubid = msg.clubid;
    var clubName = msg.clubName;
    var userid = session.get("rid");
    if(!clubid||!clubName||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    var expendJewelNumber;
    async.waterfall([
        function(cb){
            clubDao.findClubByName(clubName,cb);
        },
        function(clubinfo,cb){
            if(clubinfo){
                cb("俱乐部名称已经存在！");
                return ;
            }
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            configDao.getConfigByKey("updateClubNameJewel",cb); 
        },
        function(configInfo,cb){
            expendJewelNumber = Number(configInfo.value);
            userDao.getUserById(userid,cb);
        },
        function(userinfo,cb){
            if(!userinfo||!userinfo.id){
                cb("保存失败！");
                return;
            }
            userJewelNumber = Number(userinfo.jewelNumber);
            if(userJewelNumber<expendJewelNumber){
                cb("钻石不足！");
                return;
            }
            clubDao.updateClubNameById (clubid,userid,clubName,expendJewelNumber,cb);
        }

    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });
}

Handler.prototype.updateSynopsis = function(msg, session, next){
    var clubid = msg.clubid;
    var synopsis = msg.synopsis;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
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

            clubDao.updateSynopsisById(clubid,synopsis, cb);
        }

    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });
}

Handler.prototype.updateIsSearch = function(msg, session, next){
    var clubid = msg.clubid;
    var isSearch = msg.isSearch;
    var userid = session.get("rid");
    if(!clubid||!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(isSearch!="1"){
        isSearch = "0";
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
            clubDao.updateIsSearchById(clubid,isSearch, cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });
}


/**
 * 查询俱乐部简易信息(俱乐部信息显示前几个成员)
 */
Handler.prototype.queryClubUserSimple = function(msg, session, next){
    var clubid = msg.clubid;
    var userid = session.get("rid");
    var curPage;
    if(!clubid&&!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return;  
    }
    if(!curPage){
        curPage = 1;
    }
    var pageSize = 8;
    var total = 0;
    async.waterfall([
        function(cb){
            clubUserDao.queryUserExistByClubId(clubid,userid,cb);
        },
        function(isExist,cb){
            if(!isExist){
                cb("用户不在俱乐部中");
                return ; 
            }
            clubUserDao.getClubUserCountByClubId(clubid,cb);
            
        },
        function(count,cb){
            if(count<=pageSize*(curPage-1)){
                cb("超出总页码");
                return ; 
            }
            total = count;
            clubUserDao.queryClubUserSimpleByClubId(clubid,curPage,pageSize,cb);
        }
    ],function(err,list){
        if(err) {
            console.error(err);
			// return;
        }   
        next(null, {code: Code.OK,data:{list:list}}); 
    });

}

//用户退出俱乐部
Handler.prototype.userQuitClub = function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid&&!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return; 
    }
    var creatorUserId;
    async.waterfall([
        function(cb){
            clubDao.queryCreationUserId(clubid,cb);
        },
        function(clubInfo,cb){
            if(!clubInfo||!clubInfo.creatorUserId){
                cb("俱乐部异常");
                return ; 
            }
            if(clubInfo.creatorUserId == userid){
                cb("创建人不能退出俱乐部！");
                return ; 
            }
            creatorUserId = clubInfo.creatorUserId;
            clubUserDao.queryUserGoldByUserid(clubid,userid,cb);
        },
        function(goldNumber,cb){
            clubUserDao.deleteByCulbIdAndUserId (clubid,creatorUserId,userid,goldNumber,cb) ;
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });
}

//管理员把用户踢出俱乐部
Handler.prototype.userKickClub =  function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var kickUserId = msg.kickUserId;
    var userid = session.get("rid");
    if(!clubid&&!kickUserId&&!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return; 
    }
    var creatorUserId,userClubAuth,kickUserClubAuth,goldNumber;
     async.waterfall([
        function(cb){
            clubUserDao.queryUserByCulbIdAndUserId(clubid,userid,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo||clubUserInfo.isClubAuth != '1'){
                cb("权限不足！");
                return ;
            }
            userClubAuth = clubUserInfo.isClubAuth;
            clubUserDao.queryUserByCulbIdAndUserId(clubid,kickUserId,cb);
        },
        function(clubUserInfo,cb){
            if(!clubUserInfo){
                cb("踢出用户不存在！");
                return ;
            }
            kickUserClubAuth = clubUserInfo.isClubAuth;
            goldNumber = clubUserInfo.goldNumber;
            clubDao.queryCreationUserId(clubid,cb);
        },
        function(clubInfo,cb){
            if(!clubInfo||!clubInfo.creatorUserId){
                cb("俱乐部异常");
                return ; 
            }
            if(clubInfo.creatorUserId == kickUserId){
                cb("创建人不能踢出俱乐部！");
                return ; 
            }
            if(clubInfo.creatorUserId != userid){
                if(Number(userClubAuth)<Number(kickUserClubAuth)){
                    cb("权限不足！");
                    return ;
                }
            }
            creatorUserId = clubInfo.creatorUserId;
            clubUserDao.deleteByCulbIdAndUserId (clubid,creatorUserId,kickUserId,goldNumber,cb) ;
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });

}

//解散俱乐部
Handler.prototype.dissolveClub  = function(msg, session, next){
      //todo 加入 退出解散俱乐部 联盟的时候清空 globalChannel 数据
    var clubid = msg.clubid;
    var userid = session.get("rid");
    if(!clubid&&!userid){
        next(null, {code: Code.FAIL,msg:"参数错误！"}); 
        return; 
    }
    async.waterfall([
        function(cb){
            clubDao.queryCreationUserId(clubid,cb);
        },
        function(clubInfo,cb){
            if(clubInfo.creatorUserId != userid){
                cb("不是创建人不能解散俱乐部！");
                return ; 
            }
            clubDao.dissolveClub(clubid,userid,cb);
        }
    ],function(err){
        if(err) {
            next(null, {code: Code.FAIL,msg:err}); 
			return;
        }
        next(null, {code: Code.OK}); 
    });
}