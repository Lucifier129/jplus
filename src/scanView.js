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
	filter: function($sources) {
		var filterNode = []
		var $startNode = this.$startNode

		each($plus.filterAttr, function(attr) {
			filterNode.push.apply(filterNode, slice($startNode.find('[' + attr + ']' + ' [' + $plus.attr + ']')))
		})

		return $sources.filter(function() {
			return $.inArray(this, filterNode) === -1
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

		this
			.parse(this.$startNode)
			.filter(this.$startNode.find('[' + $plus.attr + ']'))
			.each(function() {
				that.parse($(this))
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