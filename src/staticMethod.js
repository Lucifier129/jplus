define(function() {
	var toStr = Object.prototype.toString;
	return {
		isObject: function(obj) {
			return obj == null ? obj : toStr.call(obj) === '[object Object]';
		},
		isArray: Array.isArray || function(obj) {
			return toStr.call(obj) === '[object Array]';
		},
		isFunction: function(obj) {
			return toStr.call(obj) === '[object Function]';
		},
		isString: function(obj) {
			return toStr.call(obj) === '[object String]';
		},
		trim: $.trim,
		each: $.each,
		extend: $.extend,
		inArray: $.inArray
	};
});