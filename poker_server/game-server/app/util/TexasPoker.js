class TexasPoker{};
var Poker = function (n) {
    var p = n.split("_");
    this.num = Number(p[1]);
    this.ch = this.num > 9 ? ("abcdef"[this.num - 10]) : this.num;
    this.show = "0,1,2,3,4,5,6,7,8,9,10,J,Q,K,A".split(",")[this.num];
    this.color = p[0];
    this.toString = function () {
        return this.color +"_"+ this.show;
    };
};
var x = function (arg) { 
    //记录点数有几张牌
    var numCountMap= {};

    //相同花色统计
    var colorCountMap = {};


    //顺子数组
    var sTemp = arg[0];
    var isSContinuous  = true;
    var straightArr = [sTemp];

    arg.forEach(function(item,index){
        if(index>0){
            
            //顺子
            if (item.num === sTemp.num + 1) {
                // t = a[i];
                if(isSContinuous||straightArr.length){
                    isSContinuous = true;
                    straightArr.push(item);
                }

            }else if(item.num === sTemp.num){
                
            }else{
                isSContinuous = false;
                if(straightArr.length<5){
                    straightArr = [item];
                }

            }
            sTemp = item;
        }
        if(!numCountMap[item.num]){
            numCountMap[item.num] = [];
        }
        numCountMap[item.num].push(item);

        if(!colorCountMap[item.color]){
            colorCountMap[item.color] = [];
        }
        colorCountMap[item.color].push(item);
    });
    //四条点数
    var fourArr = [];
    //三条点数
    var threeArr = [];
    //2条点数
    var twoAtrr = [];
    for(var key in numCountMap){
        if(numCountMap[key].length == 4){
            fourArr.push(Number(key));
        } 
        if(numCountMap[key].length == 3){
            threeArr.push(Number(key));
        } 
        if(numCountMap[key].length == 2){
            twoAtrr.push(Number(key));
        } 
    }
    //判断同花
    var colorSameArr;
    for(var key in colorCountMap){
        if(colorCountMap[key].length >= 5){
            colorSameArr = colorCountMap[key];
        }
    }
      //同花顺数组
    var straightFlushArr;
    if(colorSameArr){
        var sfTemp = colorSameArr[0];
        var isSfContinuous  = true;
        straightFlushArr = [sfTemp];
        colorSameArr.forEach(function(item){
            //顺子
            if (item.num === sfTemp.num + 1) {
                // t = a[i];
                if(isSfContinuous||straightFlushArr.length){
                    isSfContinuous = true;
                    straightFlushArr.push(item);
                }

            }else if(item.num === sfTemp.num){
                
            }else{
                isSfContinuous = false;
                if(straightFlushArr.length<5){
                    straightFlushArr = [item];
                }

            }
            sfTemp = item;
        });
    }
    var  type ,compare = [],resultArr=[],typeName;
    if(straightFlushArr&&straightFlushArr.length >= 5){
        if(straightFlushArr[straightFlushArr.length-1].num == "14"){
            type = 1; //皇家同花顺
            typeName ="皇家同花顺"; 
        }else{
            type = 2; //同花顺  
            typeName ="同花顺"; 
        }
        compare = [straightFlushArr[straightFlushArr.length-1].num];
        resultArr = straightFlushArr.slice(straightFlushArr.length-5,straightFlushArr.length);

    }else if(fourArr.length>0){
        //四条
        type = 3;
        typeName ="四条"; 
        compare.push(fourArr[0]);
        if(arg[arg.length-1].num !=  fourArr[0]){
            compare.push(arg[arg.length-1].num);
        }else if(arg.length>4){
            //最后一个是四条的数字 则取倒数第五个数
            compare.push(arg[arg.length-5].num); 
        }
        resultArr = numCountMap[fourArr[0]];
    }else if(threeArr.length>1||(threeArr.length>0&&twoAtrr.length>0)){
        type = 4;  //葫芦
        typeName ="葫芦"; 
        if(threeArr.length>1){
            //降序
            threeArr.sort(function(a, b){return b - a});
            compare = threeArr;
            resultArr =  numCountMap[threeArr[0]].concat(numCountMap[threeArr[1]]);
            resultArr.pop();
        }else if(threeArr.length>0&&twoAtrr.length>0){
            twoAtrr.sort(function(a, b){return b - a});
            compare =  [threeArr[0],twoAtrr[0]];
            resultArr = numCountMap[threeArr[0]].concat(numCountMap[twoAtrr[0]]);
        }
    }else if(colorSameArr){
        type = 5;  //同花 
        typeName ="同花"; 
        if(colorSameArr.length>5){
            resultArr = colorSameArr.slice(colorSameArr.length-5,colorSameArr.length);  
        }else{
            resultArr = colorSameArr
        }
        compare = resultArr.slice();
        compare.reverse();
    }else if(straightArr.length >= 5){

        type = 6; //顺子  
        typeName ="顺子"; 
        compare = [straightArr[straightArr.length-1].num];
        resultArr = straightArr.slice(straightArr.length-5,straightArr.length);
    }else if(threeArr.length == 1){
        type = 7; //三条
        typeName ="三条"; 
        compare = [threeArr[0]]; 
        resultArr = numCountMap[threeArr[0]];
        for(var i =arg.length-1;i>=0;i--){
            if(compare.length<3&&arg[i].num!=threeArr[0]){
                compare.push(arg[i].num);
            }

        }
    }else if(twoAtrr.length > 1){
        twoAtrr.sort(function(a, b){return b - a});
        type = 8; //两对
        typeName ="两对"; 
        compare = [twoAtrr[0],twoAtrr[1]]; 
        resultArr = numCountMap[twoAtrr[0]].concat(numCountMap[twoAtrr[1]]);
        for(var i =arg.length-1;i>=0;i--){
            if(compare.length<3&&arg[i].num!=twoAtrr[0]&&arg[i].num!=twoAtrr[1]){
                compare.push(arg[i].num);
            }

        }
    }else if(twoAtrr.length == 1){
        type = 9; //一对
        typeName ="一对"; 
        compare = [twoAtrr[0]]; 
        resultArr = numCountMap[twoAtrr[0]];
        for(var i =arg.length-1;i>=0;i--){
            if(compare.length<4&&arg[i].num!=twoAtrr[0]){
                compare.push(arg[i].num);
            }
        }
    }else{
        type = 10; //高牌
        typeName ="高牌"; 
        resultArr = [];
        compare = []; 
        for(var i =arg.length-1;i>=0;i--){
            if(compare.length<5){
                compare.push(arg[i].num);
            }
        }
    }

    return {
        typeName:typeName,
        type:type,
        resultArr:resultArr,
        compare:compare
    }

};


TexasPoker.score = function (pkArr) {
    var a = pkArr.map(function (p) {
        return new Poker(p);
    }).sort(function (p1, p2) {
        return p1.num - p2.num;
    });
    return x(a);
    // console.log(x(a));
    // console.log(z(a))
    // console.log(y(a))
    // return z(a) || y(a) || x(a) || w(a) || v(a) || u(a) || t(a) || s(a) || r(a);
};

module.exports=TexasPoker