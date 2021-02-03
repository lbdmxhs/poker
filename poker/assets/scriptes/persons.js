// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
var NetUtil = require("NetUtil");
var Alert = require("Alert");
var TexasPoker = require("TexasPoker");
var pkArr = ["FK_2","FK_3","FK_4","FK_5","FK_6","FK_7","FK_8","FK_9","FK_10","FK_11","FK_12","FK_13","FK_14",
			 "HT_2","HT_3","HT_4","HT_5","HT_6","HT_7","HT_8","HT_9","HT_10","HT_11","HT_12","HT_13","HT_14",
			 "HX_2","HX_3","HX_4","HX_5","HX_6","HX_7","HX_8","HX_9","HX_10","HX_11","HX_12","HX_13","HX_14",
			 "MH_2","MH_3","MH_4","MH_5","MH_6","MH_7","MH_8","MH_9","MH_10","MH_11","MH_12","MH_13","MH_14"];
cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // pomelo.on('test', function(data) {
        //     console.log(data);
        // });
    },
    butClick(){
        // NetUtil.pomeloRequest("pokerTable.pokerTableHandler.test",{tableId:"1110"},function(data){
        //     if(data.code!=200){
        //         Alert.show(data.msg);   
        //         return ;
        //     }
        //     console.log(data);

            
        // });  
        // for(var i=0;i<200;i++){
        //     pkArr = shuffle(pkArr);
     
        //     var t = pkArr.slice(0,7);  
        //     // console.log(t);
        //     // console.log(pkArr);
        //     // TexasPoker.score( t);
        // }
        // pkArr = shuffle(pkArr);
        // var t = pkArr.slice(0,7);  
        
        // TexasPoker.score(t);
        // var s = new Set(pkArr);
        // console.log(s);
        　var date1 = new Date('2019/09/29 10:56')

　　//加上两天的时间

        var s1 = date1.getTime() + 3600 * 1000 * 24 * 2
        var date = new Date(s1);  
        // this.fillTime = formatTime(s1,'Y-M-D h:m:s');

        console.log(date)
    },
    start () {

    },

    // update (dt) {},
});
function formatTime(number,format) {  
  
    var formateArr  = ['Y','M','D','h','m','s'];  
    var returnArr   = [];  
    
    var date = new Date(number);  
    returnArr.push(date.getFullYear());  
    returnArr.push(formatNumber(date.getMonth() + 1));  
    returnArr.push(formatNumber(date.getDate()));  
    
    returnArr.push(formatNumber(date.getHours()));  
    returnArr.push(formatNumber(date.getMinutes()));  
    returnArr.push(formatNumber(date.getSeconds()));  
    
    for (var i in returnArr)  
    {  
      format = format.replace(formateArr[i], returnArr[i]);  
    }  
    return format;  
} 
  
//数据转化  
function formatNumber(n) {  
    n = n.toString()  
    return n[1] ? n : '0' + n  
}
//洗牌算法
var shuffle = function (arr){
    var length = arr.length,
        temp,
        random;
    while(0 != length){
        random = Math.floor(Math.random() * length)
        length--;
        // swap
        temp = arr[length];
        arr[length] = arr[random];
        arr[random] = temp;
    }
    return arr;
}

