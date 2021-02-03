var pomelo = require('pomelo');
var allianceclubDao = module.exports;

allianceclubDao.saveAllianceclubClient = function(allianceclub,client,cb){
	pomelo.app.get('dbclient').insertTableByClient(allianceclub,"allianceclub",client,cb);
}

allianceclubDao.saveAllianceclub = function(allianceclub,cb){
	pomelo.app.get('dbclient').insertTable(allianceclub,"allianceclub",cb);
}

//查询联盟列表
allianceclubDao.findListByClubId = function(clubId,cb){
    var sql = 'SELECT ac.allianceId,ac.maxquota,ac.currentquota,a.`name`,a.synopsis,a.headPortraitUrl,a.creatorClubId,a.creatorUserId FROM allianceclub as ac LEFT JOIN alliance as a ON ac.allianceId = a.id   WHERE ac.clubId = ?  AND status = 1 ORDER BY ac.creationTime asc ';
	var args = [clubId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}

//查询俱乐部列表
allianceclubDao.findListByAllianceId = function(allianceId,cb){
    var sql = 'SELECT c.id,c.`name`,c.headPortraitUrl,c.synopsis,ac.maxquota,ac.currentquota,ac.defaultmaxquota,ac.commissionsum FROM allianceclub ac LEFT JOIN club c ON ac.clubId = c.id WHERE ac.allianceId = ? AND c.`status` =1  ORDER BY ac.creationTime asc ';
	var args = [allianceId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}

//修改默认最大额度
allianceclubDao.updateDefaultmaxquota = function(allianceId,clubId,defaultmaxquota,cb){
    var sql = 'UPDATE allianceclub SET defaultmaxquota = ? WHERE clubId = ? AND allianceId = ?';
	var args = [defaultmaxquota,clubId,allianceId];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);
}

//修改最大额度
allianceclubDao.updateMaxquota = function(allianceId,clubId,maxquota,cb){
    var sql = 'UPDATE allianceclub SET maxquota = ? WHERE clubId = ? AND allianceId = ?';
	var args = [maxquota,clubId,allianceId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}

//增加最大额度
allianceclubDao.increaseMaxquota = function(allianceId,clubId,maxquota,cb){
    var sql = 'UPDATE allianceclub SET maxquota = maxquota+? WHERE clubId = ? AND allianceId = ?';
	var args = [maxquota,clubId,allianceId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}

//增加额度
allianceclubDao.increaseCurrentquota = function(allianceId,clubId,quota,cb){
    var sql = 'UPDATE allianceclub SET currentquota =currentquota+ ? WHERE clubId = ? AND allianceId = ?';
	var args = [quota,clubId,allianceId];
	pomelo.app.get('dbclient').findListBySql(sql,args,cb);
}

allianceclubDao.deleteByAllianceIdAndClubId = function(allianceId,clubId,cb){
	var sql = 'DELETE FROM allianceclub WHERE clubId = ? AND allianceId = ?';
	var args = [clubId,allianceId];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);	
}

//恢复初始额度
allianceclubDao.recoverQuotaInit = function(allianceId,clubId,cb){

    var sql = 'UPDATE allianceclub SET maxquota =defaultmaxquota , currentquota =0  WHERE clubId = ? AND allianceId = ?';
	var args = [clubId,allianceId];
	pomelo.app.get('dbclient').updateSql(sql,args,cb);	
}

//加入联盟
allianceclubDao.joinAlliance = function(clubId,allianceId,creatorUserId,cb){
	var currentDate = new Date();
	var allianceclub = {
		allianceId:allianceId,
		clubId:clubId,
		creatorUserId:creatorUserId,
		creationTime:currentDate
	}
	this.saveAllianceclub(allianceclub,cb);
}
