//refresh

var $fn = $.fn

function Sync(dataModel, viewModel) {
	this.dataModel = dataModel
	this.viewModel = viewModel
}

Sync.prototype = {
	refresh: function() {
		var viewModel = this.viewModel
		var dataModel = this.dataModel
		for (var key in dataModel) {
			if (!(key in viewModel)) {
				continue
			}
			this.render(viewModel[key], dataModel[key])
		}
	},
	render: function(vm, data) {
		if (_.isEqual(data, vm.lastValue)) {
			return
		}
		vm.lastValue = typeof data === 'object' ? isArr(data) ? data.concat() : extend(true, {}, data) : data

		var instance = vm.instance
		var method = vm.method
		var params = vm.params

		if (vm.method in $fn) {

			if (isSameType(data)) {
				var template = instance[0].cloneNode(true)
				var frag = doc.createDocumentFragment()
				var curTotal = instance.length
				var $item
				method = $fn[method]
				for (var index = 0, len = data.length; index < len; index++) {
					if (index < curTotal) {
						$item = $(instance[index])
					} else {
						$item = $(template.cloneNode(true))
						push(instance, frag.appendChild($item[0]))
					}
					method.apply($item, params.concat(data[index]))
				}

				if (frag.childNodes.length) {
					var last = instance[curTotal - 1]
					var next
					if (next = last.nextSibling) {
						last.parentNode.insertBefore(frag, next)
					} else {
						last.parentNode.appendChild(frag)
					}
				}
				template = frag = null
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