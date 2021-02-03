class ButAnimation{}
ButAnimation.play = function(node,callback){
    if(this.animCtrl){
        return ;
    }
    let self = this;
    cc.loader.loadRes("animations/ButAnimation",cc.AnimationClip, function(err, clip) {
        if (err) {
            cc.log(err.message || err);
            return;
        }

        let animCtrl = node.addComponent(cc.Animation);
        self.animCtrl = animCtrl;
        animCtrl.addClip(clip,"ButAnimation");
        animCtrl.play('ButAnimation');
        animCtrl.on('stop',function(){
            if(callback){
                callback();
            }
            self.animCtrl = null;
        },node);
    })
    
}
module.exports=ButAnimation
