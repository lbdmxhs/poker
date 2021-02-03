// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        outAnimationClip:cc.AnimationClip,
        inAnimationClip:cc.AnimationClip
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
       var animation =  this.node.addComponent(cc.Animation);
       animation.addClip(this.outAnimationClip,"out");
       animation.addClip(this.inAnimationClip,"in");

       this.node.on(cc.Node.EventType.TOUCH_START,function (args) {
            animation.play("in");
       },this);

        this.node.on(cc.Node.EventType.TOUCH_END,function (args) {
            animation.play("out");
        },this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL,function (args) {
            animation.play("out");
        },this);
    },

    start () {

    },

    // update (dt) {},
});
