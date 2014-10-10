//staticMethod
var trim = $.trim,
	each = $.each,
	extend = $.extend,
	toStr = Object.prototype.toString,
	isObject = function(obj) {
		return toStr.call(obj) === '[object Object]';
	},
	isArray = Array.isArray || function(obj) {
		return toStr.call(obj) === '[object Array]';
	},
	isFunction = function(obj) {
		return toStr.call(obj) === '[object Function]';
	},
	isString = function(obj) {
		return toStr.call(obj) === '[object String]';
	},
	inArray = $.inArray,
	noop = $.noop,
	$data = $.data;
