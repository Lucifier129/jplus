//plus.js
extend($.fn, {
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
		self.refresh(model);
		return $.observe(model).on(function(value, key) {
			var o = {};
			o[key] = value;
			self.refresh(o);
		});
	}
});

$.define = function(name, callback) {
	var target = $(name),
		model;
	if (!target.length) return;
	model = {};
	model = callback(model) || model;
	return target.listen(model);
};


var $module = {
	vmodel: {},
	ready: function(callback) {
		var self = this;
		$(document).ready(function() {
			callback.call(self.$scan());
		});
		return this;
	},
	$scan: function() {
		var self = this;
		$('[app]').each(function() {
			var $this = $(this),
				appName = $this.attr('app'),
				status = false;
			self.vmodel[appName] = $this.getVM();
			self.on(appName + '.module', function(model, appName) {
				if (status || !isObject(model)) return;
				status = true;
				this[appName] = $this.listen(model);
				status = false;
			});
		});
		return this;
	}
};

$.module = extend($.observe({}), $module);
