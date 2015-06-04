(function(global,undefined){
	"use strict";
	var models = [];
	global.mvc.extend({
		model: function(name){
			return new Promise(function(resolve,reject){
				var i;
				for(i in models){
					if(models[i].name == name){
						resolve(models[i]);
					}
				}
				fetch('app/models/'+name+'.js',{cache:'no-store'}).then(function(res){
					res.text().then(function(text){
						resolve(
							new global.mvc.Model(name,(new Function(text+';return Model;'))())
						);
					}).catch(reject);
				});
			});
		},
		models: new Prop({
			get: function(){
				return models;
			}
		}),
		Model: function(name,config){
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
			models.push(self);
			return self;
		}
	});
})(window);