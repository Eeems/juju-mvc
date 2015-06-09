(function(global,undefined){
	"use strict";
	var types = [];
	global.extend({
		WidgetType: function(props){
			if(props.name === undefined){
				throw new Error('Widget types require a name');
			}
			if(global.widget.type(props.name)){
				throw new Error('Wiget type by that name already exists');
			}
			if(props.init === undefined){
				throw new Error('Widget types require an init function');
			}
			var self = this,
				i;
			self.tagName = 'div';
			for(i in props){
				self[i] = props[i];
			}
			self.extend({
				init: function(config){
					var widget = {},
						i;
					for(i in self){
						if(['init','name','value'].indexOf(i) == -1){
							widget[i] = self[i];
						}
					}
					if(config.children){
						for(i in config.children){
							widget.add(new global.Widget(config.children[i],widget));
						}
					}
					props.init.call(widget,config);
					widget.css = config.css===undefined?{}:config.css;
					widget.attributes = config.attributes===undefined?{}:config.attributes;
					if(props.events !== undefined){
						for(i in props.events){
							widget.on(i,props.events[i]);
						}
					}
					if(props.value){
						widget.extend({
							_value: null,
							value: new Prop({
								get: function(){
									return this._value;
								},
								set: function(val){
									this._value = val;
									try{
										return props.value.apply(this,arguments);
									}catch(e){}
								}
							})
						});
					}
					return widget;
				}
			});
			types.push(self);
			return self;
		},
		Widget: function(props,parent){
			var type,
				self,
				id,
				render = function(){},
				widgets = [],
				i,
				body,
				ret = function(val){
					return val instanceof Nodes?self:val;
				};
			if(props.type === undefined){
				throw new Error('No type specified for this widget');
			}
			type = global.widget.type(props.type);
			if(!type){
				throw new Error('The '+props.type+' widget type does not exist');
			}
			id = type.name+'-'+(+new Date);
			self = type.init(props);
			if(self.render!==undefined){
				render = self.render;
			}
			self.extend({
				id: new Prop({
					readonly: true,
					value: id
				}),
				body: new Prop({
					get: function(){
						return body;
					}
				}),
				children: new Prop({
					get:function(){
						return widgets;
					}
				}),
				type: new Prop({
					get: function(){
						return props.type;
					}
				}),
				on: function(){
					return ret(this.body.on.apply(this.body,arguments));
				},
				fire: function(){
					return ret(this.body.fire.apply(this.body,arguments));
				},
				height: function(){
					return ret(this.body.height.apply(this.body,arguments));
				},
				width: function(){
					return ret(this.body.width.apply(this.body,arguments));
				},
				render: function(){
					var i,value;
					if(body){
						body.drop('*').off();
						if(self.value){
							try{
								value = self.value;
							}catch(e){}
						}
					}else{
						body = dom.create(this.tagName);
					}
					body.css(self.css).attr(self.attributes).attr({id:id});
					if(props.events !== undefined){
						for(i in props.events){
							body.on(i,props.events[i]);
						}
					}
					if(widgets.length>0){
						for(i in widgets){
							widgets[i].render();
							body.append(widgets[i].body);
						}
					}
					render.call(self);
					if(self.value){
						try{
							self.value = value;
						}catch(e){}
					}
					return self;
				},
				add: function(widget){
					widget.parent = self;
					widgets.push(widget);
					self.render();
					return self;
				},
				remove: function(widget){
					for(var i in widgets){
						if(widgets[i] === widget){
							widgets.splice(i,1);
						}
					}
					self.render();
					return self;
				},
				empty: function(){
					widgets = [];
					self.render();
					return self;
				}
			});
			self.render();
			return self;
		},
		widget: new Module({
			types: new Prop({
				get: function(){
					return types;
				}
			}),
			type: function(name){
				var r = false;
				types.each(function(i){
					if(types[i].name == name){
						r = types[i];
					}
				});
				return r;
			}
		})
	});
})(window);