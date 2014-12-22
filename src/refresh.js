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
		var keys = _.keys(viewModel)
		var data, key
		for (var i = 0, len = keys.length; i < len; i += 1) {
			key = keys[i]
			data = dataModel[key]
			if (data !== undefined) {
				this.render(viewModel[key], data)
			}
		}
	},
	render: function(vm, data) {
		if (_.isEqual(data, vm.lastValue)) {
			return
		}
		vm.lastValue = clone(data)

		var instance = vm.instance
		var method = $fn[vm.method]
		var params = vm.params

		if (typeof method === 'function') {
			if (isSameType(data)) {
				var elemLen = instance.length
				var dataLen = data.length
				var $item, i
				if (vm.alive) {
					if (dataLen <= elemLen) {
						instance.slice(dataLen).each(function() {
							var vmIndex = this.vmIndex
							if (typeof vmIndex === 'number') {
								$plus.viewModel[vmIndex] = null
							}
						}).remove()
						instance = vm.instance = instance.slice(0, dataLen)
						instance.prevObject = null
						for (i = 0; i < dataLen; i += 1) {
							method.apply($(instance[i]), params.concat(data[i]))
						}
					} else {
						var temp = vm.template
						var frag = doc.createDocumentFragment()
						for (i = 0; i < dataLen; i += 1) {
							if (i < elemLen) {
								$item = $(instance[i])
							} else {
								$item = temp.clone()
								push(instance, frag.appendChild($item[0]))
							}
							method.apply($item, params.concat(data[i]))
						}

						if (frag.childNodes.length) {
							if (!elemLen) {
								vm.parent.appendChild(frag)
							} else {
								var last = instance[elemLen - 1]
								var next
								if (next = last.nextSibling) {
									last.parentNode.insertBefore(frag, next)
								} else {
									last.parentNode.appendChild(frag)
								}
							}
						}
						temp = frag = null
					}
				} else {
					var len = Math.min(elemLen, dataLen)
					for (i = 0; i < len; i += 1) {
						method.apply($(instance[i]), params.concat(data[i]))
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
			method.apply(instance, [].concat(params))
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
			var $item = that.eq(index)
			if ($item.length) {
				new Sync(dm, $item.scanView(), elem).refresh()
			}
		})
	}
	return this
}