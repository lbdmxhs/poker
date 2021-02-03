var redis = require('redis');
var redisConfig = require('../../../shared/config/redis.json');
var redisClient = redis.createClient(redisConfig.port,redisConfig.host);
 
redisClient.on("error", function (err) {
    // logger.error("Error " + err);
    console.error("Error " + err);
});

 
module.exports = redisClient;