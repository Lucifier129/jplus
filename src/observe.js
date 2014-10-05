//observe.js
var doc = document,
    head = doc.getElementsByTagName('head')[0],
    comment = doc.createComment('Kill IE'),
    NATIVE_RE = /\[native code\]/,
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
        var value = obj[propName] || 'undefined',
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
        var value = obj[propName] || 'undefined',
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
        this.__oldValues__[propName] = this[propName] = value;
        return this;
    },
    remove: function(propName) {
        if ('onpropertychange' in this && this.nodeName !== undefined) {
            delete this.__oldValues__[propName];
            this.removeAttribute(propName);
        } else {
            delete this.__oldValues__[propName];
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