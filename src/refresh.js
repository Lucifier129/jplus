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

$.fn.refresh = function(model) {
	var self = this,
		vmodel = self.getVM();
	each(model, function(prop, value) {
		if (!(prop in vmodel)) return;
		var target = vmodel[prop],
			method = target.method,
			args = target.args,
			$method = method in $.fn,
			isArr = isArray(value),
			multiple;

		if (isArr) {
			multiple = isMultipleArgs(value);
		}

		switch (true) {
			case $method && isArr && multiple:
				each(target, function(i) {
					$.fn[method].apply($(this), args.concat(value[i]))
				});
				break;

			case $method:
				$.fn[method].apply(target, args.concat(value));
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
		return this;
	});
}