var ButAnimation = require("ButAnimation");
class Title{}
Title.creation = function(title,prevScenes,callback){
    if(this.title){
        this.title.removeFromParent();
        this.title = null;
    }
    if(!prevScenes){
        prevScenes = this.prevScenes;
    }
    let self = this;
    cc.loader.loadRes("prefabs/ztl",cc.Prefab, function (error, prefab){
        if (error){
            cc.error(error);
            return;
        }
        self.title = cc.instantiate(prefab);
        cc.director.getScene().addChild(self.title);
        cc.find("label",self.title).getComponent(cc.Label).string = title;
        if(prevScenes){
            cc.find("fhBut",self.title).on(cc.Node.EventType.TOUCH_START, function (event) {
                ButAnimation.play(cc.find("fhBut",self.title),function(){
                    console.log("点击返回");
                    if(callback){
                        callback();
                    }
                    if(prevScenes){
                        cc.director.loadScene(prevScenes);
                    }
                });
            }, self.title);
        }else{
            cc.find("fhBut",self.title).active = false;
        }
        

        self.title.parent = cc.find("Canvas");
    })
}
Title.setPrevScenes = function(prevScenes){
    this.prevScenes = prevScenes;
}
Title.getPrevScenes = function(prevScenes){
    return this.prevScenes;
}
module.exports=Title