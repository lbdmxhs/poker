// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        blindsScaleSelected:{
            default:null,
            type:cc.Node 
        },
        blindsLabel:{
            default:null,
            type:cc.Label 
        },
        minBringBankRollLabel:{
            default:null,
            type:cc.Label 
        },
        maxPeopleScaleSelected:{
            default:null,
            type:cc.Node 
        },
        startPeopleScaleSelected:{
            default:null,
            type:cc.Node 
        },
        durationScaleSelected:{
            default:null,
            type:cc.Node   
        },
        roomNameEditbox:{
            default:null,
            type:cc.EditBox    
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        this.blindsScaleSelectedUtil = this.blindsScaleSelected.getComponent('ScaleSelected');
        this.blindsScaleSelectedUtil.initData({
            scaleLabelList:[
                {name:"1/2",value:"1/2",smallBlinds:"1",bigBlinds:"2",minBringBankRoll:"200"},
                {name:"2/4",value:"2/4",smallBlinds:"2",bigBlinds:"4",minBringBankRoll:"400"},
                {name:"5/10",value:"5/10",smallBlinds:"5",bigBlinds:"10",minBringBankRoll:"100"},
                {name:"10/20",value:"10/20",smallBlinds:"10",bigBlinds:"20",minBringBankRoll:"2000"},
                {name:"20/40",value:"20/40",smallBlinds:"20",bigBlinds:"40",minBringBankRoll:"4000"},
                {name:"25/50",value:"25/50",smallBlinds:"25",bigBlinds:"50",minBringBankRoll:"5000"},
                {name:"50/100",value:"50/100",smallBlinds:"50",bigBlinds:"100",minBringBankRoll:"10000"},    
                {name:"100/200",value:"100/200",smallBlinds:"100",bigBlinds:"200",minBringBankRoll:"20000"},
                {name:"200/400",value:"200/400",smallBlinds:"200",bigBlinds:"400",minBringBankRoll:"40000"},
            ],
            scaleNodeActive:false,
            scaleLabelActive:false,
            callback:function(data){
                self.blindsLabel.string = data.name;
                self.minBringBankRollLabel.string = data.minBringBankRoll;
                // console.log(data);
                self.roomNameEditbox.string = "德州"+data.name+"("+data.smallBlinds+")";
            }
        });
        this.maxPeopleScaleSelectedUtil = this.maxPeopleScaleSelected.getComponent('ScaleSelected');
        this.maxPeopleScaleSelectedUtil.initData({
            scaleLabelList:[
                {name:"2",value:2},
                {name:"3",value:3},
                {name:"4",value:4},
                {name:"5",value:5},
                {name:"6",value:6},
                {name:"7",value:7},
                {name:"8",value:8},
                {name:"9",value:9},
            ],
            callback:function(data){
                self.updateStartPeopleScaleSelected(data.value);
            }
        },6);
        this.durationScaleSelectedUtil = this.durationScaleSelected.getComponent('ScaleSelected');
        this.durationScaleSelectedUtil.initData({
            scaleLabelList:[
                {name:"0.5",value:"0.5"},
                {name:"1",value:"1"},
                {name:"1.5",value:"1.5"},
                {name:"2",value:"2"},
                {name:"2.5",value:"2.5"},
                {name:"3",value:"3"},
                {name:"3.5",value:"3.5"},
                {name:"4",value:"4"},
            ]
        },"2.5");
        // this.blindsScaleSelectedUtil.setValue("2");

    },
    getRoom(){
        var room = {
            type:"1",
            ante:this.blindsScaleSelectedUtil.getValue().smallBlinds,
            smallBlinds:this.blindsScaleSelectedUtil.getValue().smallBlinds,
            bigBlinds:this.blindsScaleSelectedUtil.getValue().bigBlinds,
            minBringBankRoll:this.blindsScaleSelectedUtil.getValue().minBringBankRoll,
            maxPeopleNumber:this.maxPeopleScaleSelectedUtil.getValue().value,
            startPeopleNumber:this.startPeopleScaleSelectedUtil.getValue().value,
            duration:this.durationScaleSelectedUtil.getValue().value,
        };
        if(this.roomNameEditbox.string){
            room.name  = "德州"+this.blindsScaleSelectedUtil.getValue().name+"("+room.smallBlinds+")";
        }
        return room;
    },
    updateStartPeopleScaleSelected(maxPeople){
        var list = []; 
        for(var i=2;i<=maxPeople;i++){
            list.push({name:i,value:i}); 
        }
        this.startPeopleScaleSelectedUtil = this.startPeopleScaleSelected.getComponent('ScaleSelected');
        this.startPeopleScaleSelectedUtil.initData({scaleLabelList:list}); 
    },
    start () {

    },

    // update (dt) {},
});
