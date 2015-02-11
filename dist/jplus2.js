/*
 * jplus2
 */
! function($, undefined) {

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

	//反柯里化
	//接受一个函数
	//返回一个函数：1）首个参数作为原函数的this；2）其余参数传入原函数
	function calling(fn) {
		return function() {
			return call.apply(fn, arguments)
		}
	}

	var toStr = calling(objProto.toString)
	var hasOwn = calling(objProto.hasOwnProperty)
	var slice = calling(Array.prototype.slice)

	//返回一个检测输入的obj是否符合特定数据类型的函数
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

	//「面向过程对象」：函数是代码片段，包含一个特定过程，它也可以被视为一种对象
	//将函数参数保存在对象的属性中，将函数体放在done方法中
	//用法：
	//1）新增一个ParseChain过程对象，var parseChain = new ParseChain('a.b.c')
	//2）调用过程对象的done方法，parseChain.done() => ['a', 'b', 'c']
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
			return this.convert(chain).split(separator || '.')
		} else {
			return []
		}
	}

	//将 'a.b.c[1][2]'转化成纯点操作符模式 = > 'a.b.c.1.2'
	ParseChain.prototype.convert = function(chain) {
		return chain.trim().replace(/\[\d+\]/g, function(propName) {
			return '.' + propName.replace(/\[|\]/g, '')
		})
	}


	//用法：
	//1）新增一个GET过程对象：var get = new Get({a:1}, 'a')
	//2)调用该过程对象的done方法，get.done() = > 1
	function Get(obj, propChain, separator) {
		this.obj = obj
		this.propChain = propChain
		this.separator = separator
	}

	Get.prototype.done = function(callback) {
		var result = this.obj
		var props = new ParseChain(this.propChain, this.separator).done()
		var prop
		if (isFn(callback)) {
			var count = 0
			for (var i = 0, len = props.length; i < len; i += 1) {
				prop = props[i]
				callback(result, prop, i)
				result = result[prop]
				if (result == null) {
					break
				}
			}
		} else {
			for (var i = 0, len = props.length; i < len; i += 1) {
				result = result[props[i]]
				if (result == null) {
					break
				}
			}
		}
		return result
	}

	//用法：
	//1）新增一个Set过程对象： var obj = {a:b:{c:1}}; var set = new Set(obj, 'a.b.c', 2);
	//2)调用过程对象的done方法：set.done() => {a:b:{c:2}}
	function Set(obj, propChain, val) {
		this.obj = obj
		this.propChain = propChain
		this.val = val
	}

	Set.prototype.done = function() {
		var obj = this.obj
		var propChain = this.propChain
		var val = this.val

		if (isObj(propChain)) {
			each(propChain, function(chain, value) {
				new Set(obj, chain, value).done()
			})
			return obj
		}

		var props = new ParseChain(propChain).done()
		var len = props.length
		if (len === 1) {
			obj[props[0]] = val
		} else if (len > 1) {
			var lastIndex = len - 1
			var propName = props[lastIndex]
			var get = new Get(obj, props.slice(0, lastIndex))
			var targetObj = get.done(function(currentObj, currentPropName, index) {
				if (currentObj[currentPropName] == null) {
					var nextPropName = props[index + 1]
					currentObj[currentPropName] = /\D/.test(nextPropName) ? {} : []
				}
			})
			targetObj[propName] = val
		}

		return obj
	}

	//用法：
	//1）新增一个Call过程对象：var call = new Call(document, 'body.getAttribute', 'class')
	//2)调用过程对象的done方法： call.done() == document.body.getAttribute('class')
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

	//将链式调用变成配置模式
	//$elem.css(styleObj).attr('href', url).animate(obj) => $elem.invoke({css:styleObj,attr:['href', url], animate: obj})
	$.fn.invoke = function(obj) {
		new Call(this, obj).done()
		return this
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

	//解析形如css的指令表达式：propName1:value1;propName2:value2;
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

	//组织元素与指令为特定结构
	function Combine() {
		this.view = {}
	}

	Combine.prototype.done = function($elem, $directive) {
		var view = this.view
		each($directive, function(propChain, propList) {
			var $item = view[propChain]
			if (!isArr($item)) {
				$item = view[propChain] = []
			}
			$item.push({
				$elem: $elem,
				propList: propList
			})
		})
	}

	//分析元素的指令并收集与组织
	function Collect(combine, $elem, directiveName) {
		this.combine = combine
		this.$elem = $elem
		this.directiveName = directiveName
	}

	Collect.prototype.done = function() {
		var parse = new Parse(this.$elem.attr(this.directiveName))
		this.combine.done(this.$elem, parse.done())
	}

	//根据特定指令名与作用域，扫描出特定结构的viewModel对象
	function Scan($scope, directiveName) {
		this.$scope = $scope
		this.directiveName = directiveName
	}

	Scan.prototype.done = function() {
		var $scope = this.$scope
		var id = $scope.attr('id')
		var randomId
		if (!id) {
			randomId = 'random-id-' + Math.random().toString(36).substr(2)
			$scope.attr('id', id = randomId)
		}
		var directiveName = this.directiveName
		var prefix = '#' + id + ' '
		var selector = '[' + directiveName + ']'
		var filter = '[noscan] ' + selector
		var $elems = $(prefix + selector).not(prefix + filter)
		var combine = new Combine()
		new Collect(combine, $scope, directiveName).done()
		$elems.each(function() {
			new Collect(combine, $(this), directiveName).done()
		})
		if (randomId) {
			$scope.removeAttr('id')
		}
		return {
			$scope: $scope,
			view: combine.view
		}
	}

	//扫描视图，获取viewModel
	$.fn.scan = function(directiveName) {
		directiveName = directiveName || $.directive.setter
		var viewModel = new Scan(this, directiveName).done()
		return viewModel
	}

	//自我复制的元素类
	function ElemGene(elem) {
		this.elem = elem
	}

	//根据数量，复制元素的拷贝，如果有回调，每一份拷贝依次传入回调函数
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

	//将拷贝集合，插入到基因元素的后面
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

	//销毁元素类
	function Destory() {
		this.frag = document.createDocumentFragment()
	}

	//收集需要销毁的元素
	Destory.prototype.collect = function(elem) {
		this.frag.appendChild(elem)
	}

	//动手销毁
	Destory.prototype.done = function() {
		this.frag.innerHTML = ''
	}

	//根据viewModel，将dataModel同步到视图中
	function Sync(viewModel, dataModel) {
		this.viewModel = viewModel
		this.dataModel = dataModel
	}

	Sync.prototype.done = function() {
		var dataModel = this.dataModel
		var $scope = this.viewModel.$scope
		each(this.viewModel.view, function(propChain, directiveList) {
			var data = new Get(dataModel, propChain).done()
			if (data) {
				new Match($scope, directiveList, data).done()
			}
		})
	}

	//匹配将数据更新到视图的方法系列
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
			var $firstElem = directiveList[0].$elem

			if ($firstElem.attr('norepeat') == undefined) {
				var dataLen = data.length
				var listLen = directiveList.length
				var elemGene
				if (dataLen > listLen) {
					var elem = $firstElem[0]
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

	//根据view的propList，分派data的处理方式
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

	$.directive = {
		getter: 'data-get',
		setter: 'data-set'
	}


	//扫描视图模型并更新视图数据
	$.fn.refresh = function(dataModel) {
		if (this.length !== 1) {
			return this
		}
		var viewModel = $.fn.scan.call(this, $.directive.setter)
		new Sync(viewModel, dataModel).done()
		return this
	}

	//根据视图模型，萃取数据
	function Extract(viewModel) {
		this.viewModel = viewModel
	}

	Extract.prototype.done = function() {
		var that = this
		var result = {}
		each(this.viewModel.view, function(propChain, itemList) {
			var data = that.get(itemList)
			new Set(result, propChain, data).done()
		})
		return result
	}

	Extract.prototype.get = function(itemList) {
		var viewModel = this.viewModel
		var view = viewModel.view
		var $scope = viewModel.$scope
		var result = []
		each(itemList, function(i, item) {
			var $elem = item.$elem
			var propName = item.propList[0]
			propName = propName.split('-')
			var part1 = propName[0]
			var part2 = propName.slice(1)
			var prop = new Get($scope, part1).done()
			var ret
			if (isFn(prop)) {
				ret = prop.apply($elem, part2)
			} else {
				var elem = $elem[0]
				prop = new Get(elem, part1).done()
				if (isFn(prop)) {
					ret = prop.apply(elem, part2)
				} else {
					var globalProp = new Get(window, part1).done()
					if (isFn(globalProp)) {
						ret = globalProp.apply(window, part2)
					} else {
						ret = prop
					}
				}
			}
			result.push(ret)
		})
		return result.length > 1 ? result : result[0]
	}


	$.fn.collect = function(directiveName) {
		var viewModel = $.fn.scan.call(this, directiveName || $.directive.getter)
		return new Extract(viewModel).done()
	}

	$.Get = Get
	$.Set = Set
	$.Call = Call

}(window.jQuery || window.Zepto)