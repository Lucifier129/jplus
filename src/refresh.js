//refresh

var $fn = $.fn

$.noop = $.noop || function() {}

function getInfo(elem, key) {
	return elem['$info'][key]
}

function cloneNode(elem) {
	var ret = $(elem).clone()[0]
	ret['$info'] = elem['$info']
	return ret
}

function $invoke(item, data, key) {
	var $info = getInfo(item, key)
	if (!$info) {
		return
	}
	var $params = $info.params
	var $item = $(item)
	each($info.method, function(method, index) {
		var $method = $fn[method] || noop
		$method.apply($item, $params[index].concat(data))
	})
}

function noop() {
	if (window.console) {
		console.log('calling noop')
	}
}

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
				this.render(viewModel[key], data, key)
			}
		}
	},
	render: function(vm, data, key) {
		if (_.isEqual(data, vm.lastValue)) {
			return
		}
		vm.lastValue = clone(data)

		var instance = vm.instance
		var $method, $params, $info
		if (isSameType(data)) {
			var elemLen = instance.length
			var dataLen = data.length
			var item, i
			if (vm.alive) {
				if (dataLen <= elemLen) {
					instance.slice(dataLen).each(function() {
						var $this = $(this)
						var vmindex = $this.attr('data-vmindex')
						if (vmindex != null) {
							$plus.viewModel[vmindex] = null
						}
						$this.find('[data-vmindex]').each(function() {
							$plus.viewModel[$(this).attr('data-vmindex')] = null
						})
						$this.remove()
					})
					instance = vm.instance = instance.slice(0, dataLen)
					instance.prevObject = null
					for (i = 0; i < dataLen; i += 1) {
						$invoke(instance[i], data[i], key)
					}
				} else {
					var temp = vm.template
					var frag = doc.createDocumentFragment()
					for (i = 0; i < dataLen; i += 1) {
						if (i < elemLen) {
							item = instance[i]
						} else {
							item = cloneNode(temp)
							push(instance, frag.appendChild(item))
						}
						$invoke(item, data[i], key)
					}

					if (frag.childNodes.length) {
						if (!elemLen && vm.parent) {
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
					$invoke(instance[i], data[i], key)
				}
			}
		} else {
			instance.each(function() {
				$invoke(this, data, key)
			})
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