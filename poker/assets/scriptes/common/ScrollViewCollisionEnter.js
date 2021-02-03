cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.direction = 0;//0向上移动 1向下移动
        let manager = cc.director.getCollisionManager();
            manager.enabled = true;     //开启碰撞检测
    }, 
    start () {

    },


    onCollisionEnter(other, self) {
        // console.log('刚交集');
        other.node.opacity = 255;
    },
    onCollisionStay(other, self) {
        // console.log('现在正在有交集');
        other.node.opacity = 255;
    },
    onCollisionExit(other, self) {
        // console.log('离开');
        other.node.opacity = 0;
    }
    // update (dt) {},
});
