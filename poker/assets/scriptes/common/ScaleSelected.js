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
        scaleSelectedNode:{
            default:null,
            type:cc.Node  
        },
        scale:{
            default:null,
            type:cc.Node  
        },
        progressbar:{
            default:null,
            type:cc.Sprite  
        },
        scaleLabel:{
            default:null,
            type:cc.Node   
        },
        selectNode:{
            default:null,
            type:cc.Node   
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;
        let  moveDistance = 0;
        // self.currentLocation = 0;
        this.selectNode.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            moveDistance = moveDistance+ event.getDeltaX();
            // console.log(moveDistance+"---------|"+self.scaleInterval);
            if(moveDistance>self.scaleInterval){
                moveDistance = 0; 
                self.moveSelectNode(0);
            }else if(moveDistance<(0-self.scaleInterval)){
                moveDistance = 0; 
                self.moveSelectNode(1);
            }
        })
        this.selectNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            moveDistance = 0;
        })
        // self.initData({
        //     scaleLabelList:[{name:"1",value:"1"},{name:"2",value:"2"},{name:"3",value:"3"},{name:"4",value:"4"},{name:"5",value:"5"},{name:"6",value:"6"}],
        //     scaleNodeActive:false,
        //     scaleLabelActive:false,
        //     callback:function(data){
        //         console.log(data);
        //     }
        // });
        // self.setValue("2");
    },
    
    moveSelectNode(type){

        let self = this;
        var scaleLabelNode = this.scaleLabelNodeList[self.currentLocation];
        if(scaleLabelNode){
            scaleLabelNode.color = new cc.Color(255, 255, 255);
        }
        if(type == 0&&self.currentLocation<(self.scaleLabelList.length-1)){
            self.currentLocation = self.currentLocation+1;
            var x = self.scaleList[self.currentLocation];
            self.selectNode.x = x;
        }else if(type == 1&&self.currentLocation>0){
            self.currentLocation = self.currentLocation-1;
            var x = self.scaleList[self.currentLocation];
            self.selectNode.x = x;
        }else if(type == 2){
            if(self.currentLocation<0||self.currentLocation>(self.scaleLabelList.length-1)){
                self.currentLocation = 0;
            }
            var x = self.scaleList[self.currentLocation];

            self.selectNode.x = x;
        }
        if(self.selectCallback&&typeof self.selectCallback  === "function"){
            self.selectCallback (self.scaleLabelList[self.currentLocation]);
        }
        var scaleLabelNode = this.scaleLabelNodeList[self.currentLocation];
        if(scaleLabelNode){
            scaleLabelNode.color = new cc.Color(250, 236, 192);
        }

    },
    initData(data,defaultValue){
        let self = this;
        // this.scaleLabelList =[{name:"1",value:"1"},{name:"2",value:"2"},{name:"3",value:"3"},{name:"4",value:"4"},{name:"5",value:"5"},{name:"6",value:"6"}];  
        this.scaleLabelList  = data.scaleLabelList?data.scaleLabelList:[];
        this.scaleNodeActive = data.scaleNodeActive;
        this.scaleLabelActive = data.scaleLabelActive;
        this.clearNode();
        this.scaleNodeList = [];
        this.scaleLabelNodeList = [];
        this.selectCallback = data.callback;
        this.initScale(this.scaleLabelList);
        if(!self.currentLocation){
            self.currentLocation = 0;
        }
 
        this.setValue(defaultValue);

    },
    setValue(value){
        let self = this;
        this.scaleLabelList.forEach(function(item,index){
            if(item.value == value){
                self.currentLocation= index;
            }
        })
        this.moveSelectNode(2);
    },
    getValue(){
        let self = this;
        return this.scaleLabelList[self.currentLocation];
    },
    clearNode(){

        if(this.scaleNodeList&&this.scaleNodeList.length>0){
            this.scaleNodeList.forEach(function(item){
                item.removeFromParent();
                item.destroy() ;
            })        
        }
        if(this.scaleLabelNodeList&&this.scaleLabelNodeList.length>0){
            this.scaleLabelNodeList.forEach(function(item){
                item.removeFromParent();
                item.destroy() ;
            })        
        }
    },
    initScale(scaleLabelList){
       let self = this;


       self.scaleList = [];
       let progressbarWidth = self.progressbar.node.width;

       let maxX = self.div(progressbarWidth,2);
       let minX = 0-self.div(progressbarWidth,2);
       self.scaleInterval =self.div(progressbarWidth,scaleLabelList.length-1) ;

       scaleLabelList.forEach(function(item,index){
            var x;
           if(index == (scaleLabelList.length-1)){
                x =maxX;

           }else{
                x = minX+(self.scaleInterval*index);
           }

           var node = self.copyScaleNode();
           var scaleLabelItem = self.copyScaleLabel();
           node.x = x;
           scaleLabelItem.getComponent(cc.Label).string = item.name;
           scaleLabelItem.x= x;
           self.scaleList.push(x); 
           self.scaleSelectedNode.addChild(node);
           self.scaleSelectedNode.addChild(scaleLabelItem);
       });
       self.selectNode.zIndex = scaleLabelList.length*2;
       self.selectNode.x = minX;
        // console.log(scaleList);
        // this.moveSelectNode(2);
    },
    copyScaleNode(){
        var node = cc.instantiate(this.scale);
        if( this.scaleNodeActive !== false){
            node.active = true;
        }
        this.scaleNodeList.push(node);
        return node;
    },
    copyScaleLabel(){

        var node = cc.instantiate(this.scaleLabel);
        if( this.scaleLabelActive !== false){
            node.active = true;
        }
        this.scaleLabelNodeList.push(node);
        return node;
    },
    div(num1,num2){
        return (Number(num1)/Number(num2)).toFixed(2)
    },
    start () {

    },

    // update (dt) {},
});
