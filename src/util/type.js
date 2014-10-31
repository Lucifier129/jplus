define([
	'util/toStr'
], function(toStr) {
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
		}
	};
});