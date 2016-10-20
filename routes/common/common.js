/**
 * common module
 */
var common = {
	generateRandomNum : function(n){
		var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
		var res = '';
		for(var i = 0 ; i < n ; i++){
			var id = Math.ceil(Math.random()*35);
		    res += chars[id];
		}
		return res;
	},
    randomColor : function(color){
        return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
        && (color.length == 6) ?  color : arguments.callee(color);
    },
	forEachPromise : function(deferred,i,array,promiseFunc,param){
       if(!array || array.length == 0){
           if(deferred){
               deferred.resolve();
           }
           return;
       }
       if(i < array.length){
           promiseFunc(array[i],param).then(function(){
               common.forEachPromise(deferred,++i,array,promiseFunc,param);
           });
       }
       else{
           if(deferred){
               deferred.resolve();
           }
       }
	}
};

module.exports = common;
