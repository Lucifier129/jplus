//refresh

var $fn = $.fn

function Sync(dataModel, viewModel, startNode) {
	this.dataModel = dataModel
	this.viewModel = viewModel
	this.startNode = startNode
}

Sync.prototype = {
	refresh: function() {
		var viewModel = this.viewModel
		var dataModel = this.dataModel
		for (var key in dataModel) {
			if (!(key in viewModel)) {
				continue
			}
			this.render(viewModel[key], dataModel[key], key)
		}
	},
	render: function(vm, data, key) {
		if (_.isEqual(data, vm.lastValue)) {
			return
		}
		vm.lastValue = typeof data === 'object' ? isArr(data) ? data.concat() : extend(true, {}, data) : data

		var instance = vm.instance
		var method = vm.method
		var params = vm.params

		if (vm.method in $fn) {
			method = $fn[method]
			if (isSameType(data)) {
				var elemLen = instance.length
				var dataLen = data.length
				var $item, i
				if (vm.alive) {
					if (dataLen <= elemLen) {
						instance.slice(dataLen).remove()
						for (i = 0; i < dataLen; i += 1) {
							$item = $(instance[i])
							method.apply($item, params.concat(data[i]))
						}
					} else {
						var temp = vm.template
						var frag = doc.createDocumentFragment()
						for (i = 0; i < dataLen; i += 1) {
							if (i < elemLen && vm.defaultTemplate) {
								$item = $(instance[i])
							} else {
								$item = temp.clone().each(function() {
									frag.appendChild(this)
								})
								push(instance, $item)
							}
							method.apply($item, params.concat(data[i]))
						}
						if (frag.childNodes.length) {
							switch (vm.insert) {
								case 'after':
									var last = instance[elemLen - 1]
									var next
									if (next = last.nextSibling) {
										last.parentNode.insertBefore(frag, next)
									} else {
										last.parentNode.appendChild(frag)
									}
									break
								case 'before':
									var first = instance[0]
									first.parentNode.insertBefore(frag, first)
									break
								case 'append':
									vm.base.appendChild(frag)
									break
								case 'prepend':
									var firstChild = vm.base.firstChild
									if (firstChild) {
										vm.base.insertBefore(frag, firstChild)
									} else {
										vm.base.appendChild(frag)
									}
									break
							}

						}
						temp = frag = null
					}
				} else {
					var len = Math.min(elemLen, dataLen)
					for (i = 0; i < len; i += 1) {
						$item = $(instance[i])
						method.apply($item, params.concat(data[i]))
					}
				}

			} else {
				method.apply(instance, params.concat(data))
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


$.fn.refresh = function(dataModel, options) {
	var that = this
	var elem = this[0]
	if (isObj(dataModel)) {
		new Sync(dataModel, this.scanView(), elem).refresh()
	} else if (isArr(dataModel)) {
		each(dataModel, function(dm, index) {
			new Sync(dm, that.eq(index).scanView(), elem).refresh()
		})
	}
	return this
}