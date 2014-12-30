//scanView
var $plus = $.plus = {
	attr: 'js',
	filterAttr: ['noscan', 'app'],
	viewModel: []
}

var push = calling(Array.prototype.push)

function Scaner($startNode) {
	$startNode.prevObject = $startNode.context = null
	this.$startNode = $startNode
	this.viewModel = {}
}

Scaner.prototype = {
	//Zepto 与 jQuery 的 find 方法，在此表现不一致，故通过构造选择器来完成
	filter: function($sources) {
		var filterNode = []
		var startNode = this.$startNode[0]
		var id = startNode.id = startNode.id || 'filter_id_for_scaner'
		each($plus.filterAttr, function(attr) {
			var items = $(['#' + id, '[' + attr + ']', '[' + $plus.attr + ']'].join(' '))
			filterNode.push.apply(filterNode, slice(items))
		})
		if (id === 'filter_id_for_scaner') {
			if (startNode.removeAttribute) {
				startNode.removeAttribute('id')
			} else {
				startNode.id = ''
			}
		}
		return $sources.filter(function() {
			return filterNode.indexOf(this) === -1
		})
	},

	parse: function($node) {
		var viewModel = this.viewModel
		each(_.parse($node.attr($plus.attr)), function(method, alias) {
			var vm = viewModel[alias] = viewModel[alias] || {}
			var elem = $node[0]
			var $info = elem['$info'] = elem['$info'] || {}
			$info[alias] = $info[alias] || {
				method: [],
				params: []
			}
			each(method, function(v, methodName) {
				methodName = methodName.split('-')
				$info[alias].method.push(methodName[0])
				$info[alias].params.push(methodName.slice(1))
			})
			if (vm.instance) {
				push(vm.instance, elem)
			} else {
				vm['instance'] = $(elem)
				vm['lastValue'] = vm['instance'].context = null
				vm['alive'] = $node.attr('unalive') != undefined ? false : true
				vm['template'] = elem.cloneNode(true)
				vm['template']['$info'] = $info
				var parent = elem.parentNode
				vm['parent'] = /fragment/i.test(parent.nodeName) ? null : parent
			}
		})
		return this
	},

	scan: function() {

		var that = this

		this.parse(this.$startNode)
			.filter(this.$startNode.find('[' + $plus.attr + ']'))
			.each(function() {
				var $this = $(this)
				$this.prevObject = $this.context = null
				that.parse($this)
			})
		return this
	},

	rescan: function() {
		this.viewModel = {}
		return this.scan()
	},

	get: function() {
		return this.viewModel
	}
}
$.fn.scanView = function(rescan) {
	if (!this.length) {
		return {}
	}
	var elem = this[0]
	var vmindex = this.attr('data-vmindex')
	if (vmindex != null && !rescan) {
		return $plus.viewModel[vmindex].get()
	}
	if (vmindex == null) {
		this.attr('data-vmindex', vmindex = $plus.viewModel.length)
	}
	var vm = $plus.viewModel[vmindex] = new Scaner(this)
	return vm.scan().get()
}