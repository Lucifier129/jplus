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
	isObject = $.isPlainObject,
	isFunction = $.isFunction,
	isString = function(obj) {
		return typeof obj === 'string';
	},
	noop = $.noop,
	toStr = Object.prototype.toString,
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

scan.fn = scan.init.prototype = scan.prototype = extend(inherit($.fn), {
	collect: function(base) {
		var self = this;
		walkTheDOM(base || this[0], function(node) {
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
				var instance = self.hasOwnProperty(prop) && self[prop];
				if (!instance) {
					instance = self[prop] = instantiation();
					extend(instance, this);
				}
				instance[instance.length++] = node;
			});
		}
		if (noscan !== undefined) return true;
	}
});

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

$.fn.getVM = function(rescan) {
	var vmodel;
	if (rescan || !(vmodel = this.data('vmodel'))) {
		vmodel = this.data('vmodel', scan(this[0]).collect()).data('vmodel');
	}
	return vmodel;
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
		vmodel = self.getVM();
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
		return this;
	});
}
//observe.js

var doc = document,
    head = doc.getElementsByTagName('head')[0],
    comment = doc.createComment('Kill IE'),
    NATIVE_RE = /\[native code\]/,
    defineSetter,
    observeProp,
    ES5;

function randomStr() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

if (NATIVE_RE.test(Object.defineProperty) && NATIVE_RE.test(Object.create)) {
    ES5 = true;
    defineSetter = function(obj, propName, setter) {
        var value = obj[propName] || 'undefined';
        delete obj[propName];
        Object.defineProperty(obj, propName, {
            get: function() {
                return value;
            },
            set: function(v) {
                value = v;
                setter.call(this, propName, v);
            }
        });
    };
} else if (NATIVE_RE.test(Object.prototype.__defineSetter__)) {
    ES5 = true;
    defineSetter = function(obj, propName, setter) {
        var value = obj[propName] || 'undefined';
        delete obj[propName];
        Object.prototype.__defineGetter__.call(obj, propName, function() {
            return value;
        });
        Object.prototype.__defineSetter__.call(obj.propName, function(v) {
            value = v;
            setter.call(this, propName, v);
        });
    };
} else if ('onpropertychange' in head) {
    defineSetter = function(obj, propName, setter) {
        if (!obj.onpropertychange) {
            obj.onpropertychange = function(e) {
                var attrName = (e || window.event).propertyName;
                attrName in this.__setters__ && setter.call(this, attrName, this[attrName]);
            }
        }
    };
}

observeProp = function(obj, propName, setter) {
    var name = propName.split('.');
    propName = name[0];
    name = name[1];
    if (!(propName in obj.__setters__)) {
        obj.__setters__[propName] = {};
        defineSetter(obj, propName, function(key, value) {
            var self = this;
            each(self.__setters__[key], function() {
                this.call(self, key, value);
            });
        });
    }
    obj.__setters__[propName][name || 'observe' + randomStr()] = setter;
    return obj;
}

function checkPropName(propName) {
    if ($.ES5) {
        return true;
    }
    if (propName in comment) {
        throw new Error('If you want to support IE6/7/8. The property name [' + propName + '] can not be observed, because DOM has the same property name. You can use the [jQuery.ES5 = true] to ignore IE6/7/8.');
    } else {
        return true;
    }
}

var observeProto = {
    on: function() {
        var self = this,
            args = slice.call(arguments),
            key;

        if (args.length === 1) {
            args = args[0];
            if (isObject(args)) {
                each(args, function(propName, setter) {
                    checkPropName(propName) && observeProp(self, propName, setter);
                });
            } else if (isFunction(args)) {
                for (key in self.__oldValue__) {
                    self.__oldValue__.hasOwnProperty(key) && checkPropName(key) && observeProp(self, key, args);
                }
            }
        } else if (args.length === 2 && isString(args[0]) && isFunction(args[1])) {
            checkPropName(args[0]) && observeProp(self, args[0], args[1]);
        }

        return this;
    },
    off: function() {
        var self = this,
            args = slice.call(arguments);

        if (args.length === 0) {
            each(self.__setters__, function(key) {
                self.__setters__[key] = {};
            });
        } else if (args.length >= 1) {
            each(args, function() {
                var index = this.indexOf('.'),
                    propName,
                    name;
                if (index === 0) {
                    name = this.substr(1);
                    each(self.__setters__, function() {
                        name in this && delete this[name];
                    });
                } else if (index > 0) {
                    propName = this.substr(0, index);
                    name = this.substr(index + 1);
                    name in self.__setters__[propName] && delete self.__setters__[propName];
                } else if (this in self.__setters__) {
                    delete self.__setters__[this];
                }
            });
        }
        return this;
    },
    each: function(callback) {
        var obj = this.__oldValue__;
        for (var key in obj) {
            callback.call(this, key, this[key]);
        }
        return this;
    },
    extend: function() {
        var self = this,
            args = slice.call(arguments);
        extend.apply(null, [this.__oldValue__].concat(args));
        extend.apply(null, [this].concat(args));
        return this;
    }
};


$.observe = ES5 ? function(obj) {
    var ret = inherit(observeProto);
    ret.__setters__ = {};
    ret.__oldValue__ = extend(true, {}, obj);
    return extend(ret, obj);
} : function(obj) {
    var ret = head.appendChild(doc.createComment('[object Object]'));
    ret.__setters__ = {};
    ret.__oldValue__ = extend(true, {}, obj);
    return extend(ret, observeProto, obj);
};
}(jQuery || Zepto, this));