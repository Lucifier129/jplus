//staticMethod
var toStr = Object.prototype.toString;
var isObject = isType('Object');
var isFunction = isType('Function');
var isString = isType('String');
var isArray = Array.isArray || isType('Array');

var trim = $.trim;
var each = $.each;
var extend = $.extend;
var inArray = $.inArray;

function isType(type) {
	return function(obj) {
		return toStr.call(obj) === '[object ' + type + ']';
	};
}