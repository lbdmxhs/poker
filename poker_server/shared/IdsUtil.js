var idsConfig = require('./config/idsConfig');
var fs = require("fs");
function IdsUtil(){

}
IdsUtil.initIdsConfig = function(name){
    idConfigInfo = idsConfig[name];
    if(idConfigInfo.create){//创建
        this.generateIdsToFile(idConfigInfo.from,idConfigInfo.to,__dirname+"/"+idConfigInfo.path,__dirname+"/"+idConfigInfo.countpath);
    }
}
IdsUtil.generateIdsToFile = function(from,to,filePath,countFilePath){
    var numCount = (to - from)+1;//多少个
    var buffer = new Buffer(4*numCount);//总的大小
    for(var i = from;i<=to;i++){
        var start = i- from;
        start = start * 4;
        buffer.writeUInt32LE(i,start);
    }

    for(var i = 0;i<numCount;i++){
        var randomIndex = random(0,numCount-1);
        var currentNum = buffer.readUInt32LE(i*4);
        var changeNum = buffer.readUInt32LE(randomIndex*4);

        buffer.writeUInt32LE(changeNum,i*4);
        buffer.writeUInt32LE(currentNum,randomIndex*4);
    }

    fs.writeFileSync(filePath,buffer,{flag:"w"});
    fs.writeFileSync(countFilePath,"0",{flag:"w"});

}
IdsUtil.getID = async function(name){
    var idConfigInfo = idsConfig[name];
  return  new Promise(function (resolve,reject) {
      var countNum = parseInt(fs.readFileSync(__dirname+"/"+idConfigInfo.countpath,"utf-8"));
      var startBufferIndex = countNum * 4;
      var stream = fs.createReadStream(__dirname+"/"+idConfigInfo.path, { start: startBufferIndex, end: startBufferIndex+4,flags:"r"});
      stream.on("data",function (dataBuffer) {
          var id = dataBuffer.readUInt32LE(0);
          resolve(id);
          fs.writeFileSync(__dirname+"/"+idConfigInfo.countpath,(countNum+1)+"");
      })
    })
}

IdsUtil.getIdTwo = function(name,cb){
    var idConfigInfo = idsConfig[name];
    var countNum = parseInt(fs.readFileSync(__dirname+"/"+idConfigInfo.countpath,"utf-8"));
    var startBufferIndex = countNum * 4;
    var stream = fs.createReadStream(__dirname+"/"+idConfigInfo.path, { start: startBufferIndex, end: startBufferIndex+4,flags:"r"});
    stream.on("data",function (dataBuffer) {
        var id = dataBuffer.readUInt32LE(0);
        cb(null,id);
        fs.writeFileSync(__dirname+"/"+idConfigInfo.countpath,(countNum+1)+"");
    })
}

var random = function(minNum,maxNum)
{
    var length = maxNum - minNum;
    var random = Math.floor(Math.random()*(length+1));
    return minNum +random;
}
module.exports = IdsUtil;