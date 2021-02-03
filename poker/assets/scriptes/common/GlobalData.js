class GlobalData{}
GlobalData.setParameter = function(key,value){
    if(!key||!value){
        return ;
    }
    this[key] = value;
}
GlobalData.getParameter = function(key){
    return this[key];
}
GlobalData.deleteParameter= function(key){
    delete this[key];
}
GlobalData.setScenesParameter = function(value){
    this["scenesParameter"] = value;
}
GlobalData.getScenesParameter = function(){
    return this["scenesParameter"];
}
module.exports=GlobalData