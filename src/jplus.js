/**
 *File: agent.js
 *Author: Jade
 *Date: 2014.11.20
 */
! function(global, undefined) {

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
			return toStr(obj) === '[object ' + type + ']'
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
			if (!isStr(descri) || descri) {
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
		var len = obj.length
		var ret

		if (len === +len && len && !useForIn) {
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
			type = typeof arr[0]
			for (i = len - 1; i >= 0; i--) {
				if (typeof arr[i] !== type) {
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

	var $ = window.jQuery || window.Zepto

	if ($ === undefined) {
		return
	}

	var $plus = $.plus = {
		attr: '[js]',
		filterAttr: ['noscan', 'app'],
		viewModel: []
	}
	var push = calling(Array.prototype.push)

	function Scaner($startNode) {
		this.$startNode = $startNode
		this.attr = $plus.attr
		this.contentList = []
		this.childrenList = []
		this.viewModel = {}
		this.scan()
	}

	Scaner.prototype = {
		filter: function() {
			var that = this
			var filterList = {}
			each($plus.filterAttr, function(attr) {
				filterList[attr] = that.$startNode.find(attr)
			})

			each(filterList, function($nodeList) {
				$nodeList.each(function() {
					var $this = $(this)
					var len = that.contentList.length
					that.contentList[len] = $this
					that.childrenList[len] = $this.children().detach()
				})
			})
			return this
		},

		revert: function() {
			var that = this
			each(this.contentList, function($content, index) {
				var $children = that.childrenList[index]
				if ($children.length) {
					$content.append($children)
				}
			})
			return this
		},

		parse: function($node) {
			var viewModel = this.viewModel
			each(_.parse($node.attr($plus.attr)), function(method, alias) {
				var vm = viewModel[alias] = viewModel[alias] || {}
				if (isObj(vm)) {
					push(vm.instance, $node[0])
				} else {
					method = method.split('-')
					vm['method'] = method[0]
					vm['params'] = method[1] ? [method[1]] : []
					vm['instance'] = $node
					vm['lastValue'] = null
				}
			})
		},

		scan: function() {
			this.filter().parse(this.$startNode)
			var that = this
			this.$startNode.find($plus.attr).each(function() {
				that.parse($(this))
			})
			return this.revert()
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
		var elem = this[0]
		var vmIndex = elem.vmIndex
		var isNum = typeof vmIndex === 'number'
		var vm
		if (isNum) {
			vm = $plus.viewModel[vmIndex]
			return rescan ? vm.rescan().get() : vm.get()
		}
		vm = new Scaner(this)
		$plus.viewModel[elem.vmIndex = $plus.viewModel.length] = vm
		return vm.scan()
	}


	//refer to underscore
	// Internal recursive comparison function for `isEqual`.
	var eq = function(a, b, aStack, bStack) {
		// Identical objects are equal. `0 === -0`, but they aren't identical.
		// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		if (a === b) return a !== 0 || 1 / a === 1 / b;
		// A strict comparison is necessary because `null == undefined`.
		if (a == null || b == null) return a === b;
		// Unwrap any wrapped objects.
		// Compare `[[Class]]` names.
		var className = toStr(a);
		if (className !== toStr(b)) return false;
		switch (className) {
			// Strings, numbers, regular expressions, dates, and booleans are compared by value.
			case '[object RegExp]':
				// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
			case '[object String]':
				// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
				// equivalent to `new String("5")`.
				return '' + a === '' + b;
			case '[object Number]':
				// `NaN`s are equivalent, but non-reflexive.
				// Object(NaN) is equivalent to NaN
				if (+a !== +a) return +b !== +b;
				// An `egal` comparison is performed for other numeric values.
				return +a === 0 ? 1 / +a === 1 / b : +a === +b;
			case '[object Date]':
			case '[object Boolean]':
				// Coerce dates and booleans to numeric primitive values. Dates are compared by their
				// millisecond representations. Note that invalid dates with millisecond representations
				// of `NaN` are not equivalent.
				return +a === +b;
		}

		var areArrays = className === '[object Array]';
		if (!areArrays) {
			if (typeof a != 'object' || typeof b != 'object') return false;

			// Objects with different constructors are not equivalent, but `Object`s or `Array`s
			// from different frames are.
			var aCtor = a.constructor,
				bCtor = b.constructor;
			if (aCtor !== bCtor && !(isFn(aCtor) && aCtor instanceof aCtor &&
					isFn(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
				return false;
			}
		}
		// Assume equality for cyclic structures. The algorithm for detecting cyclic
		// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
		var length = aStack.length;
		while (length--) {
			// Linear search. Performance is inversely proportional to the number of
			// unique nested structures.
			if (aStack[length] === a) return bStack[length] === b;
		}

		// Add the first object to the stack of traversed objects.
		aStack.push(a);
		bStack.push(b);
		var size, result;
		// Recursively compare objects and arrays.
		if (areArrays) {
			// Compare array lengths to determine if a deep comparison is necessary.
			size = a.length;
			result = size === b.length;
			if (result) {
				// Deep compare the contents, ignoring non-numeric properties.
				while (size--) {
					if (!(result = eq(a[size], b[size], aStack, bStack))) break;
				}
			}
		} else {
			// Deep compare objects.
			var keys = _.keys(a),
				key;
			size = keys.length;
			// Ensure that both objects contain the same number of properties before comparing deep equality.
			result = _.keys(b).length === size;
			if (result) {
				while (size--) {
					// Deep compare each member
					key = keys[size];
					if (!(result = hasOwn(b, key) && eq(a[key], b[key], aStack, bStack))) break;
				}
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();
		return result;
	};

	// Perform a deep comparison to check if two objects are equal.
	_.isEqual = function(a, b) {
		return eq(a, b, [], []);
	};

	function Sync(dataModel, viewModel) {
		this.dataModel = dataModel
		this.viewModel = viewModel
	}

	Sync.prototype = {
		refresh: function() {
			var that = this
			var viewModel = this.viewModel
			each(this.dataModel, function(data, key) {
				if (!(key in viewModel)) {
					return
				}
				that.render(viewModel[key], data)
			})
		},
		render: function(vm, data) {
			if (_.isEqual(data, vm.lastValue) || !(vm.method in $fn)) {
				return
			}
			vm.lastValue = typeof data === 'object' ? isArr(data) ? data.concat() : extend(true, {}, data) : data

			var instance = vm.instance
			var method = vm.method
			var params = vm.params

			if (isSameType(data)) {
				var template = instance.eq(0).clone()
				var frag = []
				method = $fn[method]
				each(data, function(value, index) {
					var $item = instance.eq(index)
					if (!$item.length) {
						$item = template.clone()
						frag.push($item.get(0))
					}
					method.apply($item, params.concat(value))
				})
				if (frag.length) {
					instance.eq(-1).after(frag)
					frag.push.apply(instance, frag)
				}
			} else {
				$fn[method].apply(instance, params.concat(data))
			}
		}
	}


	$.fn.refresh = function(dataModel) {
		var that = this
		if (isObj(dataModel)) {
			new Sync(dataModel, this.scanView()).refresh()
		} else if (isArr(dataModel)) {
			each(dataModel, function(dm, index) {
				new Sync(dm, that.eq(index).scanView()).refresh()
			})
		}
		return this
	}

	//observe.js
	var doc = document;
	var head = doc.getElementsByTagName('head')[0];
	var comment = doc.createComment('Kill IE6/7/8');
	var NATIVE_RE = /\[native code\]/;
	var UNDEFINED = 'undefined';
	var defineSetter;
	var ES5;

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

			var trigger = function() {
				setter.call(obj, value, propName, obj.$$oldValues[propName]);
				obj.$$oldValues[propName] = value;
				status = true;
				trigger = function() {
					var oldValue = obj.$$oldValues[propName];
					status = true;
					if (_.equal(oldValue, value)) return;
					setter.call(obj, value, propName, oldValue);
					obj.$$oldValues[propName] = value;
				}
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
					setter.call(self, self[attrName], attrName, self.$$oldValues[attrName]);
					self.$$oldValues[attrName] = self[attrName];
					return;
				}
				if (!status[attrName]) return;

				status[attrName] = false;
				nextTick(function() {
					var oldValue = self.$$oldValues[attrName];
					status[attrName] = true;
					if (_.equal(oldValue, self[attrName])) return;
					setter.call(self, self[attrName], attrName, oldValue);
					self.$$oldValues[attrName] = self[attrName];
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
		if ($.ES5) return;
		if (propName in comment) {
			throw new Error(
				'If you want to support IE6/7/8. The property name [' + propName + '] can not be observed, ' +
				'because DOM has the same property name. ' +
				'You can use the [jQuery.ES5 = true] to ignore IE6/7/8.'
			);
		}
	}



	var observer = {
		$$proto: {
			add: function(propName, value) {
				this[propName] = value || UNDEFINED;
				this.$$oldValues[propName] = '$.observe' + randomStr();
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
					args = slice.call(arguments);

				if (args.length === 1) {
					args = args[0];
					if (isObj(args)) {
						each(args, function(propName, setter) {
							checkPropName(propName);
							observeProp(self, propName, setter);
						});
					} else if (isFn(args)) {
						self.each(function(propName) {
							checkPropName(propName);
							observeProp(self, propName, args);
						});
					}
				} else if (args.length === 2 && isStr(args[0]) && isFn(args[1])) {
					checkPropName(args[0]);
					observeProp(self, args[0], args[1]);
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
		init: ES5 ? function(source) {
			var target = inherit(this.$$proto),
				oldValues = target.$$oldValues = {};
			target.$$setters = {};
			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					oldValues[key] = target[key] = source[key];
				}
			}
			return target;
		} : function(source) {
			var target = head.appendChild(doc.createComment('[object Object]')),
				oldValues = target.$$oldValues = {};
			extend(target, this.$$proto).$$setters = {};
			for (var key in source) {
				if (source.hasOwnProperty(key)) {
					oldValues[key] = target[key] = source[key];
				}
			}
			return target;
		}
	};


	/**@function observe
	 *@param {object} 源对象
	 *@param {object|function}  初始化侦听 等价于立即调用on方法
	 *@returns {object} 被侦听了属性的对象
	 */
	$.observe = function(source, setters) {
		var model;
		if (!isObj(source)) return null;
		model = observer.init(source);
		return isObj(setters) || isFn(setters) ? model.on(setters) : model;
	};
	//plus.js


	extend($.fn, {
		/**
		 *@param {object|array} api  一个或多个包含jQ方法及其参数的对象
		 */
		render: function(api) {
			var self = this,
				$fn = $.fn;

			function invoke(key, value) {
				var $method = $fn[key];
				$method && $method[isArray(value) ? 'apply' : 'call'](self, value);
			}

			if (isObj(api)) {

				each(api, invoke);

			} else if (isArray(api)) {

				each(api, function() {
					each(this, invoke);
				});

			}

			return this;
		},
		/**
		 *@param {object} 数据模型 与refresh方法的参数相同
		 *@returns {object} 返回被侦听了属性变化的对象
		 */
		listen: function(model) {
			var self = this;
			self.refresh(model);
			return $.observe(model).on(function(value, key) {
				var o = {};
				o[key] = value;
				self.refresh(o);
			});
		}
	});

	/**@function define
	 *@param {string} 作用域选择器 合法的jquery选择器
	 *@param {function} 回调函数 定义一个数据模型
	 *@retruns {object} 返回被侦听了属性变化的对象
	 */
	$.define = function(name, callback) {
		var target = $(name),
			model;
		if (!target.length) return;
		model = {};
		model = callback(model) || model;
		return target.listen(model);
	};


	$.render = function(models) {
		$('[render]').each(function() {
			var $this = $(this),
				key = $this.attr('render'),
				mod;
			key in models && isObj(mod = models[key]) && $this.render(mod);
		});
		return this;
	};

	var $module = {
		vmodel: {},
		/**@function ready
		 *@param {function} 回调函数 当文档加载完毕vm扫描完毕时即调用
		 */
		ready: function(callback) {
			var self = this;
			$(document).ready(function() {
				callback.call(self.$scan());
			});
			return this;
		},
		$scan: function() {
			var self = this;
			$('[app]').each(function() {
				var $this = $(this),
					appName = $this.attr('app'),
					status = false;
				self.vmodel[appName] = $this.getVM();
				self.on(appName + '.module', function(model, appName) {
					if (status || !isObj(model)) return;
					status = true;
					this[appName] = $this.listen(model);
					status = false;
				});
			});
			return this;
		}
	};

	$.module = extend($.observe({}), $module);


	/*	var viewModel = {
			'title': {
				method: 'text',
				instance: $('js'),
				params: []
				lastValue: null
			}
		}*/

}(this);