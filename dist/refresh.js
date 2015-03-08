/**
 * 添加工具性质的原型方法与静态方法：$.fn.refresh $.fn.render $.keys $.clone $.isEqual
 * @Author: yj_gu
 * @Date: 2015.01.26
 * @describe: 减少手动的dom选择，由祖先元素代理子孙元素的参数，也可作为模板引擎使用
 */
;(function(factory) {
	//支持amd或cmd引入，也支持全局的jQuery引入
	if (typeof define === 'function' && (define.amd || define.cmd)) {
		define(function(require, exports, module) {
			var $ = require('jquery')
			factory($)
			module.exports = $
		})
	} else if (window.jQuery) {
		factory(window.jQuery)
	} else if (window.Zepto) {
		factory(window.Zepto)
	}
}(function($, undefined) {

	var each = $.each
	var extend = $.extend
	var trim = $.trim
	var inArray = $.inArray

	//反柯里化函数
	function calling(fn) {
		return function() {
			return Function.prototype.call.apply(fn, arguments)
		}
	}

	var objProto = Object.prototype
	var arrProto = Array.prototype
	var toStr = calling(objProto.toString)
	var hasOwn = calling(objProto.hasOwnProperty)
	var slice = calling(arrProto.slice)

	function isType(type) {
		return function(obj) {
			return obj == null ? obj : toStr(obj) === '[object ' + type + ']'
		}
	}

	var isObj = isType('Object')
	var isStr = isType('String')
	var isFn = isType('Function')
	var isArr = Array.isArray || isType('Array')

	//@param {string} 形式如 "text:words;attr-src:url;"的字符串
	//@returns {object} 将仿css属性写法的键值对，转化为javascript对象
	function parseDirective(descri) {
		var ret = {}
		if (!isStr(descri)) {
			return ret
		}
		var group = trim(descri).split(';')
		each(group, function(i, value) {
			value = trim(value).split(':')
			if (value.length < 2) {
				return
			}
			var methodname = trim(value[0])
			var propChain = trim(value[1])
			if (methodname && propChain) {
				if (!ret[propChain]) {
					ret[propChain] = []
				}
				if (inArray(methodname, ret[propChain]) === -1) {
					ret[propChain].push(methodname)
				}
			}
		})
		return ret
	}

	function toArr(obj) {
		return isArr(obj) ? obj : [obj]
	}


	function parseChain(chain, separator) {
		return isArr(chain) ? chain : isStr(chain) ? trim(chain).split(separator || '.') : []
	}

	//@param {object} 目标对象
	//@param {string} 形式如 'a.b.c.e'的字符串
	//@param {function} 回调函数，每访问一次属性就调用一次
	//@returns {value} 返回目标值
	//@example:
	//```javascript
	//getValByChain(window, 'document.body.style.background') //从window对象中，获取body元素的背景颜色
	//```
	function getValByChain(obj, propChain, callback) {
		if (obj == null) {
			return obj
		}
		var props = parseChain(propChain)
		var result = obj
		var iterator
		if (isFn(callback)) {
			var count = 0
			iterator = function(i, prop) {
				if (result == null) {
					return result
				}
				callback(result, prop, props.slice(0, ++count))
				result = result[prop]
			}
		} else {
			iterator = function(i, prop) {
				if (result == null) {
					return result
				}
				result = result[prop]
			}
		}
		each(props, iterator)
		return result
	}

	//jQuery的静态属性
	var $plus = $.plus = {
		directiveName: 'js'
	}

	var $proto = $.fn

	//获取并解析指令
	$proto.getDirective = function() {
		if (!this.length) {
			return {}
		}
		var directiveObj = parseDirective(this.attr($plus.directiveName)) || {}
		var elem = this[0]
		each(directiveObj, function(propChain, methodArr) {
			directiveObj[propChain] = {
				elem: elem,
				methodArr: methodArr
			}
		})
		return directiveObj
	}

	//设置指令
	$proto.setDirective = function(val) {
		return this.attr($plus.directiveName, val || '')
	}

	function mergeDirective(directiveSet, propChain, directiveItem) {
		if (!directiveSet[propChain]) {
			directiveSet[propChain] = []
		}
		if (inArray(directiveItem, directiveSet[propChain]) === -1) {
			directiveSet[propChain].push(directiveItem)
		}
	}

	function mergeDirectiveObj(directiveSet, directiveObj) {
		each(directiveObj, function(propChain, directiveItem) {
			mergeDirective(directiveSet, propChain, directiveItem)
		})
	}

	//扫描元素，并收集指令，如js="text:words"
	$proto.scan = function() {
		var directiveSet = {}
		if (!this.length) {
			return directiveSet
		}
		var $this = this
		var elem = this[0]
		var id = elem.id
		var randomId = false
		if (!id) {
			randomId = true
			id = elem.id = 'refresh' + Math.random().toString(36).substr(2)
		}
		mergeDirectiveObj(directiveSet, $this.getDirective())

		var $elems = $('#' + id + ' [' + $plus.directiveName + ']')
		if (randomId) {
			$(elem).removeAttr('id')
		}

		$elems.each(function() {
			mergeDirectiveObj(directiveSet, $(this).getDirective())
		})
		return directiveSet
	}

	//调用方法，支持破折号分隔符作为固定参数，如attr-src:url => $obj.attr('src', url)
	function callMethod($obj, methodname, args) {
		methodname = methodname.split('-')
		var prefix = methodname.slice(1)
		methodname = methodname[0]
		var method = $proto[methodname]
		if (!isFn(method)) {
			return
		}
		method.apply($obj, prefix.concat(args))
	}

	//根据指令集调用方法
	//当dataModel的对应属性为相同数据类型的数组，且元素没有norepeat属性，则采用repeat模式
	function callMethodsByDirectiveSet(directiveSet, dataModel) {
		if (!isObj(dataModel)) {
			return
		}

		each(directiveSet, function(propChain, directiveItems) {
			var data = getValByChain(dataModel, propChain)
			if (data == null) {
				return
			}
			if (isSameType(data)) {
				var itemsLen = directiveItems.length
				var dataLen = data.length
				var elem
				var newElem

				if ($(directiveItems[0].elem).attr('norepeat') == undefined) {

					//数据量大于dom元素数量时，clone缺少的部分
					if (dataLen > itemsLen) {
						var methodArr = directiveItems[0].methodArr
						var frag = document.createDocumentFragment()
						elem = directiveItems[0].elem
						for (var i = 0, len = dataLen - itemsLen; i < len; i += 1) {
							newElem = elem.cloneNode(true)
							frag.appendChild(newElem)
							directiveItems.push({
								elem: newElem,
								methodArr: methodArr
							})
						}
						elem.parentNode.appendChild(frag)

					} else if (dataLen < itemsLen) {
						var target

						//数据量小于元素数量，将多余的元素删除，从尾部删除，减少页面重排
						for (var i = itemsLen - 1; i >= dataLen; i--) {
							target = directiveItems[i].elem
							target.parentNode.removeChild(target)
						}
						directiveItems.length = dataLen
					}
				}

				each(directiveItems, function(i, directiveItem) {
					var $target = $(directiveItem.elem)
					each(directiveItem.methodArr, function(_, methodname) {
						callMethod($target, methodname, data[i])
					})
				})

			} else {
				each(directiveItems, function(_, directiveItem) {
					var $target = $(directiveItem.elem)
					each(directiveItem.methodArr, function(_, methodname) {
						callMethod($target, methodname, data)
					})
				})
			}
		})
	}

	//检查数组的项的类型，如果是同一类型，返回true
	//@param {array} 数组
	//@returns {boolean} 布尔值
	function isSameType(arr) {
		if (!isArr(arr)) {
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

	//根据指令与数据刷新视图，指令为特定的html属性，默认为js
	//@param {object} 数据对象
	//@returns {object} 返回this
	//@example:
	//```html
	//<body js="attr-title:title;css-color:color"></body>
	//```
	//```javascript
	//$('body').refresh({title: '标题', color: '#333'})
	//```
	//上面等价于:
	//```javascript
	//$('body').attr('title', '标题').css('color', '#333')
	//```
	$proto.refresh = function(dataModel) {
		var directiveSet = this.scan()
		callMethodsByDirectiveSet(directiveSet, dataModel)
		return this
	}


	//将链式调用转化为配置模式
	//```javascript
	//$('body').render({html:'<h1>标题</h1>', css: ['color', '#333']})
	//```
	//上面等价于
	//```javascript
	//$('body').html('<h1>标题</h1>').css('color', '#333')
	//```
	//@param {object} key为方法名，value为方法接受的参数的对象
	//@returns {object} 返回this值
	$proto.render = function(api) {
		var that = this
		var $fn = $.fn

		function invoke(key, value) {
			var $method = $fn[key]
			isFn($method) && $method[isArr(value) ? 'apply' : 'call'](that, value)
		}

		if (isObj(api)) {

			each(api, invoke)

		} else if (isArr(api)) {

			each(api, function(_, theApi) {
				if (isObj(theApi)) {
					each(theApi, invoke)
				}
			})

		}

		return this
	}

}));