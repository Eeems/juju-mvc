new WidgetType({
	name: 'save',
	tagName: 'button',
	init: function(config){
		this.label = config.label===undefined?'Save':config.label;
	},
	render: function(){
		var self = this;
		self.body
			.attr({
				value: self.label
			})
			.text(self.label)
			.on('click',function(){
				self.record.commit();
			});
	}
});