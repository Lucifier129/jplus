/**
 *File: jplus.js
 *Author: Jade
 *Date: 2014.11.20
 */
! function(global, undefined) {

//agent
function calling(fn) {
	return function() {
		return Function.prototype.call.apply(fn, arguments)
	}
}

var objProto = Object.prototype
var toStr = calling(objProto.toString)
var hasOwn = calling(objProto.hasOwnProperty)
var slice = calling(Array.prototype.slice)


function isType(type) {
	return function(obj) {
		return obj == null ? obj : toStr(obj) === '[object ' + type + ']'
	}
}

var isObj = isType('Object')
var isStr = isType('String')
var isFn = isType('Function')
var isArr = Array.isArray || isType('Array')

if (!String.prototype.trim) {
	var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
	String.prototype.trim = function() {
		return this.replace(rtrim, '')
	}
}


var _ = {
	keys: Object.keys || function(obj) {

		if (!isObj(obj)) {
			return []
		}

		var keys = []

		for (var key in obj) {
			if (hasOwn(obj, key)) {
				keys.push(key)
			}
		}

		return keys

	},

	values: function(obj) {

		var keys = this.keys(obj)
		var len = keys.length
		var values = new Array(len)

		for (var i = 0; i < len; i += 1) {
			values[i] = obj[keys[i]]
		}

		return values
	},

	invert: function(obj) {
		var ret = {}
		var keys = this.keys(obj)

		for (var i = 0, len = keys.len; i < len; i++) {
			ret[obj[keys[i]]] = keys[i]
		}

		return ret
	},

	parse: function(descri) {
		if (!isStr(descri)) {
			return {}
		}
		var ret = {}
		var group = descri.trim().split(';')
		each(group, function(value) {
			value = value.trim().split(':')
			if (value.length < 2) {
				return
			}
			ret[value[1].trim()] = value[0].trim()
		})

		return ret
	}
}

function each(obj, fn, context, useForIn) {
	if (obj == undefined || !isFn(fn)) {
		return obj
	}
	var len = obj.length
	var ret

	if (len === +len && len > 0 && !useForIn) {
		for (var i = 0; i < len; i += 1) {
			ret = fn.call(context || global, obj[i], i, obj)
			if (ret !== undefined) {
				return ret
			}
		}
		return obj
	}
	for (var key in obj) {
		if (hasOwn(obj, key)) {
			ret = fn.call(context || global, obj[key], key, obj)
			if (ret !== undefined) {
				return ret
			}
		}
	}

	return obj
}

function extend() {
	var target = arguments[0]
	var deep

	if (typeof target === 'boolean') {
		deep = target
		target = arguments[1]
	}

	if (typeof target !== 'object' && !isFn(target)) {
		return target
	}
	var sourceList = slice(arguments, deep ? 2 : 1)

	each(sourceList, function(source) {

		if (typeof source !== 'object') {
			return
		}

		each(source, function(value, key) {

			if (deep && typeof value === 'object') {
				var oldValue = target[key]

				target[key] = typeof oldValue === 'object' ? oldValue : {}

				return extend(deep, target[key], value)
			}

			target[key] = value
		})
	})

	return target

}

function isSameType(arr) {
	if (!isArr(arr)) {
		return false
	}
	var len = arr.length
	var type
	var i
	if (len > 1) {
		type = toStr(arr[0])
		for (i = len - 1; i >= 0; i--) {
			if (toStr(arr[i]) !== type) {
				return false
			}
		}
		return true
	}
	return false
}

var inherit = Object.create || function(proto) {
	var F = function() {}
	F.prototype = proto
	return new F()
}

function invoke(fn, args, context) {
	return fn[isArr(args) ? 'apply' : 'call'](context || global, args);
}

function New(constructor) {
	var instance

	if (!isFn(constructor)) {

		instance = typeof constructor === 'object' ? constructor : {}

	} else {

		instance = inherit(constructor.prototype)
		instance = constructor.apply(instance, slice(arguments, 1)) || instance

	}

	return instance
}


function mix(source) {
	var instance = mix.instance
	var alias = mix.alias
	var ret = {}
	var oldValue

	each(source, function(value, prop) {

		var oldValue = instance[prop]
		var retValue

		if (oldValue === undefined) {
			if (prop in alias) {
				oldValue = instance[prop = alias[prop]]
			}
		}

		if (isFn(oldValue)) {

			if (isSameType(value)) {
				ret[prop] = []
				each(value, function(v) {
					retValue = invoke(oldValue, v, instance)
					if (retValue !== undefined) {
						ret[prop].push(retValue)
					}
				})
			} else {
				retValue = invoke(oldValue, value, instance)
				if (retValue !== undefined) {
					ret[prop] = retValue
				}
			}

		} else if (typeof oldValue === 'object' && typeof value === 'object') {
			extend(oldValue, value)
		} else {
			instance[prop] = value
		}

	}, global, true)

	return ret
}



function createProxy() {
	var instance = New.apply(global, arguments)
	var alias = inherit(createProxy.alias)

	return extend(function(source) {
		if (source === undefined) {
			return instance
		}
		var ret
		mix.instance = instance
		mix.alias = alias

		if (isArr(source)) {
			ret = []
			each(source, function(src) {
				if (typeof src === 'object') {
					ret.push(mix(src))
				}
			})
		} else if (typeof source === 'object') {
			ret = mix(source)
		}

		return ret
	}, {
		alias: alias
	})
}

createProxy.alias = inherit({
	extend: function(source) {
		return extend(this, source)
	},

	each: function(fn) {
		return each(this, fn)
	},

	keys: function() {
		return _.keys(this)
	},

	values: function() {
		return _.values(this)
	},

	invert: function() {
		return _.invert(this)
	},

	parse: function(descri) {
		return this.extend(_.parse(descri))
	}
})
//observe.js

function throwErr(msg) {
	throw new Error(msg)
}

function randomStr(prefix) {
	return prefix + Math.random().toString(36).substr(2)
}

var nextTick = function(fn) {
	return setTimeout(fn, 4)
}

//refer to underscore
// Internal recursive comparison function for `isEqual`.
var eq = function(a, b, aStack, bStack) {
	// Identical objects are equal. `0 === -0`, but they aren't identical.
	// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	if (a === b) return a !== 0 || 1 / a === 1 / b
		// A strict comparison is necessary because `null == undefined`.
	if (a == null || b == null) return a === b
		// Unwrap any wrapped objects.
		// Compare `[[Class]]` names.
	var className = toStr(a)
	if (className !== toStr(b)) return false
	switch (className) {
		// Strings, numbers, regular expressions, dates, and booleans are compared by value.
		case '[object RegExp]':
			// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
		case '[object String]':
			// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
			// equivalent to `new String("5")`.
			return '' + a === '' + b
		case '[object Number]':
			// `NaN`s are equivalent, but non-reflexive.
			// Object(NaN) is equivalent to NaN
			if (+a !== +a) return +b !== +b
				// An `egal` comparison is performed for other numeric values.
			return +a === 0 ? 1 / +a === 1 / b : +a === +b
		case '[object Date]':
		case '[object Boolean]':
			// Coerce dates and booleans to numeric primitive values. Dates are compared by their
			// millisecond representations. Note that invalid dates with millisecond representations
			// of `NaN` are not equivalent.
			return +a === +b
	}

	var areArrays = className === '[object Array]'
	if (!areArrays) {
		if (typeof a != 'object' || typeof b != 'object') return false

		// Objects with different constructors are not equivalent, but `Object`s or `Array`s
		// from different frames are.
		var aCtor = a.constructor
		var bCtor = b.constructor
		if (aCtor !== bCtor && !(isFn(aCtor) && aCtor instanceof aCtor &&
				isFn(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
			return false
		}
	}
	// Assume equality for cyclic structures. The algorithm for detecting cyclic
	// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	var length = aStack.length
	while (length--) {
		// Linear search. Performance is inversely proportional to the number of
		// unique nested structures.
		if (aStack[length] === a) return bStack[length] === b
	}

	// Add the first object to the stack of traversed objects.
	aStack.push(a)
	bStack.push(b)
	var size, result
		// Recursively compare objects and arrays.
	if (areArrays) {
		// Compare array lengths to determine if a deep comparison is necessary.
		size = a.length
		result = size === b.length
		if (result) {
			// Deep compare the contents, ignoring non-numeric properties.
			while (size--) {
				if (!(result = eq(a[size], b[size], aStack, bStack))) break
			}
		}
	} else {
		// Deep compare objects.
		var keys = _.keys(a)
		var key
		size = keys.length
			// Ensure that both objects contain the same number of properties before comparing deep equality.
		result = _.keys(b).length === size
		if (result) {
			while (size--) {
				// Deep compare each member
				key = keys[size]
				if (!(result = hasOwn(b, key) && eq(a[key], b[key], aStack, bStack))) break
			}
		}
	}
	// Remove the first object from the stack of traversed objects.
	aStack.pop()
	bStack.pop()
	return result
};

// Perform a deep comparison to check if two objects are equal.
_.isEqual = function(a, b) {
	return eq(a, b, [], [])
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
		if (propName in obj.__events__) {
			return
		}
		var value = obj[propName]
		var oldValue = typeof value === 'object' ? isArr(value) ? value.concat() : extend(true, {}, value) : value
		var holding

		function trigger() {
			each(obj.__events__[propName], function(callbacks) {
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

		obj.each(function(v, key) {
			oldValues[key] = isObj(v) ? extend(true, {}, v) : isArr(v) ? v.concat() : v
		})

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
			'You can use the [observe.ES5 = true] to ignore IE6/7/8.'
		)
	}
}


var observer = {
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
			if (!isFn(args[1])) {
				return this
			}
			if (isStr(arg = args[0])) {
				var index = arg.indexOf('.')
				if (index <= 0) {
					this._add(arg, args[1])
				} else {
					this._add(arg.substr(0, index), args[1], arg.substr(index + 1))
				}
			} else if (isArr(arg)) {
				each(arg, function(prop) {
					that.on(prop, args[1])
				})
			}
		}
		return this
	},

	_bang: function(prop, data, name) {
		var that = this
		var currentValue = that[prop]
		each(this.__events__[prop][name] || [], function(callback) {
			callback.call(that, data, prop, currentValue)
		})
	},

	trigger: function(props, data) {
		var that = this
		var index, name, arg

		if (!props) {
			return this
		}

		if (isStr(props)) {
			index = props.indexOf('.')
			if (index > 0) {
				this._bang(props.substr(0, index), data, props.substr(index + 1))
			} else if (!index) {
				props = props.substr(1)
				each(this.__events__, function(eventsList, prop) {
					each(eventsList, function(callbacks, name) {
						if (name === props) {
							that._bang(prop, data, name)
						}
					})
				})
			} else {
				each(this.__events__[props] || [], function(callbacks, name) {
					that._bang(props, data, name)
				})
			}
		} else if (isArr(props)) {
			each(props, function(prop) {
				that.trigger(prop, data)
			})
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
			if (isFn(arg = args[0])) {
				each(this.__events__, function(eventsList, prop) {
					each(eventsList, function(callbacks, name) {
						that._remove(prop, arg, name)
					})
				})
			} else if (isStr(arg)) {
				index = arg.indexOf('.')
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
				index = arg.indexOf('.')
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
			that.off(prop)
		}
		return this.on(prop, wrapper)
	},

	tie: function(props, callback) {
		if (!isFn(callback)) {
			return this
		}

		if (isArr(props)) {
			var that = this
			var total = props.length
			var cache = []
			var data = []
			var wrapper = function(value, key) {
				if (cache.indexOf(key) < 0) {
					cache.push(key)
					if (cache.length === total) {
						each(props, function(prop, index) {
							prop = prop.split('.')[0]
							data[index] = that[prop]
						})
						callback.apply(that, data)
					}
				} else if (cache.length >= total) {
					cache.length = 0
					cache.push(key)
				}
			}
			return this.on(props, wrapper)
		} else if (isStr(props)) {
			return this.on(props, callback)
		}
		return this
	}
}

observer.bind = observer.on
observer.unbind = observer.off
observer.fire = observer.trigger
observer.filter = _.keys(observer).concat(['__events__', 'filter'])

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
createObserver.fn = observer
//scanView
var $ = window.jQuery || window.Zepto

if ($ === undefined) {
	if (isFn(global.define) && (define.amd || define.cmd)) {
		define({
			agent: createProxy,
			observe: createObserver
		})
	} else {
		global.agent = createProxy
		global.observe = createObserver
		if (global.$$ === undefined) {
			global.$$ = createProxy
		}
	}
	return
}

$.agent = createProxy
$.observe = createObserver

var $plus = $.plus = {
	attr: 'js',
	filterAttr: ['noscan', 'app'],
	debug: false,
	viewModel: []
}

var push = calling(Array.prototype.push)

function Scaner($startNode) {
	this.$startNode = $startNode
	this.viewModel = {}
}

Scaner.prototype = {
	//Zepto 与 jQuery 的 find 方法，在此表现不一致，故通过构造选择器来完成
	filter: function($sources) {
		var filterNode = []
		var startNode = this.$startNode[0]
		var id = startNode.id = startNode.id || 'filter_id_for_scaner'
		each($plus.filterAttr, function(attr) {
			var items = $([id, '[' + attr + ']', '[' + $plus.attr + ']'].join(' '))
			filterNode.push.apply(filterNode, slice(items))
		})
		if (id === 'filter_id_for_scaner') {
			if (startNode.removeAttribute) {
				startNode.removeAttribute('id')
			} else {
				startNode.id = ''
			}
		}
		return $sources.filter(function() {
			return filterNode.indexOf(this) === -1
		})
	},

	parse: function($node) {
		var viewModel = this.viewModel
		each(_.parse($node.attr($plus.attr)), function(method, alias) {
			var vm = viewModel[alias] = viewModel[alias] || {}
			if (vm.instance) {
				push(vm.instance, $node[0])
			} else {
				method = method.split('-')
				vm['method'] = method[0]
				vm['params'] = method.slice(1)
				vm['instance'] = $node
				vm['lastValue'] = null
				vm['alive'] = $node.attr('unalive') !== undefined ? false : true
				vm['template'] = $node.clone()
			}
		})
		return this
	},

	scan: function() {

		var that = this

		this.parse(this.$startNode)
			.filter(this.$startNode.find('[' + $plus.attr + ']'))
			.each(function() {
				var $this = $(this)
				$this.prevObject = $this.context = null
				that.parse($this)
			})

		return this
	},

	rescan: function() {
		this.viewModel = {}
		return this.scan()
	},

	get: function() {
		return this.viewModel
	}
}

$.fn.scanView = function(rescan) {
	var vm = new Scaner(this)
	if ($.plus.debug) {
		var elem = this[0]
		$plus.viewModel[elem.vmIndex = typeof elem.vmIndex === 'number' ? elem.vmIndex : $plus.viewModel.length] = vm
	}

	return vm.scan().get()
}
//refresh

var $fn = $.fn

function Sync(dataModel, viewModel, startNode) {
	this.dataModel = dataModel
	this.viewModel = viewModel
	this.startNode = startNode
}

Sync.prototype = {
	refresh: function() {
		var viewModel = this.viewModel
		var dataModel = this.dataModel
		for (var key in dataModel) {
			if (!(key in viewModel)) {
				continue
			}
			this.render(viewModel[key], dataModel[key], key)
		}
	},
	render: function(vm, data, key) {
		if (_.isEqual(data, vm.lastValue)) {
			return
		}
		vm.lastValue = typeof data === 'object' ? isArr(data) ? data.concat() : extend(true, {}, data) : data

		var instance = vm.instance
		var method = vm.method
		var params = vm.params

		if (vm.method in $fn) {
			method = $fn[method]
			if (isSameType(data)) {
				var elemLen = instance.length
				var dataLen = data.length
				var $item, i
				if (vm.alive) {
					if (dataLen <= elemLen) {
						instance.slice(dataLen).remove()
						for (i = 0; i < dataLen; i += 1) {
							$item = $(instance[i])
							method.apply($item, params.concat(data[i]))
						}
					} else {
						var temp = vm.template
						var frag = doc.createDocumentFragment()
						for (i = 0; i < dataLen; i += 1) {
							if (i < elemLen) {
								$item = $(instance[i])
							} else {
								$item = temp.clone().each(function() {
									push(instance, frag.appendChild(this))
								})
							}
							method.apply($item, params.concat(data[i]))
						}
						if (frag.childNodes.length) {
							var last = instance[elemLen - 1]
							var next
							if (next = last.nextSibling) {
								last.parentNode.insertBefore(frag, next)
							} else {
								last.parentNode.appendChild(frag)
							}

						}
						temp = frag = null
					}
				} else {
					var len = Math.min(elemLen, dataLen)
					for (i = 0; i < len; i += 1) {
						$item = $(instance[i])
						method.apply($item, params.concat(data[i]))
					}
				}

			} else {
				method.apply(instance, params.concat(data))
			}

		} else {

			if (!isFn(data)) {
				return
			}
			method = data
			params = this.dataModel[vm.method]
			method.apply(instance, [].concat(params || []))
		}
	}
}


$.fn.refresh = function(dataModel, options) {
	var that = this
	var elem = this[0]
	if (isObj(dataModel)) {
		new Sync(dataModel, this.scanView(), elem).refresh()
	} else if (isArr(dataModel)) {
		each(dataModel, function(dm, index) {
			new Sync(dm, that.eq(index).scanView(), elem).refresh()
		})
	}
	return this
}
//plus.js

extend($.fn, {

	render: function(api) {
		var that = this
		var $fn = $.fn

		function invoke(value, key) {
			var $method = $fn[key]
			isFn($method) && $method[isArr(value) ? 'apply' : 'call'](that, value)
		}

		if (isObj(api)) {

			each(api, invoke)

		} else if (isArr(api)) {

			each(api, function(theApi) {
				if (isObj(theApi)) {
					each(theApi, invoke)
				}
			})

		}

		return this
	},

	listen: function(model) {
		var that = this
		that.refresh(model)
		return $.observe(model, function(value, key) {
			var o = {}
			o[key] = value
			that.refresh(o)
		})
	}
});

$.define = function(name, callback) {
	var target = $(name)
	var model;
	if (!target.length) return
	model = {}
	model = callback(model) || model
	return target.listen(model)
};


$.render = function(models) {
	$('[render]').each(function() {
		var $this = $(this)
		var key = $this.attr('render')
		var mod
		key in models && isObj(mod = models[key]) && $this.render(mod)
	})
	return this
};

var $module = {
	vmodel: {},

	ready: function(callback) {
		var self = this
		$(document).ready(function() {
			callback.call(self.$scan())
		})
		return this
	},
	$scan: function() {
		var self = this
		$('[app]').each(function() {
			var $this = $(this)
			var appName = $this.attr('app')
			var status = false
			self.vmodel[appName] = $this.scanView()
			self.on(appName + '.module', function(model, appName) {
				if (status || !isObj(model)) return
				status = true
				this[appName] = $this.listen(model)
				status = false
			})
		})
		return this
	}
}

$.module = $.observe($module)

}(this);