var pomelo = require('pomelo');
var globalChannel = require('pomelo-globalchannel-plugin');
var status = require('pomelo-status-plugin');
var routeUtil = require('./app/util/routeUtil');
var IdsUtil = require('../shared/IdsUtil');
// route definition for chat server

/**
 * Init app for client.
 */
var redisClient = require('./app/util/redisClient');
redisClient.flushdb();

var app = pomelo.createApp();
app.set('name', 'pokerGame');
// configure for global
app.configure('production|development', function() {
	// route configures
	app.route('game', routeUtil.game);
	app.route('room', routeUtil.room);

  	app.before(pomelo.filters.toobusy());
	app.enable('systemMonitor');

	// proxy configures
	app.set('proxyConfig', {
		cacheMsg: true,
		interval: 30,
		//lazyConnection: true
		// enableRpcLog: true
	});

	// remote configures
	app.set('remoteConfig', {
		cacheMsg: true,
		interval: 30
	});
	var redisConfig = 	require(app.getBase() + '/../shared/config/redis.json');
	app.use(globalChannel, {globalChannel: {
		prefix: 'globalChannel',
		host: redisConfig.host,
		port: redisConfig.port,
		db: '0',       // optinal, from 0 to 15 with default redis configure
		cleanOnStartUp: true
	  }});
	app.use(status, {
		status: {
		prefix: 'status',
		host: redisConfig.host,
		port: redisConfig.port,
		cleanOnStartUp: true
		}
	});
	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
	app.filter(pomelo.filters.timeout());

	var redisClient = require('./app/util/redisClient');
	app.set('redisClient', redisClient);

});

// Configure database
app.configure('production|development', 'auth|connector|game|room', function() {
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
	// app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
    //  app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
});

// Configure database
app.configure('production|development', 'auth', function() {
	app.set('session', require(app.getBase() + '/../shared/config/session.json'));
});

// app configuration
app.configure('production|development', 'connector', function(){
  app.set('connectorConfig',
    {
      connector : pomelo.connectors.hybridconnector,
    //   heartbeat : 3,
    //   useDict : true,
      useProtobuf : true
    });
});
app.configure('production|development', 'gate', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true
		});
});
app.configure('production|development', 'room', function(){
	app.set('connectorConfig',
		{
			connector : pomelo.connectors.hybridconnector,
			useProtobuf : true
		});
});
// start app
app.start();
IdsUtil.initIdsConfig("clubids");
process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
