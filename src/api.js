//plus.js

extend($.fn, {
	render: function(api) {
		var that = this
		var $fn = $.fn

		function invoke(value, key) {
			var $method = $fn[key]
			isFn($method) && $method[isArr(value) ? 'apply' : 'call'](that, value)
		}

		if (isObj(api)) {

			each(api, invoke)

		} else if (isArr(api)) {

			each(api, function(theApi) {
				if (isObj(theApi)) {
					each(theApi, invoke)
				}
			})

		}

		return this
	},

	listen: function(model) {
		var that = this
		that.refresh(model)
		return $.observe(model, function(value, key) {
			var o = {}
			o[key] = value
			that.refresh(o)
		})
	}
});

$.define = function(name, callback) {
	var target = $(name)
	var model;
	if (!target.length) return
	model = {}
	model = callback(model) || model
	return target.listen(model)
};

$.render = function(models) {
	$('[render]').each(function() {
		var $this = $(this)
		var key = $this.attr('render')
		var mod
		key in models && isObj(mod = models[key]) && $this.render(mod)
	})
	return this
};

var $module = {
	vmodel: {},

	ready: function(callback) {
		var self = this
		$(document).ready(function() {
			callback.call(self.$scan())
		})
		return this
	},
	$scan: function() {
		var self = this
		$('[app]').each(function() {
			var $this = $(this)
			var appName = $this.attr('app')
			var status = false
			self.vmodel[appName] = $this.scanView()
			self.on(appName + '.module', function(model, appName) {
				if (status || !isObj(model)) return
				status = true
				this[appName] = $this.listen(model)
				status = false
			})
		})
		return this
	}
}

$.module = $.observe($module)