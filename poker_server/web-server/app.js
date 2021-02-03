var express = require('express');
var Token = require('../shared/token');
var secret = require('../shared/config/session').secret;
var iv = require('../shared/config/session').iv;
var mysql = require('./lib/dao/mysql/mysql');
var IdsUtil = require('../shared/IdsUtil');
var UnitTools = require('../shared/UnitTools');
var userDao = require('./lib/dao/userDao');
var configDao = require('./lib/dao/configDao');
var app = express.createServer();
var publicPath = __dirname +  '/public';

IdsUtil.initIdsConfig("userids");

var asyncRun = async function () {
  app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "keyboard cat" }));
    app.use(app.router);
    app.set('view engine', 'jade');
    app.set('views', publicPath);
    app.set('view options', {layout: false});
    app.set('basepath',publicPath);
  });
  app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);//需要显示设置来源
    res.header("Access-Control-Allow-Credentials", true);//若要返回cookie、携带seesion等信息则将此项设置我true
    res.header("Access-Control-Max-Age", "3600");//预检请求的间隔时间
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");//允许跨域请求携带的请求头
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");//允许跨域的请求方式
    next();
  });
  app.configure('development', function(){
    app.use(express.static(publicPath));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });
  
  app.configure('production', function(){
    var oneYear = 31557600000;
    app.use(express.static(publicPath, { maxAge: oneYear }));
    app.use(express.errorHandler());
  });
  app.get('/verificationCode', async function(req, res) {
    var msg = req.query;
    if (!msg.phoneNumber) {
      res.send({code: 500,msg:"手机号码不能为空！"});
      return;
    }
    if(!UnitTools.checkMobile(msg.phoneNumber)){
      res.send({code: 500,msg:"请填写正确手机号码！"});
      return;
    }
    var sd = UnitTools.randomCode();
    req.session.phoneNumber = msg.phoneNumber;
    req.session.phoneCode = sd;
    req.session.phoneCodeData = Date.now();
    res.send({code: 200,data:{code:sd}});
  })

  app.get('/checkVerificationCode', async function(req, res) {
    var msg = req.query;
    if (!msg.phoneNumber) {
      res.send({code: 500,msg:"手机号码不能为空！"});
      return;
    }
    if(!UnitTools.checkMobile(msg.phoneNumber)){
      res.send({code: 500,msg:"请填写正确手机号码！"});
      return;
    }
    if (!msg.phoneCode) {
      res.send({code: 500,msg:"验证码不能为空！"});
      return;
    }
    if(req.session.phoneNumber!=msg.phoneNumber||req.session.phoneCode!=msg.phoneCode){
      res.send({code: 500,msg:"验证码错误！"});
      return;
    }
    var isErr = false;
    var user = await userDao.getUserByPhoneNumber(msg.phoneNumber).catch(function (err) {
      console.error("ERROR:"+err);
      isErr = true;
      user = null;
    });
    if(isErr){
      res.send({code: 500,msg:"修改失败！"});
      return ;
    }
   
    if(!user||!user.id){
      res.send({code: 500,msg:"手机号码未注册！"});
      return;
    }

    //判断验证码超时（5分钟）
    if(!UnitTools.compareData(req.session.phoneCodeData,5*60*1000)){
      res.send({code: 500,msg:"验证码错误！"});
      return;
    }
    res.send({code: 200,data:{isCheck:true}});
  })
  app.get('/updatePassword', async function(req, res) {
    var msg = req.query;
    if (!msg.phoneNumber) {
      res.send({code: 500,msg:"手机号码不能为空！"});
      return;
    }
    if (!msg.password) {
      res.send({code: 500,msg:"密码不能为空！"});
      return;
    }
    if(!UnitTools.checkMobile(msg.phoneNumber)){
      res.send({code: 500,msg:"请填写正确手机号码！"});
      return;
    }
    if (!msg.phoneCode) {
      res.send({code: 500,msg:"验证码不能为空！"});
      return;
    }
    if(req.session.phoneNumber!=msg.phoneNumber||req.session.phoneCode!=msg.phoneCode){
      res.send({code: 500,msg:"验证码错误！"});
      return;
    }
    var isErr = false;
    var user = await userDao.getUserByPhoneNumber(msg.phoneNumber).catch(function (err) {
      console.error("ERROR:"+err);
      isErr = true;
      user = null;
    });
    if(isErr){
      res.send({code: 500,msg:"修改失败！"});
      return ;
    }
   
    if(!user||!user.id){
      res.send({code: 500,msg:"手机号码未注册！"});
      return;
    }
    //判断验证码超时（5分钟）
    if(!UnitTools.compareData(req.session.phoneCodeData,5*60*1000)){
      res.send({code: 500,msg:"验证码错误！"});
      return;
    }
    var ip = getClientIP(req);
    var userid = await userDao.updateUserPasswordByid(user.id,msg.password,ip).catch(function (err) {
      console.error("ERROR:"+err);
      userid = null;
    });
    if(!userid){
      res.send({code: 500,msg:"修改密码失败！"});
      return ;
    }
    req.session.phoneNumber = "";
    req.session.phoneCode = "";
    res.send({code: 200,data:{isUpdate:true}});
  })

  app.get('/register', async function(req, res) {

    var msg = req.query;
    if (!msg.phoneNumber || !msg.password||!msg.phoneCode) {
      res.send({code: 500,msg:"参数不能为空！"});
      return;
    }
    if(req.session.phoneNumber!=msg.phoneNumber||req.session.phoneCode!=msg.phoneCode){
      res.send({code: 500,msg:"验证码错误！"});
      return;
    }
    //判断验证码超时（5分钟）
    if(!UnitTools.compareData(req.session.phoneCodeData,5*60*1000)){
      res.send({code: 500,msg:"验证码错误！"});
      return;
    }

    var isErr = false;
    var user = await userDao.getUserByPhoneNumber(msg.phoneNumber).catch(function (err) {
      console.error("ERROR:"+err);
      isErr = true;
    });
    if(isErr){
      res.send({code: 500,msg:"注册失败！"});
      return ;
    }
   
    if(user&&user.id){
      res.send({code: 500,msg:"手机号码已注册！"});
      return;
    }
    var ip = getClientIP(req);
    var userid = await userDao.createUser(msg.phoneNumber,msg.password,ip).catch(function (err) {
      console.error("ERROR:"+err);
    });
    req.session.phoneNumber = "";
    req.session.phoneCode = "";
    if(!userid){
      res.send({code: 500,msg:"注册失败！"});
      return ;
    }
    var token = Token.create(userid, Date.now(), secret,iv);
    userid = await userDao.updateUserTokenByid(userid,token,ip).catch(function (err) {
      console.error("ERROR:"+err);
      token = "";
    });
    var gateconfig =await getGateConfig();
    res.send({code: 200, data:{token: token,userid:userid,gateconfig:gateconfig}});
  });
  
  app.get('/logintoken', async function(req, res) {
    var msg = req.query;
    if (!msg.token) {
      res.send({code: 500,msg:"请重新登录！"});
      return;
    }
    var tokenInfo = Token.parse(msg.token, secret,iv);
    if(!tokenInfo||!tokenInfo.uid){
      res.send({code: 500,msg:"请重新登录！"});
      return ;
    }
    var user = await userDao.getUserById(tokenInfo.uid).catch(function (err) {
      console.error("ERROR:"+err);
    });
    if(!user||!user.id){
      res.send({code: 500,msg:"请重新登录！"});
      return;
    }
    if(msg.token!=user.token){
      res.send({code: 500,msg:"登录失效，请重新登录！"});
      return;
    }
    if(user.accountStatus!="1"){
      res.send({code: 500,msg:"账号异常！"});
      return;
    }
    var token = Token.create(user.id, Date.now(), secret,iv);
    var ip = getClientIP(req);
    var isErr = false;
    var userid = await userDao.updateUserTokenByid(user.id,token,ip).catch(function (err) {
      console.error("ERROR:"+err);
      isErr = true;
    });
    if(isErr||!userid){
      res.send({code: 500,msg:"登录失败！"});
      return ;
    }
    var gateconfig =await getGateConfig();
    res.send({code: 200, data:{token: token,userid:userid,gateconfig:gateconfig}});
  })


  app.get('/login',async function(req, res) {
    var msg = req.query;
    if (!msg.account) {
      res.send({code: 500,msg:"账号不能为空！"});
      return;
    }
    if(!msg.password){
      res.send({code: 500,msg:"密码不能为空！"});
      return;
    }
    var isErr = false;
    var user = await userDao.getUserByAccount(msg.account).catch(function (err) {
      console.error("ERROR:"+err);
      isErr = true;
    });
    if(isErr){
      res.send({code: 500,msg:"登录失败！"});
      return ;
    }
    if (!user||!user.id||msg.password != user.password) {
      res.send({code: 500,msg:"请检查账号和密码是否正确！"});
      return;
    }
    if(user.accountStatus!="1"){
      res.send({code: 500,msg:"账号异常！"});
      return;
    }
    var token = Token.create(user.id, Date.now(), secret,iv);
    var ip = getClientIP(req);
    var userid = await userDao.updateUserTokenByid(user.id,token,ip).catch(function (err) {
      console.error("ERROR:"+err);
      isErr = true;
    });
    if(isErr||!userid){
      res.send({code: 500,msg:"登录失败！"});
      return ;
    }
    var gateconfig =await getGateConfig();
    res.send({code: 200, data:{token: token,userid:userid,gateconfig:gateconfig}});
  });
}
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress;
};
async function getGateConfig(){
  var hostObj = await configDao.getConfigByKey("gatehost").catch(function (err) {
    console.error("ERROR:"+err);
    hostObj = null;
  });
  var portObj = await configDao.getConfigByKey("gateport").catch(function (err) {
    console.error("ERROR:"+err);
    portObj = null;
  });
  if(hostObj&&portObj){
    return Promise.resolve({host:hostObj.value,port:portObj.value});
  }
  return Promise.resolve(null);
}
asyncRun();

mysql.init();

console.log("Web server has started.\nPlease log on http://127.0.0.1:3001/index.html");

app.listen(3001);
