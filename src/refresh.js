//refresh
//requrie scan.js
function isMultipleArgs(arr) {
	if (!isArray(arr)) {
		return false;
	}
	var len = arr.length,
		type,
		i;
	if (len > 1) {
		type = $.type(arr[0]);
		for (i = len - 1; i >= 0; i--) {
			if ($.type(arr[i]) !== type) {
				return false;
			}
		}
		return true;
	}
	return false;
}

function MVVM(source) {
	isObject(source) && extend(this, source);
}

MVVM.prototype = {
	each: each,
	extend: function() {
		return extend.apply(null, [this].concat(slice.call(arguments))).refresh();
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

		if (typeof value !== 'object' && target.oldValue === value) {
			return;
		} else {
			target.oldValue = value
		}

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