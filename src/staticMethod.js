//staticMethod
var trim = $.trim,
	each = $.each,
	extend = $.extend,
	isArray = $.isArray,
	isObject = $.isPlainObject,
	isFunction = $.isFunction,
	isString = function(obj) {
		return typeof obj === 'string';
	},
	noop = $.noop,
	toStr = Object.prototype.toString,
	$data = $.data;
