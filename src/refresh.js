//refresh
//requrie scan.js
function isMultipleArgs(arr) {
	if (!isArray(arr)) return false;

	var len = arr.length,
		type,
		i;
	if (len > 1) {
		type = $.type(arr[0]);
		for (i = len - 1; i >= 0; i--) {
			if ($.type(arr[i]) !== type) return false;
		}
		return true;
	}
	return false;
}

function deepCompare() {
	var i, l, leftChain, rightChain;

	function compare2Objects(x, y) {
		var p;

		// remember that NaN === NaN returns false
		// and isNaN(undefined) returns true
		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
			return true;
		}

		// Compare primitives and functions.
		// Check if both arguments link to the same object.
		// Especially useful on step when comparing prototypes
		if (x === y) {
			return true;
		}

		// Works in case when functions are created in constructor.
		// Comparing dates is a common scenario. Another built-ins?
		// We can even handle functions passed across iframes
		if ((typeof x === 'function' && typeof y === 'function') ||
			(x instanceof Date && y instanceof Date) ||
			(x instanceof RegExp && y instanceof RegExp) ||
			(x instanceof String && y instanceof String) ||
			(x instanceof Number && y instanceof Number)) {
			return x.toString() === y.toString();
		}

		// At last checking prototypes as good a we can
		if (!(x instanceof Object && y instanceof Object)) {
			return false;
		}

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
			return false;
		}

		if (x.constructor !== y.constructor) {
			return false;
		}

		if (x.prototype !== y.prototype) {
			return false;
		}

		// Check for infinitive linking loops
		if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
			return false;
		}

		// Quick checking of one object beeing a subset of another.
		// todo: cache the structure of arguments[0] for performance
		for (p in y) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}
		}

		for (p in x) {
			if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
				return false;
			} else if (typeof y[p] !== typeof x[p]) {
				return false;
			}

			switch (typeof(x[p])) {
				case 'object':
				case 'function':

					leftChain.push(x);
					rightChain.push(y);

					if (!compare2Objects(x[p], y[p])) {
						return false;
					}

					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (x[p] !== y[p]) {
						return false;
					}
					break;
			}
		}

		return true;
	}

	if (arguments.length < 1) {
		return true; //Die silently? Don't know how to handle such case, please help...
		// throw "Need two or more arguments to compare";
	}

	for (i = 1, l = arguments.length; i < l; i++) {

		leftChain = []; //Todo: this can be cached
		rightChain = [];

		if (!compare2Objects(arguments[0], arguments[i])) {
			return false;
		}
	}

	return true;
}

$.compare = deepCompare;

function MVVM(source) {
	isObject(source) && extend(this, source);
}

MVVM.prototype = {
	each: each,
	extend: function(source) {
		return extend(this, source).refresh();
	},
	refresh: function() {
		var self = this;
		self.each(self.model, function(prop, value) {
			if (!(prop in self.vmodel)) return;
			self.render(prop, value);
		});
		return self;
	},
	render: function(prop, value) {
		var model = this.model,
			oldModel = this.oldModel,
			vmodel = this.vmodel,
			repeat = this.repeat,
			target = vmodel[prop],
			method = target.method,
			args = target.args,
			$method = method in $.fn,
			isArr = isArray(value),
			multiple = isArr ? isMultipleArgs(value) : false,
			cloneArr,
			tpl,
			ret;


		if (deepCompare(target.oldValue, value)) return;
		target.oldValue = value;
		console.log(value);

		switch (true) {
			case $method && isArr && multiple:
				$method = $.fn[method];
				ret = [];
				if (repeat) {
					cloneArr = [];
					tpl = target.eq(0);
					each(value, function(i) {
						var item = target.eq(i);
						if (!item.length) {
							item = tpl.clone(true, true);
							cloneArr.push(item[0]);
						}
						ret.push($method.apply(item, args.concat(this)));
					});

					if (cloneArr.length) {
						var $clone = instantiation();
						push.apply($clone, cloneArr);
						target.eq(-1).after($clone);
						push.apply(target, cloneArr);
					}
				} else {
					target.each(function(i) {
						value[i] && ret.push($method.apply($(this), args.concat(value[i])));
					});
				}
				break;

			case $method:
				ret = $.fn[method].apply(target, args.concat(value));
				break;

			default:
				method = value;
				args = method.args || arr;
				args = isArray(args) ? args : [args];
				multiple = isMultipleArgs(args);

				each(target, function(i) {
					method.apply($(this), multiple ? args[i] : args);
				});
		}
		if (method === 'listen') {
			model[prop] = ret;
		}
	}
}

var mvvm = new MVVM();


$.fn.refresh = function(model, opt) {

	mvvm.extend({
		model: model,
		vmodel: this.getVM(),
		repeat: typeof opt === 'boolean' ? opt : false
	});

	return this;
}