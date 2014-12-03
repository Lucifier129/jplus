//observe.js

function throwErr(msg) {
	throw new Error(msg)
}

function randomStr(prefix) {
	return prefix + Math.random().toString(36).substr(2)
}

var nextTick = function(fn) {
	return setTimeout(fn, 0)
}


var doc = document
var head = doc.getElementsByTagName('head')[0]
var comment = doc.createComment('Kill IE6/7/8')
var NATIVE_RE = /\[native code\]/
var ES5

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(value) {
		for (var i = this.length - 1; i >= 0; i--) {
			if (this[i] === value) {
				return i
			}
		}
		return -1
	}
}

var defineProperty

if (NATIVE_RE.test(Object.defineProperty) && NATIVE_RE.test(Object.create)) {
	defineProperty = Object.defineProperty
} else if (NATIVE_RE.test(Object.prototype.__defineSetter__)) {
	defineProperty = function(obj, propName, descriptor) {
		obj.__defineGetter__(propName, descriptor.get)
		obj.__defineSetter__(propName, descriptor.set)
	}
}

var observeProperty

if (defineProperty) {
	ES5 = true
	observeProperty = function(obj, propName) {
		var events = obj.__events__
		if (propName in events) {
			return
		}
		var value = obj[propName]
		var oldValue
		var holding

		function trigger() {
			each(events[propName], function(callbacks) {
				each(callbacks, function(callback) {
					callback.call(obj, value, propName, oldValue)
				})
			})
			oldValue = typeof value === 'object' ? isArr(value) ? value.concat() : extend(true, {}, value) : value
			holding = false
		}

		defineProperty(obj, propName, {
			get: function() {
				return value
			},
			set: function(v) {
				value = v
				if (holding || _.isEqual(v, oldValue)) {
					return
				}
				holding = true
				nextTick(trigger)
			}
		})
	}
} else if ('onpropertychange' in head) {
	observeProperty = function(obj, propName) {
		if (obj.onpropertychange) {
			return
		}
		var oldValues = {}
		var holding = {}

		function trigger(propName, events) {
			var oldValue = oldValues[propName]
			var value = obj[propName]
			if (_.isEqual(value, oldValue)) {
				return
			}
			each(events, function(callbacks) {
				each(callbacks, function(callback) {
					callback.call(obj, value, propName, oldValue)
				})
			})
			oldValues[propName] = typeof value === 'object' ? isArr(value) ? value.concat() : extend(true, {}, value) : value
			holding[propName] = false
		}

		obj.onpropertychange = function(e) {
			e = e || window.event
			var propName = e.propertyName
			var events = this.__events__
			if (propName in events) {
				if (holding[propName]) {
					return
				}
				holding[propName] = true
				nextTick(function() {
					trigger(propName, events[propName])
				})
			}
		}
	}
}

function checkPropName(propName) {
	if (createObserver.ES5) {
		return
	}
	if (propName in comment) {
		throw new Error(
			'If you want to support IE6/7/8. The property name [' + propName + '] can not be observed, ' +
			'because DOM has the same property name. ' +
			'You can use the [jQuery.ES5 = true] to ignore IE6/7/8.'
		)
	}
}


var observer = {
	filter: '__events__ _add _remove on off offAll each extend once hold filter'.split(' '),

	_add: function(prop, callback, name) {
		checkPropName(prop)
		observeProperty(this, prop)
		name = name || randomStr('observer')
		this.__events__[prop] = this.__events__[prop] || {}
		this.__events__[prop][name] = this.__events__[prop][name] || []
		this.__events__[prop][name].push(callback)
		return this
	},
	on: function() {
		var that = this
		var args = slice(arguments)
		var argsLen = args.length
		var arg

		if (argsLen === 1) {
			if (isObj(arg = args[0])) {
				each(arg, function(callback, prop) {
					that.on(prop, callback)
				})
			} else if (isFn(arg)) {
				this.each(function(value, prop) {
					that._add(prop, arg, '__all__')
				})
			}
		} else if (argsLen === 2) {
			if (!isFn(arg[1])) {
				return this
			}
			if (isStr(arg = arg[0])) {
				var index = arg.indexOf('.')
				if (index <= 0) {
					this._add(arg, args[1])
				} else {
					this._add(arg.substr(0, index), args[1], arg.substr(index + 1))
				}
			} else if (isArr(arg)) {
				each(arg, function(prop) {
					that.on(prop, arg[1])
				})
			}
		}
		return this
	},

	_remove: function(prop, callback, name) {
		var callbacks = this.__events__[prop][name] || []
		var index = callbacks.indexOf(callback)
		if (index !== -1) {
			callbacks.splice(index, 1)
		}
		return this
	},

	off: function() {
		var that = this
		var args = slice(arguments)
		var argsLen = args.length
		var arg
		var index

		if (!argsLen) {
			this.__events__ = {}
		} else if (argsLen === 1) {
			if (isFn(arg = argsLen[0])) {
				each(this.__events__, function(eventsList, prop) {
					each(eventsList, function(callbacks, name) {
						that._remove(prop, arg, name)
					})
				})
			} else if (isStr(arg)) {
				index = arg.index('.')
				if (index <= 0) {
					this.__events__[arg] = {}
				} else {
					delete this.__events__[arg.substr(0, index)][arg.substr(index + 1)]
				}
			}
		} else if (argsLen === 2) {
			if (!isFn(args[1])) {
				this.off(args[0])
				return this
			}
			if (isStr(arg = args[0])) {
				index = arg.index('.')
				if (index <= 0) {
					each(this.__events__[arg], function(callbacks, name) {
						that._remove(arg, args[1], name)
					})
				} else {
					this._remove(arg.substr(0, index), args[1], arg.substr(index + 1))
				}
			} else if (isArr(arg)) {
				each(arg, function(prop) {
					that.off(prop, args[1])
				})
			}
		}

		return this
	},

	offAll: function() {
		var that = this
		each(this.__events__, function(eventsList, prop) {
			that.off([prop, '__all__'].join('.'))
		})
		return this
	},

	each: function(fn) {
		var that = this

		if (this.nodeName) {
			for (var prop in this) {
				if (that.filter.indexOf(prop) === -1 && !(prop in comment)) {
					fn.call(that, this[prop], prop)
				}
			}
		} else {
			each(this, function(value, prop) {
				if (that.filter.indexOf(prop) === -1) {
					fn.call(that, value, prop)
				}
			})
		}


		return this
	},

	extend: function() {
		return extend.apply(global, [this].concat(slice(arguments)))
	},

	once: function(prop, callback) {
		var that = this
		prop += ".once"

		function wrapper() {
			callback.apply(that, arguments)
			that.off(prop, callback)
		}
		this.on(prop, wrapper)
	},

	hold: function(prop, times, callback) {

		if (!(times === +times && times >= 0)) {
			throwErr(times + '不是一个正整数')
		}

		var that = this

		function wrapper() {
			if (--times <= 0) {
				callback.apply(that, arguments)
			}
		}

		this._add(prop, wrapper)

		return wrapper

	}
}

var createObserver = ES5 ? function(source, setters) {
	if (!isObj(source)) {
		return {}
	}
	var result = extend(inherit(observer), source, {
		__events__: {}
	})
	return isObj(setters) || isFn(setters) ? result.on(setters) : result
} : function(source, setters) {
	if (!isObj(source)) {
		return {}
	}
	var result = extend(head.appendChild(doc.createComment('[object Object]')), observer, source, {
		__events__: {}
	})
	return isObj(setters) || isFn(setters) ? result.on(setters) : result
}

createObserver.ES5 = false