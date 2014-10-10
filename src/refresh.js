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

//refre to http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
function deepCompare() {
	var i, l, leftChain, rightChain;

	function compare2Objects(x, y) {
		var p;

		if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') return true;
		if (x === y) return true;

		if ((typeof x === 'function' && typeof y === 'function') ||
			(x instanceof Date && y instanceof Date) ||
			(x instanceof RegExp && y instanceof RegExp) ||
			(x instanceof String && y instanceof String) ||
			(x instanceof Number && y instanceof Number)) {
			return x.toString() === y.toString();
		}

		if (!(x instanceof Object && y instanceof Object)) return false;

		if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) return false;


		if (x.constructor !== y.constructor) return false;

		if (x.prototype !== y.prototype) return false;

		if (inArray(x, leftChain) > -1 || inArray(y, rightChain) > -1) return false;

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

					if (!compare2Objects(x[p], y[p])) return false;

					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (x[p] !== y[p]) return false;
					break;
			}
		}

		return true;
	}

	if (arguments.length < 1) return true;

	for (i = 1, l = arguments.length; i < l; i++) {

		leftChain = [];
		rightChain = [];
		if (!compare2Objects(arguments[0], arguments[i])) return false;
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

		switch (true) {
			case $method && isArr && multiple:
				ret = [];
				cloneArr = [];
				tpl = target.eq(0);
				$method = $.fn[method];
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
		vmodel: this.getVM()
	});

	return this;
}