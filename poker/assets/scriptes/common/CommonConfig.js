class CommonConfig {};
CommonConfig.httpconfig = {
    host: "127.0.0.1",
    port: "3001",
    log: true
}
CommonConfig.getHttpUrl = function() {
    var url = "http://"+CommonConfig.httpconfig.host+":"+CommonConfig.httpconfig.port;
    return url;
}
module.exports = CommonConfig;