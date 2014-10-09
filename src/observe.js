//observe.js
var doc = document,
    head = doc.getElementsByTagName('head')[0],
    comment = doc.createComment('Kill IE6/7/8'),
    NATIVE_RE = /\[native code\]/,
    UNDEFINED = 'undefined',
    defineSetter,
    ES5;

function nextTick(fn) {
    return setTimeout(fn, 4);
}

function randomStr() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}


var def = {
    'defineProperty': NATIVE_RE.test(Object.defineProperty) && NATIVE_RE.test(Object.create) && Object.defineProperty,
    '__defineSetter__': NATIVE_RE.test(Object.prototype.__defineSetter__) && Object.prototype.__defineSetter__,
    '__defineGetter__': NATIVE_RE.test(Object.prototype.__defineGetter__) && Object.prototype.__defineGetter__
}

if (!def.defineProperty && def.__defineSetter__) {
    def.defineProperty = function(obj, propName, descriptor) {
        def.__defineGetter__.call(obj, propName, descriptor.get);
        def.__defineSetter__.call(obj, propName, descriptor.set);
    };
}

if (def.defineProperty) {
    ES5 = true;
    defineSetter = function(obj, propName, setter) {
        var value = obj[propName] || UNDEFINED,
            status = true;

        function trigger() {
            var oldValue = obj.$$oldValues[propName];
            if (oldValue === value) return;
            setter.call(obj, value, propName, oldValue);
            obj.$$oldValues[propName] = value;
            status = true;
        }
        delete obj[propName];
        def.defineProperty(obj, propName, {
            get: function() {
                return value;
            },
            set: function(v) {
                value = v;
                if (!status) return;
                status = false;
                nextTick(trigger);
            }
        });
    };
} else if ('onpropertychange' in head) {
    defineSetter = function(obj, propName, setter) {
        var status;
        if (obj.onpropertychange) return;
        status = {};
        obj.onpropertychange = function(e) {
            var self = this,
                attrName = (e || window.event).propertyName;

            if (!(attrName in this.$$setters)) return;
            if (status[attrName] === undefined) {
                status[attrName] = true;
            }
            if (!status[attrName]) return;

            status[attrName] = false;
            nextTick(function() {
                var oldValue = self.$$oldValues[attrName];
                if (oldValue === self[attrName]) return;
                setter.call(self, self[attrName], attrName, oldValue);
                self.$$oldValues[attrName] = self[attrName];
                status[attrName] = true;
            });
        };
    };
}

function observeProp(obj, propName, setter) {
    var name = propName.split('.');
    propName = name[0];
    name = name[1];
    if (!(propName in obj.$$setters)) {
        obj.$$setters[propName] = {};
        defineSetter(obj, propName, function(value, key, oldValue) {
            var self = this;
            each(self.$$setters[key], function() {
                this.call(self, value, key, oldValue);
            });
        });
    }
    obj.$$setters[propName][name || 'observe' + randomStr()] = setter;
    return obj;
}

function checkPropName(propName) {
    if ($.ES5) return true;
    if (propName in comment) {
        throw new Error(
            'If you want to support IE6/7/8. The property name [' + propName + '] can not be observed, ' +
            'because DOM has the same property name. ' +
            'You can use the [jQuery.ES5 = true] to ignore IE6/7/8.'
        );
    }
    return true;
}


function Observe(source) {
    this.source = source;
}

Observe.prototype = {
    $$proto: {
        add: function(propName, value) {
            this.$$oldValues[propName] = this[propName] = value || UNDEFINED;
            return this;
        },
        remove: function(propName) {
            delete this.$$oldValues[propName];
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
                    each(self.$$oldValues, function(propName) {
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
                each(self.$$setters, function(key) {
                    self.$$setters[key] = {};
                });
            } else if (args.length >= 1) {
                each(args, function() {
                    var index = this.indexOf('.'),
                        propName,
                        name;
                    if (index === 0) {
                        name = this.substr(1);
                        each(self.$$setters, function() {
                            name in this && delete this[name];
                        });
                    } else if (index > 0) {
                        propName = this.substr(0, index);
                        name = this.substr(index + 1);
                        name in self.$$setters[propName] && delete self.$$setters[propName][name];
                    } else if (this in self.$$setters) {
                        self.$$setters[this] = {};
                    }
                });
            }
            return this;
        },
        each: function(callback) {
            var self = this;
            each(self.$$oldValues, function(key) {
                callback.call(self, key, self[key]);
            });
            return this;
        },
        extend: function() {
            return extend.apply(null, [this].concat(slice.call(arguments)));
        }
    },
    init: ES5 ? function() {
        var source = this.source,
            target = inherit(this.$$proto),
            oldValues = target.$$oldValues = {},
            initValue = '$.observe' + randomStr();

        target.$$setters = {};
        for (var prop in source) {
            oldValues[prop] = initValue;
        }
        return extend(target, source);
    } : function() {
        var source = this.source,
            target = head.appendChild(doc.createComment('[object Object]')),
            oldValues = target.$$oldValues = {},
            initValue = '$.observe' + randomStr();
        target.$$setters = {};
        for (var prop in source) {
            oldValues[prop] = initValue;
        }
        return extend(target, this.$$proto, source);
    }
}


$.observe = function(source) {
    return new Observe(source).init();
}