//refresh
//requrie scan.js
function isMultipleArgs(arr) {
	if (!$.isArray(arr)) {
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

$.fn.refresh = function(model, opt) {
	var self = this,
		vmodel = self.getVM(),
		repeat = typeof opt === 'boolean' ? opt : false;

	each(model, function(prop, value) {
		if (!(prop in vmodel)) return;
		var target = vmodel[prop],
			method = target.method,
			args = target.args,
			$method = method in $.fn,
			isArr = isArray(value),
			multiple = isArr ? isMultipleArgs(value) : false,
			cloneArr,
			tpl,
			ret;

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
	});
	return this;
}