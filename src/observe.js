//observe.js

var head = document.getElementsByTagName('head')[0],
    NATIVE_RE = /\[native code\]/,
    defineSetter,
    observeProp;

function randomStr() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

if (NATIVE_RE.test(Object.defineProperty)) {
    defineSetter = function(obj, propName, setter) {
        var value = obj[propName] || 'undefined';
        delete obj[propName];
        Object.defineProperty(obj, propName, {
            get: function() {
                return value;
            },
            setter: function(v) {
                value = v;
                setter.call(this, propName, v);
            }
        });
    }
} else if (NATIVE_RE.test(Object.prototype.__defineSetter__)) {
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
    }
} else if ('onpropertychange' in head) {
    defineSetter = function(obj, propName, setter) {
        if (!obj.onpropertychange) {
            obj.onpropertychange = function(e) {
                var attrName = (e || window.event).propertyName;
                attrName in obj.__setters__ && setter.call(this, attrName, this[attrName]);
            }
        }
    }
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

var observeProto = {
    on: function() {
        var self = this,
            args = slice.call(arguments);

        if (args.length === 1 && isObject(args[0])) {
            if (isObject(args[0])) {
                each(args[0], function(propName, setter) {
                    observeProp(self, propName, setter);
                });
            } else if (isFunction(args[0])) {
                for (var key in self) {
                    self.hasOwnProperty(key) && key !== '__setters__' && observeProp(self, key, args[0]);
                }
            }
        } else if (args.length === 2 && isString(args[0]) && isFunction(args[1])) {
            observeProp(self, args[0], args[1]);
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
    }
}