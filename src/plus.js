//plus.js
$.fn.extend({
	render: function(api) {
		if (!isObject(api)) return;
		var self = this,
			$fn = $.fn;
		each(api, function(key, value) {
			var $method = $fn[key];
			$method && $method[isArray(value) ? 'apply' : 'call'](self, value);
		});
		return this;
	},
	listen: function(model) {
		var self = this;
		return $.observe(model).on(function(value, key) {
			var o = {};
			o[key] = value;
			self.refresh(o, true);
		}).extend(model);
	}
});

$.module = function(name, callback) {
	var target = $(name),
		model;
	if (!target.length) return;
	model = {};
	model = callback(model) || model;
	return target.listen(model);
};