//scanView
var $ = window.jQuery || window.Zepto

if ($ === undefined) {
	if (isFn(global.define) && (define.amd || define.cmd)) {
		define({
			agent: createProxy,
			observe: createObserver
		})
	} else {
		global.agent = createProxy
		global.observe = createObserver
		if (global.$$ === undefined) {
			global.$$ = createProxy
		}
	}
	return
}

$.agent = createProxy
$.observe = createObserver

var $plus = $.plus = {
	attr: 'js',
	filterAttr: ['noscan', 'app'],
	viewModel: []
}

var push = calling(Array.prototype.push)

function Scaner($startNode) {
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
			var items = $([id, '[' + attr + ']', '[' + $plus.attr + ']'].join(' '))
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
			if (vm.instance) {
				push(vm.instance, $node[0])
			} else {
				method = method.split('-')
				vm['method'] = method[0]
				vm['params'] = method[1] ? [method[1]] : []
				vm['instance'] = $node
				vm['lastValue'] = null
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
	var elem = this[0]
	var vmIndex = elem.vmIndex
	var isNum = typeof vmIndex === 'number'
	var vm
	if (isNum) {
		vm = $plus.viewModel[vmIndex]
		return rescan ? vm.rescan().get() : vm.get()
	}
	vm = new Scaner(this)
	$plus.viewModel[elem.vmIndex = $plus.viewModel.length] = vm
	return vm.scan().get()
}