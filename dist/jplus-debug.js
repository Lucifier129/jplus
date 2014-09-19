/*==================================================
 Copyright 2014 Jade Gu
 http://weibo.com/islucifier
 Released under the MIT license
 refresh.js 2014.9.19
 ==================================================*/
;(function($, root, undefined) {
	'use strict';
//arr
var arr = [],
	push = arr.push,
	slice = arr.slice,
	splice = arr.splice;
//staticMethod
var trim = $.trim,
	each = $.each,
	extend = $.extend,
	isArray = $.isArray,
	isObject = $.isObject,
	isFunction = $.isFunction,
	noop = $.noop,
	$data = $.data;

//inherit
var inherit = Object.create || function(proto) {
	var F = function() {};
	F.prototype = proto;
	return new F();
};
//parseAttr
var SEMICOLON_RE = /[^;]+/g,
	COLON_RE = /[^:]+/g,
	DASH_RE = /[^-]+/g;

function parseJsAttr(attrValue) {
	return arrToObj(attrToArr(attrValue));
}

function attrToArr(attrValue) {
	var ret = trim(attrValue).match(SEMICOLON_RE);
	return each(ret, function(i, value) {
		var item = ret[i] = trim(value).match(COLON_RE);
		item[0] = trim(item[0]);
		item[1] && (item[1] = trim(item[1]));
		if (item[0].indexOf('-') !== -1) {
			item[0] = trim(item[0]).match(DASH_RE);
		}

	});
}

function arrToObj(attrValueArr) {
	var ret = {};
	each(attrValueArr, function() {
		var item = this;

		switch (true) {
			case item.length === 1:
				ret[item[0]] = {};
				break;
			case isArray(item[0]):
				ret[item[1]] = {
					method: item[0][0],
					args: item[0].slice(1)
				};
				break;
			case item[0] in $.fn:
				ret[item[1]] = {
					method: item[0],
					args: []
				};
				break;
			default:
				ret[item[0]] = {
					method: noop
				};
		}

	});
	return ret;
}
//scan
//requrie arr.js/inherit.js/parseAttr.js/staticMethod.js
function scan(node) {
	return new scan.init(node);
}

scan.init = function(node) {
	this[0] = node;
}

scan.init.prototype = scan.prototype = {
	collect: function() {
		var self = this;
		walkTheDOM(this[0], function(node) {
			return self.getAttr(node);
		});
		return this;
	},
	clean: function(deep) {
		var item,
			key;
		for (key in this) {
			if (this.hasOwnProperty(key)) {
				item = this[key];
				item.removeAttr && item.removeAttr('js');
				deep && delete this[key];
			}
		}
		return this;
	},
	getAttr: function(node) {
		if (/text/.test(node.nodeName)) return;
		var self = this,
			$node = $(node),
			noscan = $node.attr('noscan'),
			jsAttrValue = $node.attr('js');

		if (jsAttrValue) {
			each(parseJsAttr(jsAttrValue), function(prop) {
				var instance = self[prop];
				if (!instance) {
					instance = self[prop] = instantiation();
					extend(instance, this);
				}
				instance[instance.length++] = node;
			});
		}

		if (noscan !== undefined) return true;
	}
};

function walkTheDOM(node, func) {
	if (func(node)) return;
	node = node.firstChild;
	while (node) {
		walkTheDOM(node, func);
		node = node.nextSibling;
	}
}

function removeAttr(node) {
	$(node).removeAttr('js');
}

function instantiation() {
	var obj = inherit($.fn);
	obj.length = 0;
	return obj;
}

$.fn.scan = function(rescan) {
	var vmodel;
	if (rescan || !(vmodel = this.data('vmodel'))) {
		vmodel = this.data('vmodel', scan(this[0]).collect()).data('vmodel');
	}
	return vmodel
};
//refresh
//requrie scan.js
function isMultipleArgs(arr) {
	if (!$.isArray(arr)) {
		return false;
	}
	var len = arr.length,
		type,
		i;
	if (len > 1) {
		type = $.type(arr[0]);
		for (i = len - 1; i >= 0; i--) {
			if ($.type(arr[i]) !== type) {
				return false;
			}
		}
		return true;
	}
	return false;
}

$.fn.refresh = function(model) {
	var self = this,
		vmodel = self.scan();

	each(model, function(prop, value) {
		if (!(prop in vmodel)) return;
		var target = vmodel[prop],
			method = target.method,
			args = target.args,
			$method = method in $.fn,
			isArr = isArray(value),
			multiple;

		if (isArr) {
			multiple = isMultipleArgs(value);
		}

		switch (true) {
			case $method && isArr && multiple:
				each(target, function(i) {
					$.fn[method].apply($(this), args.concat(value[i]))
				});
				break;

			case $method:
				$.fn[method].apply(target, args.concat(value));
				break;

			default:
				method = value;
				args = method.args || arr;
				args = isArray(args) ? args : [args];
				multiple = isMultipleArgs(args);

				each(target, function(i) {
					method.apply($(this), multiple ? args[i] : args);
				});
		}

	});
}
}(jQuery || Zepto, this));