//refresh

var $fn = $.fn

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
		if (_.isEqual(data, vm.lastValue)) {
			return
		}
		vm.lastValue = typeof data === 'object' ? isArr(data) ? data.concat() : extend(true, {}, data) : data

		var instance = vm.instance
		var method = vm.method
		var params = vm.params
		var inProto = vm.method in $fn

		if (inProto) {

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

		} else {

			if (!isFn(data)) {
				return
			}
			method = data
			params = this.dataModel[vm.method]
			method.apply(instance, [].concat(params || []))
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