(function(global,undefined){
	"use strict";
	var views = [];
	global.mvc.extend({
		view: function(name){
			return new Promise(function(resolve,reject){
				var i;
				for(i in views){
					if(views[i].name == name){
						resolve(views[i]);
					}
				}
				fetch('app/views/'+name+'.js',{cache:'no-cache'}).then(function(res){
					return res.text().then(function(text){
						return (new Function(text+';return View;'))();
					});
				}).then(function(config){
					return new Promise(function(resolve,reject){
						mvc.controller(config.controller).then(function(controller){
							config.controller = controller;
							resolve(config);
						}).catch(reject);
					});
				}).then(function(config){
					return new Promise(function(resolve,reject){
						mvc.model(config.model).then(function(model){
							config.model = model;
							resolve(config);
						}).catch(reject);
					});
				}).then(function(config){
					resolve(new global.mvc.View(name,config));
				}).catch(reject);
			});
		},
		views: new Prop({
			get: function(){
				return views;
			}
		}),
		View: function(name,config){
			var self = this,
				current_id = 0;
			if(config===undefined){
				throw new Error('There is no config data for '+name+' view');
			}
			self.extend({
				name: new Prop({
					readonly: true,
					value: name
				}),
				config: new Prop({
					readonly: true,
					value: config
				}),
				controller: new Prop({
					readonly: true,
					value: config.controller
				}),
				model: new Prop({
					readonly: true,
					value: config.model
				}),
				id: new Prop({
					get: function(){
						return current_id;
					}
				}),
				record: new Prop({
					get: function(){
						var r;
						r = self.model.get(current_id);
						if(!r){
							self.model.insert(current_id,{});
							r = self.model.get(current_id);
						}
						return r;
					}
				}),
				open: function(id){
					current_id = id|0;
					var setup = function(name){
							var item = config[name],i;
							if(item!==undefined){
								if(item.children){
									for(i in item.children){
										ui[name].add(new Widget(item.children[i],ui[name]));
									}
								}
								if(item.css!==undefined){
									ui[name].css = item.css;
								}
								if(item.attributes!==undefined){
									ui[name].attributes = item.attributes;
								}
								if(item.events !== undefined){
									for(i in item.events){
										body.on(i,item.events[i]);
									}
								}
							}
						},
						i;
					ui.reset()
						.parent
						.css(config.css)
						.attr(config.attributes);
					ui.view = self;
					if(config.events !== undefined){
						for(i in config.events){
							ui.parent.on(i,config.events[i]);
						}
					}
					setup('header');
					setup('nav');
					setup('body');
					setup('footer');
					ui.render();
				}
			});
			views.push(self);
			return self;
		}
	});
})(window);