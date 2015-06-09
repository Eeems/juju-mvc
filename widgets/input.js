new WidgetType({
	name: 'input',
	tagName: 'div',
	init: function(config){
		
	},
	render: function(){
		var self = this;
		dom.create('input')
			.appendTo(this.body)
			.attr({
				id: this.id+'-input'
			})
			.val(this.value)
			.on('change',function(){
				self.value = this.value;
			});
		dom.create('label')
			.appendTo(this.body)
			.attr({
				id: this.id+'-label',
				for: this.id+'-input'
			});
	},
	value: function(val){
		this.body.get('input').value = val;
	}
});