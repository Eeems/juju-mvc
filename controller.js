(function(global,undefined){
	"use strict";
	var controllers = [];
	global.mvc.extend({
		controller: function(name){
			return new Promise(function(resolve,reject){
				var i;
				for(i in controllers){
					if(controllers[i].name == name){
						resolve(controllers[i]);
					}
				}
				fetch('app/controllers/'+name+'.js',{cache:'no-cache'}).then(function(res){
					res.text().then(function(text){
						return (new Function(text+';return Controller;'))();
					}).then(function(config){
						resolve(new global.mvc.Controller(name,config));
					}).catch(reject);
				});
			});
		},
		controllers: new Prop({
			get: function(){
				return controllers;
			}
		}),
		Controller: function(name,config){
			var self = this;
			self.extend({
				name: new Prop({
					readonly: true,
					value: name
				}),
				config: new Prop({
					readonly: true,
					value: config
				})
			});
			controllers.push(self);
			return self;
		}
	});
})(window);