(function(global,undefined){
	"use strict";
	var loading = 0,
		onrun = [];
	global.extend({
		mvc: new Module({
			run: function(fn){
				if(fn === undefined){
					loading--;
				}else{
					onrun.push(fn);
				}
				if(global.mvc.ready){
					for(var i in onrun){
						onrun.pop()();
					}
				}
				return this;
			},
			ready: new Prop({
				get: function(){
					return loading === 0;
				}
			}),
			wait: function(){
				loading++;
				return this;
			}
		})
	});
})(window);