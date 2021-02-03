var mysql = require('./mysql/mysql');
var IdsUtil = require('../../../shared/IdsUtil');
var userDao = module.exports;

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
userDao.getUserByPhoneNumber = async function (phoneNumber){
  var sql = 'select * from  user where phoneNumber = ?';
  var args = [phoneNumber];
  var user = await mysql.findOne(sql,args).catch(function (err) {
    user = null;
    //console.error(err.message);
    return Promise.reject(err);
  });
  return Promise.resolve(user);
};
userDao.getUserById = async function (id){
  var sql = 'select * from  user where id = ?';
  var args = [id];
  var user = await mysql.findOne(sql,args).catch(function (err) {
    user = null;
    //console.error(err.message);
    return Promise.reject(err);
  });
  return Promise.resolve(user);
};

userDao.getUserByAccount = async function (account){
  var sql = 'select * from  user where account = ?';
  var args = [account];
  var user = await mysql.findOne(sql,args).catch(function (err) {
    user = null;
    //console.error(err.message);
    return Promise.reject(err);
  });
  return Promise.resolve(user);
};

userDao.updateUserPasswordByid = async function(id,password,ip){
  var sql = 'UPDATE `user` SET  password = ? ,loginIp = ? ,updateTime = ? WHERE id =?';
  var updateTime = new Date();
  var args = [password,ip,updateTime,id];
  var updateObj = await mysql.update(sql, args).catch(function (err) {
    updateObj = null;
    return Promise.reject(err);
  });
  if(updateObj.affectedRows<1){
    return Promise.reject("保存失败！");
  }
  return Promise.resolve(id);
} 

userDao.updateUserTokenByid = async function(id,Token,ip){
  var sql = 'UPDATE `user` SET  token = ? ,loginIp = ? ,loginTime = ?,updateTime = ? WHERE id =?';
  var loginTime = new Date();
  var args = [Token,ip,loginTime,loginTime,id];
  var updateObj = await mysql.update(sql, args).catch(function (err) {
    updateObj = null;
    return Promise.reject(err);
  });
  if(updateObj.affectedRows<1){
    return Promise.reject("保存失败！");
  }
  return Promise.resolve(id);
} 
/**
 * Create a new user
 * @param (String) phoneNumber
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = async function (phoneNumber, password, loginIp){
   
    var sql = 'INSERT INTO user (id, name, account, password, phoneNumber,sex, accountType, creationTime, loginIp, accountStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var id = await IdsUtil.getID("userids");
    var loginTime = new Date();
    var args = [id,"用户"+id,phoneNumber, password, phoneNumber, "1", "1",loginTime,loginIp,"1"];
    var insertObj = await mysql.insert(sql, args).catch(function (err) {
      insertObj = null;

      return Promise.reject(err);
    });
    if(insertObj.affectedRows<1){
      return Promise.reject("保存失败！");
    }
    return Promise.resolve(id);
};



