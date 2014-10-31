//plus.js


extend($.fn, {
	/**
	*@param {object|array} api  一个或多个包含jQ方法及其参数的对象
	*/
	render: function(api) {
		var self = this,
			$fn = $.fn;

		function invoke(key, value) {
			var $method = $fn[key];
			$method && $method[isArray(value) ? 'apply' : 'call'](self, value);
		}

		if (isObject(api)) {

			each(api, invoke);

		} else if (isArray(api)) {

			each(api, function() {
				each(this, invoke);
			});

		}

		return this;
	},
	/**
	*@param {object} 数据模型 与refresh方法的参数相同
	*@returns {object} 返回被侦听了属性变化的对象
	*/
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

/**@function define
*@param {string} 作用域选择器 合法的jquery选择器
*@param {function} 回调函数 定义一个数据模型
*@retruns {object} 返回被侦听了属性变化的对象
*/
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
	/**@function ready
	*@param {function} 回调函数 当文档加载完毕vm扫描完毕时即调用
	*/
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