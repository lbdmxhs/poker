function UnitTools()
{

}
//获取随机验证码
UnitTools.randomCode = function (str) {
    var vertify = '0123456789';
    var sd = '';
    for (var i = 0; i < 6; i++) {
        //向下取整 
        var random = Math.floor( Math.random() * (vertify.length));
        //1：初始化验证码 空字符  res长度为6
        sd += vertify[random];
    }
    return sd;
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
UnitTools.compareData = function(timestamp, expire) {
	if(expire < 0) {
		// negative expire means never expire
		return true;
	}

	return (Date.now() - timestamp) < expire;
};
module.exports = UnitTools;