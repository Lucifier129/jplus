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