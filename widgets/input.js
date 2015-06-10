new WidgetType({
	name: 'input',
	tagName: 'div',
	init: function(config){
		if(!config.name){
			throw new Error('Input name must be defined');
		}
	},
	render: function(){
		var self = this;
		dom.create('input')
			.appendTo(this.body)
			.attr({
				id: this.id+'-input'
			})
			.on('change',function(){
				self.value = this.value;
			})
			.val(this.value);
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