//base
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
				return ret[value[0]] = ''
			}
			ret[value[1].trim()] = value[0].trim()
		})

		return ret
	}
}

function each(obj, fn, context) {
	if (obj == undefined || !isFn(fn)) {
		return obj
	}
	var len = obj.length
	var ret

	if (len === +len && len > 0) {
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
	} else {
		return true
	}
	return false
}

var inherit = Object.create || function(proto) {
	var F = function() {}
	F.prototype = proto
	return new F()
}