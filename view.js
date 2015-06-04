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
					var setup = function(name){
							var item = config[name],i;
							if(item!==undefined){
								if(item.children){
									for(i in item.children){
										ui[name].add(widget.new(item.children[i]));
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