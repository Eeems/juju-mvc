(function(global,undefined){
	"use strict";
	var views = [];
	global.mvc.extend({
		view: new Module({
			register: function(){
				var i,
					name,
					get = function(name){
						fetch('app/views/'+name+'.js',{cache:'no-store'}).then(function(res){
							res.text().then(function(text){
								new global.mvc.View(name,(new Function(text+';return View;'))());
								global.mvc.run();
							});
						});
					};
				for(i in arguments){
					name = arguments[i];
					if(!global.mvc.view.get(name)){
						global.mvc.wait();
						get(name);
					}
				}
			},
			get: function(name){
				for(var i in views){
					if(views[i].name == name){
						return views[i];
					}
				}
				return false;
			}
		}),
		views: new Prop({
			get: function(){
				return views;
			}
		}),
		View: function(name,config){
			var self = this;
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
				open: function(){
					ui.empty();
					var setup = function(name){
							if(config[name]!==undefined){
								if(config[name].children){
									for(var i in config[name].children){
										ui[name].add(widget.new(config[name].children[i]));
									}
								}
							}
						};
					setup('header');
					setup('nav');
					setup('body');
					setup('footer');
				}
			});
			views.push(self);
			return self;
		}
	});
})(window);