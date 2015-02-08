/*
 * jplus2
 */
! function($) {

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

	if (!String.prototype.trim) {
		var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
		String.prototype.trim = function() {
			return this.replace(rtrim, '')
		}
	}

	//base
	var objProto = Object.prototype
	var call = Function.prototype.call

	function calling(fn) {
		return function() {
			return call.apply(fn, arguments)
		}
	}

	var toStr = calling(objProto.toString)
	var hasOwn = calling(objProto.hasOwnProperty)
	var slice = calling(Array.prototype.slice)

	function isType(type) {
		type = '[object ' + type + ']'
		return function(obj) {
			if (obj == null) {
				return obj
			} else {
				return toStr(obj) === type
			}
		}
	}

	var isObj = isType('Object')
	var isStr = isType('String')
	var isFn = isType('Function')
	var isNum = isType('Number')
	var isArr = Array.isArray || isType('Array')

	var each = $.each
	var extend = $.extend
	$.plus = {
		directiveName: 'js'
	}

	function Get(obj, propChain, separator) {
		this.obj = obj
		this.propChain = propChain
		this.separator = separator
	}

	Get.prototype.done = function(callback) {
		var obj = this.obj
		var propChain = this.propChain

		var props = new ParseChain(propChain, this.separator).done()
		var result = obj
		var iterator
		if (isFn(callback)) {
			var count = 0
			iterator = function(_, prop) {
				var currentChain = props.slice(0, ++count)
				callback(result, prop, currentChain)
				result = result[prop]
				if (result == null) {
					return result
				}
			}
		} else {
			iterator = function(_, prop) {
				result = result[prop]
				if (result == null) {
					return result
				}
			}
		}
		each(props, iterator)

		return result
	}

	function Set(obj, propChain, val) {
		this.obj = obj
		this.propChain = propChain
		this.val = this.val
	}

	Set.prototype.done = function() {
		var obj = obj
		var propChain = this.propChain
		var val = this.val

		if (isObj(propChain)) {
			each(propChain, function(chain, value) {
				new Set(obj, chain, value).done()
			})
			return this
		}

		var props = new ParseChain(propChain).done()
		var len = props.length
		if (len === 1) {
			obj[props[0]] = val
		} else if (len > 1) {
			var lastIndex = len - 1
			var propName = props[lastIndex]
			var getter = new Get(obj, propChain)
			var targetObj = getter.done(function(currentObj, currentProp) {
				if (currentObj[currentProp] == null) {
					currentObj[currentProp] = {}
				}
			})
			targetObj[propName] = val
		}

		return this
	}

	function Call(obj, propChain, args, separator) {
		this.obj = obj
		this.propChain = propChain
		this.args = args
		this.separator = this.separator
	}

	Call.prototype.done = function() {
		var obj = this.obj
		var propChain = this.propChain
		var args = this.args

		if (isObj(propChain)) {
			each(propChain, function(chain, args) {
				new Call(obj, chain, args).done()
			})
			return
		}

		var props = new ParseChain(propChain, this.separator).done()
		var len = props.length
		var method = new Get(obj, props).done()
		if (!isFn(method)) {
			return
		}
		obj = new Get(obj, props.slice(0, len - 1)).done()

		return method.apply(obj, isArr(args) ? args : [args])

	}

	//检查数组的项的类型，如果是同一类型，返回true
	//@param {array} 数组
	//@returns {boolean} 布尔值
	function isSimilar(arr) {
		if (!isArr(arr) || !arr.length) {
			return false
		}
		var len = arr.length
		var type
		var i
		if (len > 1) {
			type = toStr(arr[0])
			for (i = len - 1; i > 0; i--) {
				if (toStr(arr[i]) !== type) {
					return false
				}
			}
		}
		return true
	}

	function ParseChain(chain, separator) {
		this.chain = chain
		this.separator = separator
	}

	ParseChain.prototype.done = function() {
		var chain = this.chain
		var separator = this.separator
		if (isArr(chain)) {
			return chain
		} else if (isStr(chain)) {
			return chain.trim().split(separator || '.')
		} else {
			return []
		}
	}


	function Parse(describe) {
		this.describe = describe
	}

	Parse.prototype.done = function() {
		var describe = this.describe
		var ret = {}
		if (!isStr(describe)) {
			return ret
		}
		var group = describe.trim().split(';')
		each(group, function(i, value) {
			value = value.trim().split(':')
			if (value.length < 2) {
				return
			}
			var propName = value[0].trim()
			var propChain = value[1].trim()
			if (propName && propChain) {
				if (!ret[propChain]) {
					ret[propChain] = []
				}
				if (ret[propChain].indexOf(propName) === -1) {
					ret[propChain].push(propName)
				}
			}
		})
		return ret
	}

	function Scan($scope, selector, filter) {
		this.$scope = $scope
		this.selector = selector
		this.filter = filter
	}

	Scan.prototype.done = function() {
		var $scope = this.$scope
		var id = $scope.attr('id')
		var randomId
		if (!id) {
			randomId = 'refresh' + Math.random().toString(36).substr(2)
			$scope.attr('id', id = randomId)
		}
		var $elems = $('#' + id + ' ' + this.selector).not(this.filter)
		var combine = new Combine()
		new Collect(combine, $scope).done()
		$elems.each(function() {
			new Collect(combine, $(this)).done()
		})
		if (randomId) {
			$scope.removeAttr('id')
		}
		return {
			$scope: $scope,
			$view: combine.$view
		}
	}

	function Collect(combine, $elem) {
		this.combine = combine
		this.$elem = $elem
	}

	Collect.prototype.done = function() {
		var parse = new Parse(this.$elem.attr($.plus.directiveName || 'js'))
		this.combine.done(this.$elem, parse.done())
	}

	function Combine() {
		this.$view = {}
	}

	Combine.prototype.done = function($elem, $directive) {
		var $view = this.$view
		each($directive, function(propChain, propList) {
			var $item = $view[propChain]
			if (!isArr($item)) {
				$item = $view[propChain] = []
			}
			$item.push({
				$elem: $elem,
				propList: propList
			})
		})
	}

	function ElemGene(elem) {
		this.elem = elem
	}

	ElemGene.prototype.clone = function(amount, callback) {
		if (!isNum(amount)) {
			return this
		}
		var frag = document.createDocumentFragment()
		var hasCallback = isFn(callback)
		var elem = this.elem
		var copy
		for (var i = amount - 1; i >= 0; i--) {
			copy = elem.cloneNode(true)
			frag.appendChild(copy)
			if (hasCallback) {
				callback(copy)
			}
		}
		this.copies = frag
		return this
	}

	ElemGene.prototype.insert = function() {
		if (!this.copies) {
			return this
		}
		var elem = this.elem
		var parent = elem.parentNode
		var next = elem.nextSibling
		if (next) {
			parent.insertBefore(this.copies, next)
		} else {
			parent.appendChild(this.copies)
		}
		return
	}

	function Destory() {
		this.frag = document.createDocumentFragment()
	}

	Destory.prototype.collect = function(elem) {
		this.frag.appendChild(elem)
	}

	Destory.prototype.done = function() {
		this.frag.innerHTML = ''
	}

	function Sync(viewModel, dataModel) {
		this.viewModel = viewModel
		this.dataModel = dataModel
	}

	Sync.prototype.done = function() {
		var dataModel = this.dataModel
		var $scope = this.viewModel.$scope
		each(this.viewModel.$view, function(propChain, directiveList) {
			var data = new Get(dataModel, propChain).done()
			if (data) {
				new Match($scope, directiveList, data).done()
			}
		})
	}

	function Match($scope, directiveList, data) {
		this.$scope = $scope
		this.directiveList = directiveList
		this.data = data
	}

	Match.prototype.done = function() {
		var $scope = this.$scope
		var directiveList = this.directiveList
		var data = this.data

		if (isSimilar(data)) {
			var dataLen = data.length
			var listLen = directiveList.length
			var elemGene

			if (dataLen > listLen) {
				var elem = directiveList[0].$elem[0]
				var propList = directiveList[0].propList
				elemGene = new ElemGene(elem)
				elemGene.clone(dataLen - listLen, function(copy) {
					directiveList.push({
						$elem: $(copy),
						propList: propList
					})
				})
				elemGene.insert()
			} else if (dataLen < listLen) {
				var destory = new Destory()
				for (var i = listLen - 1; i >= dataLen; i--) {
					destory.collect(directiveList[i].$elem[0])
				}
				destory.done()
				directiveList.length = dataLen
			}
			each(directiveList, function(i, view) {
				new Assign($scope, view, data[i]).done()
			})
		} else {
			each(directiveList, function(_, view) {
				new Assign($scope, view, data).done()
			})
		}

	}

	function Assign($scope, view, data) {
		this.$scope = $scope
		this.view = view
		this.data = data
	}

	Assign.prototype.done = function() {
		var $scope = this.$scope
		var data = this.data
		var view = this.view
		var $elem = view.$elem
		var elem = $elem[0]
		var propList = view.propList
		each(propList, function(_, propName) {
			propName = propName.split('-')
			var part1 = propName[0]
			var part2 = propName.slice(1)
			var prop = new Get($scope, part1).done()
			if (isFn(prop)) {
				prop.apply($elem, part2.concat(data))
			} else {
				new Set(elem, part1, data).done()
			}
		})
	}


	$.fn.refresh = function(dataModel) {
		if (!this.length) {
			return this
		}
		var selector = '[' + $.plus.directiveName + ']'
		var viewModel = new Scan(this, selector, '[noscan] ' + selector).done()
		new Sync(viewModel, dataModel).done()
		return this
	}

	$.fn.render = function(obj) {
		new Call(this, obj).done()
		return this
	}

	$.Get = Get
	$.Set = Set
	$.Call = Call

}(window.jQuery || window.Zepto)