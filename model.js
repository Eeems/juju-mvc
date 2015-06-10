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
				fetch('app/models/'+name+'.js',{cache:'no-cache'}).then(function(res){
					res.text().then(function(text){
						return (new Function(text+';return Model;'))();
					}).then(function(config){
						resolve(new global.mvc.Model(name,config));
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
			if(config===undefined){
				throw new Error('There is no config data for '+name+' model');
			}
			var self = this,
				store = global.store(config.store.name),
				records = [],
				Record = function(config,data,id){
					if(config===undefined){
						throw new Error('There is no config data for '+name+' model records');
					}
					var record = this,
						dirty = false,
						i;
					if(typeof data != 'object'){
						data = {};
					}
					for(i in config){
						if(data[i]===undefined){
							data[i] = config[i].default;
							dirty = true;
						}
					}
					record.extend({
						id: new Prop({
							get: function(){
								return id;
							},
							set: function(i){
								id = i;
							}
						}),
						data: new Prop({
							get: function(){
								return data;
							},
							set: function(val){
								if(data != val){
									data = val;
								}
							}
						}),
						json: new Prop({
							get: function(){
								return JSON.stringify(data);
							}
						}),
						dirty: new Prop({
							get: function(){
								return dirty || !store.has(data);
							}
						}),
						rollback: function(){
							data = store.get(id);
							dirty = false;
							console.log('Record '+id+' rolled back from '+store.id,data);
							return self;
						},
						commit: function(){
							if(record.dirty){
								store.replace(id,data);
								if(!store.config.autocommit){
									model.commit();
								}
								console.log('Record '+id+' committed to '+store.id);
							}
							return this;
						}
					});
					return record;
				};
			if(!store){
				store = new Store(config.store.name,config.store);
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
				store: new Prop({
					readonly: true,
					value: store
				}),
				records: new Prop({
					get: function(){
						var records = [];
						self.each(function(){
							records.push(this);
						});
						return records;
					}
				}),
				length: new Prop({
					get: function(){
						return records.length;
					}
				}),
				each: function(fn){
					records.each(fn);
					return self;
				},
				get: function(id){
					return records[id]===undefined?false:records[id];
				},
				insert: function(id,data){
					if(data instanceof Record){
						data = Record.data;
					}
					records.insert(id,new Record(config.columns,data,id,self));
					console.log('New record for model '+name+' at position '+id,data);
					return self;
				},
				push: function(data){
					if(data instanceof Record){
						data = Record.data;
					}
					records.push(new Record(config.columns,data,records.length,self));
					console.log('New record for model '+name+' at position '+(records.length-1),data);
					return self;
				},
				remove: function(id){
					records.splice(id,1);
					self.sync();
					return self;
				},
				sync: function(){
					self.each(function(i){
						this.id = i;
					});
					return self;
				},
				rollback: function(){
					records = [];
					store.values.each(function(i){
						self.push(this);
					});
					return self;
				},
				commit: function(){
					while(store.length>self.length){
						store.pop();
					}
					self.sync();
					self.each(function(){
						this.commit();
					});
					return self;
				}
			});
			store.values.each(function(i){
				self.push(this);
			});
			models.push(self);
			return self;
		}
	});
})(window);