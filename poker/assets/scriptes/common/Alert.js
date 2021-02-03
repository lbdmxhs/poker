var ButAnimation = require("ButAnimation");
class Alert{
}

Alert.tipAlert = {
    _alert: null,           //prefab
    _animSpeed: 0.3,        //弹窗动画速度
};
 
/**
 * @param tipStr
 * @param leftStr
 * @param rightStr
 * @param callback
 */
Alert.show = function (tipStr,callback,leftStr,rightStr) {
    if(!tipStr){
        return ;
    }
    if(this.isshow){
        return;
    }
    this.isshow = true;
    if(this.tipAlert._alert){
        this.dismiss();
    }
    let self = this;
    cc.loader.loadRes("prefabs/alert",cc.Prefab, function (error, prefab){
        if (error){
            cc.error(error);
            return;
        }
        self.tipAlert._alert = cc.instantiate(prefab);
        cc.director.getScene().addChild(self.tipAlert._alert);
        
        cc.find("tsk/tip",self.tipAlert._alert).getComponent(cc.Label).string = tipStr;
        if(!leftStr){
            leftStr = "确定";
        }
        if(!rightStr){
            cc.find("tsk/but1",self.tipAlert._alert).active = false;
            cc.find("tsk/but2",self.tipAlert._alert).active = false;
            cc.find("tsk/but3/but3Str",self.tipAlert._alert).getComponent(cc.Label).string = leftStr;
      
            cc.find("tsk/but3",self.tipAlert._alert).on(cc.Node.EventType.TOUCH_START, function (event) {
                ButAnimation.play(cc.find("tsk/but3",self.tipAlert._alert),function(){
                    if(callback){
                        callback(leftStr);
                    }
                    self.dismiss();
                });
            
            }, self);
        
        }else{
            cc.find("tsk/but3",self.tipAlert._alert).active = false;
            cc.find("tsk/but1/but1Str",self.tipAlert._alert).getComponent(cc.Label).string = leftStr;
            cc.find("tsk/but2/but2Str",self.tipAlert._alert).getComponent(cc.Label).string = rightStr;
            
            cc.find("tsk/but1",self.tipAlert._alert).on(cc.Node.EventType.TOUCH_START, function (event) {
                ButAnimation.play(cc.find("tsk/but1",self.tipAlert._alert),function(){
                    if(callback){
                        callback(leftStr);
                    }
                    self.dismiss();
                });
            }, self); 
            cc.find("tsk/but2",self.tipAlert._alert).on(cc.Node.EventType.TOUCH_START, function (event) {
                ButAnimation.play(cc.find("tsk/but2",self.tipAlert._alert),function(){
                    if(callback){
                        callback(rightStr);
                    }
                    self.dismiss();
                });
        
            }, self); 
        }

      
        //设置parent 为当前场景的Canvas ，position跟随父节点
        self.tipAlert._alert.parent = cc.find("Canvas");
        self.isshow = false;
    });
};
 

 
// 执行弹出动画
Alert.dismiss = function () {
    if (!this.tipAlert._alert) {
        return;
    }
    if (this.tipAlert._alert != null) {
        this.tipAlert._alert.destroy();
        this.tipAlert._alert = null;
    }
};
 


module.exports=Alert
