class Loading{
}
Loading.show = function(cb){
    if(this.isshow){
       return ; 
    }
    this.isshow = true;
    if(this.loading){
        this.close();
    }
    let self = this;
    cc.loader.loadRes("prefabs/loading",cc.Prefab, function (error, prefab){
        if (error){
            cc.error(error);
            return;
        }
        self.loading = cc.instantiate(prefab);
        cc.director.getScene().addChild(self.loading);
        self.loading.parent = cc.find("Canvas");
        self.isshow = false;
        if(cb instanceof Function){
            cb();
        }
    })
    setTimeout(() => {
        self.close(); 
    }, 20000);
    
}
Loading.close = function(){
    if (this.loading != null) {
        this.loading.destroy();
        this.loading = null;
    }
} 
module.exports=Loading