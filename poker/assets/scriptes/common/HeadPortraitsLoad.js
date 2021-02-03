class HeadPortraitsLoad{};
HeadPortraitsLoad.Load = function(node,url){
    node.getComponent(cc.Sprite).spriteFrame = null;
    if(!url){
        return ;
    }
    
    cc.loader.load(url,function(err,img){ 　
    
        var tximg  = new cc.SpriteFrame(img); 
        node.getComponent(cc.Sprite).spriteFrame = tximg;
        node.getComponent("ShaderHelper").onLoad();
　　});
}

module.exports=HeadPortraitsLoad