/**
 * Created by litengfei on 16/6/13.
 */
var CommonConfig = require("CommonConfig");
class UnitTools{};
function UnitTools()
{

}
UnitTools.isNullOrUndefined = function(value)
{
    if(typeof  value == "undefined")return true;
    if(value == null)return true;
    return false;
}
UnitTools.isUndefined = function(value)
{
    if(typeof  value == "undefined")return true;
    return false;
}
UnitTools.isFunction = function(value)
{
    if(typeof value != "function")return false;
    return true;
}
UnitTools.isJson = function(value)
{
    if(typeof  value != "object")return false;
    return true;
}
UnitTools.isArray = function(value)
{
    if(value instanceof Array)return true;
    return false;
}



UnitTools.getJsonKeys = function(json)
{
    if(UnitTools.isJson(json)==false)
    {
        throw new Error("getJsonKeys must be json");
    }
    var names = [];
    for(var key in json)
    {
        names.push(key);
    }
    return names;
}

UnitTools.getJsonValues = function(json){
    if(UnitTools.isJson(json)==false) {
        throw new Error("getJsonvalues must be json");
    }
    var values =[];
    for(var key in json){
        values.push(json[key]);
    }
    return values;
}

UnitTools.getJsonValues = function (cb) {
    try{
        return cb()
    }catch (e){
        return null;
    }
}


UnitTools.getJsonLength = function(json){
    if(UnitTools.isJson(json)==false) {
        throw new Error("getJsonLength must be json");
    }
    var index = 0;
    for(var key in json) {
       index+=1;
    }
    return index;
}


UnitTools.getOrCreateArrayInJson = function(key,ob)
{
    if(UnitTools.isJson(ob) === false){return null};
    var value = ob[key];
    if(UnitTools.isArray(value) === false)
    {
        value = ob[key] = [];
    }
    return value;
}

UnitTools.getOrCreateJsonInJson = function(key,ob){
    if(UnitTools.isJson(ob) === false){return null};
    var value = ob[key];
    if(UnitTools.isJson(value) === false)
    {
        value = ob[key] = {};
    }
    return value;
}

UnitTools.jsonToArray = function(json,sortFunc){//json转换为array
    if(UnitTools.isJson(json) == false)return [];
    var arr = [];
    for(var key in json){
        arr.push(json[key]);
    }
    if(UnitTools.isFunction(sortFunc) == false)return arr;
    arr.sort(sortFunc);
    return arr;
}



UnitTools.hasKey = function(ob,key)
{
    if(UnitTools.isUndefined(ob[key]))return false;
    return true;
}

UnitTools.arrayHasValue = function(value,ar){
    if(!UnitTools.isArray(ar))return false;
    for(var index in ar){
        var item = ar[index];
        if(item ==value)return true;
    }
    return false;
}

UnitTools.getArrayValueIndex = function(arr,value){
    if(!UnitTools.isArray(arr))return -1;
    var findIndex = -1;
    for(var index in arr){
        var val = arr[index];
        if(value == val){
            findIndex = index;
            break;
        }
    }
    return findIndex;
}
UnitTools.remove = function(ob,key)
{
    delete ob[key];
}

UnitTools.removeArray = function(arr,removeArr){
    if(!UnitTools.isArray(arr)||!UnitTools.isArray(removeArr))return;
    UnitTools.forEach(removeArr,function(index,value){
        var findIndex = UnitTools.getArrayValueIndex(arr,value);
        if(findIndex!=-1)arr.splice(findIndex,1);
    });
}

UnitTools.attachJson = function(orgin,attch){
    if(!(UnitTools.isJson(orgin) && UnitTools.isJson(attch)))return;
    UnitTools.forEach(attch,function(key,value){
        orgin[key] = value;
    });
}

UnitTools.forEach = function(data,itemCallback)
{
    try{

    }catch(e){
        //cc.log(e.message);
        var a;
    }

    if(UnitTools.isFunction(itemCallback) == false)
    {
        throw  new Error("UnitTools.forEach itemCallback must be a function");
    }
    if(UnitTools.isArray(data) || UnitTools.isJson(data))
    {
        for(var key in data)
        {
            itemCallback(key,data[key]);
        }
    }
}



UnitTools.now = function()
{
    return new Date().getTime();
}

UnitTools.getFuncArgs = function(func)
{
    if(UnitTools.isNullOrUndefined(func))return;
    //var args = func.toString().match(/function\s.*?\(([^)]*)\)/)[1];
    //return args.split(",").map(function(arg) {
    //    return arg.replace(/\/\*.*\*\//, "").trim();
    //}).filter(function(arg) {
    //    return arg;
    //});
    return func.length;
}

UnitTools.genID = function()
{
    var id = "";
    for(var i = 0;i<8;i++)
    {
        id+=(((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return id.toLowerCase();
}

UnitTools.genShortID = function(){
    var id = "";
    for(var i = 0;i<6;i++){
        id+=UnitTools.random(0,9);
    }
    return id;
}

UnitTools.isTimeOut = function(from,timeOut)
{
    var delta = Date.now() - from;
    if(delta >=timeOut)return true;
}

UnitTools.formatStr = function(str)
{
    if( arguments.length == 0 )
        return null;
    var str = arguments[0];
    for(var i=1;i<arguments.length;i++) {
        var re = new RegExp('\\{' + (i-1) + '\\}','gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
}

UnitTools.random = function(minNum,maxNum)
{
    var length = maxNum - minNum;
    var random = Math.floor(Math.random()*(length+1));
    return minNum +random;
}

UnitTools.load = function (url, cb,timeOut) {
    try {
        var response = false;
        setTimeout(function(){
            if(response == false){
                cb(new Error("超时了"),null);
            }
        },timeOut);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
                response = true;
                cb(null,JSON.parse(xhr.responseText));
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    } catch (e) {
        cb(e, null);
    }
};
UnitTools.request = function (url,dataJson,cb,timeOut) {
    var self = this;
    url = "http://"+CommonConfig.httpconfig.host+":"+CommonConfig.httpconfig.port+"/"+url;
    var dataStr = "";
    var firstEnter = true;
    for(var key in dataJson){
        if(!firstEnter)dataStr+="&";
        firstEnter = false;
        var value = dataJson[key];
        dataStr+=key;
        dataStr+="=";
        dataStr+=value;
    }
    if(!timeOut){
        timeOut = 30000;
    }
    try {
        var response = false;
        setTimeout(function(){
            if(response == false){
                cb("超时了",null);
            }
        },timeOut);
        // if(!self.xhr){
        //     console.log("-------------------------------------------------")
          
            
        // }
        self.xhr = new XMLHttpRequest();
        self.xhr.onreadystatechange = function () {
            if (self.xhr.readyState == 4 && self.xhr.status >= 200 && self.xhr.status < 400) {
                response = true;
                cb(null, JSON.parse(self.xhr.responseText));
            }
        };
        var finalUrl = dataStr==""?url:url+"?"+dataStr;
  
        finalUrl = encodeURI(finalUrl);
        self.xhr.open("GET", finalUrl, true);
        self.xhr.withCredentials = true;
        self.xhr.send();
    } catch (e) {
        cb(e, null);
    }
}

//检查手机号
UnitTools.checkMobile = function (str) {
    var re = /^1\d{10}$/
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}

UnitTools.checkSpecialChar = function(e){
    var re = /[~#^$@%&!*()<>:;'"{}【】  ]/gi;
    if (re.test(e)) {
        return true;
    }
    return false;
}

UnitTools.changeToNum2 = function (num) {
    if(num.toString().length == 1){
        return "0"+num;
    }
    return num;
}

UnitTools.base64 = function (str) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    function base64encode(str) {
        var out, i, len;
        var c1, c2, c3;

        len = str.length;
        i = 0;
        out = "";
        while(i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if(i == len)
            {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if(i == len)
            {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }

    return base64encode(str);
}

UnitTools.deBase64 = function (str) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;

        len = str.length;
        i = 0;
        out = "";
        while(i < len) {
            /* c1 */
            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while(i < len && c1 == -1);
            if(c1 == -1)
                break;

            /* c2 */
            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while(i < len && c2 == -1);
            if(c2 == -1)
                break;

            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

            /* c3 */
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if(c3 == 61)
                    return out;
                c3 = base64DecodeChars[c3];
            } while(i < len && c3 == -1);
            if(c3 == -1)
                break;

            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

            /* c4 */
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if(c4 == 61)
                    return out;
                c4 = base64DecodeChars[c4];
            } while(i < len && c4 == -1);
            if(c4 == -1)
                break;
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }
    return base64decode(str);
}
UnitTools.dateFormat =  function(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}
UnitTools.compareDate = function(date1,date2){
    var oDate1 = new Date(date1);
    var oDate2 = new Date(date2);
    if(oDate1.getTime() > oDate2.getTime()){
        return true; //第一个大
    } else {
        return false; //第二个大
    }
}
UnitTools.isVip = function(vipExpirationTime){
    if(!vipExpirationTime){
        return false;
    }
    var oDate1 = new Date();
    var oDate2 = new Date(vipExpirationTime);
    if(oDate1.getTime() > oDate2.getTime()){
        return false;
    } else {
        return true; 
    } 
}
UnitTools.timeDifference = function(date1,date2){
    var date3 = date2.getTime() - date1.getTime();   //时间差的毫秒数      
    if (date3< 0) {
        return '0分钟';
    }

    //------------------------------
    //计算出相差天数
    var days=Math.floor(date3/(24*3600*1000))

    //计算出小时数
    var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000))
    //计算相差分钟数
    var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000))
    //计算相差秒数
    var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000)
    return hours>0? hours+"小时"+minutes+"分钟":minutes+"分钟";
}
module.exports = UnitTools;


// console.log(UnitTools.changeToNum2(11));

// var a = "sdfsdfsdfiueruweurfsdfds";
// console.log(UnitTools.base64(a));
//
// console.log(UnitTools.deBase64(UnitTools.base64(a)));

// UnitTools.request("http://localhost:3000/weixinLogin",{weixininfo:JSON.stringify({a:1,b:1})},function () {
//
// },5000)