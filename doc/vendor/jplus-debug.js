/*==================================================
 Copyright 2014 Jade Gu
 http://weibo.com/islucifier
 Released under the MIT license
2014.10.06
 ==================================================*/
;(function($, undefined) {
	'use strict';
//arr
var arr = [],
	push = arr.push,
	slice = arr.slice;
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
					args: arr
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
	rescan: function() {
		return this.clean().collect();
	},
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

$.fn.refresh = function(model, repeat) {
	var self = this,
		vmodel = self.getVM();
	each(model, function(prop, value) {
		if (!(prop in vmodel)) return;
		var target = vmodel[prop],
			method = target.method,
			args = target.args,
			$method = method in $.fn,
			isArr = isArray(value),
			cloneArr,
			multiple,
			tpl;

		if (isArr) {
			multiple = isMultipleArgs(value);
		}

		switch (true) {
			case $method && isArr && multiple:
				$method = $.fn[method];
				if (repeat) {
					cloneArr = [];
					tpl = target.eq(0);
					each(value, function(i) {
						var item = target.eq(i);
						if (!item.length) {
							item = tpl.clone(true, true);
							cloneArr.push(item[0]);
						}
						$method.apply(item, args.concat(this));
					});

					if (cloneArr.length) {
						var $clone = instantiation();
						push.apply($clone, cloneArr);
						target.eq(-1).after($clone);
						push.apply(target, cloneArr);
					}
				}
				each(target, function(i) {
					$method.apply($(this), args.concat(value[i]))
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
    UNDEFINED = 'undefined',
    defineSetter,
    observeProp,
    ES5;

function nextTick(fn) {
    return setTimeout(fn, 4);
}

function randomStr() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

if (NATIVE_RE.test(Object.defineProperty) && NATIVE_RE.test(Object.create)) {
    ES5 = true;
    defineSetter = function(obj, propName, setter) {
        var value = obj[propName] || UNDEFINED,
            status = true;
        function trigger() {
            setter.call(obj, value, propName, obj.__oldValues__[propName]);
            obj.__oldValues__[propName] = value;
            status = true;
        }
        delete obj[propName];
        Object.defineProperty(obj, propName, {
            get: function() {
                return value;
            },
            set: function(v) {
                value = v;
                if (status) {
                    status = false;
                    nextTick(trigger);
                }
            }
        });
    };
} else if (NATIVE_RE.test(Object.prototype.__defineSetter__)) {
    ES5 = true;
    defineSetter = function(obj, propName, setter) {
        var value = obj[propName] || UNDEFINED,
            status = true;

        function trigger() {
            setter.call(obj, value, propName, obj.__oldValues__[propName]);
            obj.__oldValues__[propName] = value;
            status = true;
        }
        Object.prototype.__defineGetter__.call(obj, propName, function() {
            return value;
        });
        Object.prototype.__defineSetter__.call(obj, propName, function(v) {
            value = v;
            if (status) {
                status = false;
                nextTick(trigger);
            }
        });
    };
} else if ('onpropertychange' in head) {
    defineSetter = function(obj, propName, setter) {
        var status;
        if (!obj.onpropertychange) {
            status = {};
            obj.onpropertychange = function(e) {
                var self = this,
                    attrName = (e || window.event).propertyName;
                if (attrName in this.__setters__) {
                    if (status[attrName] === undefined) {
                        status[attrName] = true;
                    }
                    if (status[attrName]) {
                        status[attrName] = false;
                        nextTick(function() {
                            setter.call(self, self[attrName], attrName, self.__oldValues__[attrName]);
                            self.__oldValues__[attrName] = self[attrName];
                            status[attrName] = true;
                        });
                    }
                }
            };
        }
    };
}

observeProp = function(obj, propName, setter) {
    var name = propName.split('.');
    propName = name[0];
    name = name[1];
    if (!(propName in obj.__setters__)) {
        obj.__setters__[propName] = {};
        defineSetter(obj, propName, function(value, key, oldValue) {
            var self = this;
            each(self.__setters__[key], function() {
                this.call(self, value, key, oldValue);
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
    add: function(propName, value) {
        this.__oldValues__[propName] = this[propName] = value || UNDEFINED;
        return this;
    },
    remove: function(propName) {
        delete this.__oldValues__[propName];
        if ('onpropertychange' in this && this.nodeName !== undefined) {
            this.removeAttribute(propName);
        } else {
            delete this[propName];
        }
        return this;
    },
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
                each(self.__oldValues__, function(propName) {
                    checkPropName(propName) && observeProp(self, propName, args);
                });
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
                    name in self.__setters__[propName] && delete self.__setters__[propName][name];
                } else if (this in self.__setters__) {
                    self.__setters__[this] = {};
                }
            });
        }
        return this;
    },
    each: function(callback) {
        var self = this;
        each(self.__oldValues__, function(key) {
            callback.call(self, key, self[key]);
        });
        return this;
    },
    extend: function() {
        var args = slice.call(arguments);
        extend.apply(null, [this.__oldValues__].concat(args));
        return extend.apply(null, [this].concat(args));
    }
};


$.observe = ES5 ? function(obj) {
    var ret = inherit(observeProto);
    ret.__setters__ = {};
    ret.__oldValues__ = extend(true, {}, obj);
    return extend(ret, obj);
} : function(obj) {
    var ret = head.appendChild(doc.createComment('[object Object]'));
    ret.__setters__ = {};
    ret.__oldValues__ = extend(true, {}, obj);
    return extend(ret, observeProto, obj);
};
//plus.js
$.fn.extend({
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
		return $.observe(model).on(function(value, key) {
			var o = {};
			o[key] = value;
			self.refresh(o, true);
		}).extend(model);
	}
});

$.module = function(name, callback) {
	var target = $(name),
		model;
	if (!target.length) return;
	model = {};
	model = callback(model) || model;
	return target.listen(model);
};
}(jQuery || Zepto));