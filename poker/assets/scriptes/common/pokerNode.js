

cc.Class({
    extends: cc.Component,

    properties: {
        front:{
            default: null,                
            type: cc.Node
        },
        pkAtlas:{
	        default: null,
	        type: cc.SpriteAtlas
        },
        selectedNode:{
            default: null,                
            type: cc.Node  
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },
    showPoker(spriteFramesName,delayTime,callBack)
    {
        console.log("----------------------");
        if(!spriteFramesName){
            return ;
        }
        this.node.active = true;
        this.front.addComponent(cc.Sprite).spriteFrame = this.pkAtlas._spriteFrames[spriteFramesName];
        this.front.width = this.node.width;
        this.front.height = this.node.height;
        if(delayTime == null)
        {
            delayTime = 0.2;
        }
        let self = this;
        let action = cc.sequence(
            cc.delayTime(delayTime),
            cc.rotateTo(0.2,0,90),
            cc.callFunc(function(){
                //在这里切换扑克纹理
                self.front.active = true
            }),
            cc.targetedAction(self.front,cc.rotateTo(0,0,180)),
            cc.rotateTo(0.2,0,180),
            cc.callFunc(function(){
                if(callBack !=null)
                {
                    callBack();
                }
                // self.reset();
                // console.log(self.front.getComponent(cc.Widget).isAlignTop);
                // console.log(self.front.getComponent(cc.Widget).bottom);
            })
        )
        this.node.runAction(action);
        
    },
    selected(){
        let self = this;
        self.selectedNode.active = true;
    },
    reset(){
        let self = this;
        // cc.delayTime(delayTime),
        self.front.active = false;
        self.node.active = false;
        self.selectedNode.active = false;
    },
    start () {
        // this.node.scale = 1;//控制大小
    },

    // update (dt) {},
});
