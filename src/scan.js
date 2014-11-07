//scan
//requrie arr.js/inherit.js/parseAttr.js/staticMethod.js

$.plus = {
	attr: 'js',
	viewModel: []
};

function scan(node) {
	return new scan.init(node);
}

scan.init = function(node) {
	this[0] = node;
	this.collect();
}

scan.fn = scan.init.prototype = scan.prototype = extend(inherit($.fn), {
	rescan: function() {
		return this.clean().collect();
	},
	collect: function(base) {
		var self = this;
		walkTheDOM(base || this[0], function(node) {
			return self.getAttr(node);
		});
		return this;
	},
	clean: function(deep) {
		var item,
			key;
		for (key in this) {
			if (this.hasOwnProperty(key)) {
				item = this[key];
				item.removeAttr && item.removeAttr($.plus.attr);
				deep && delete this[key];
			}
		}
		return this;
	},
	getAttr: function(node) {
		if (/text/.test(node.nodeName)) return;
		var self = this,
			$node = $(node),
			jsAttrValue = $node.attr($.plus.attr);

		if (jsAttrValue) {
			each(parseJsAttr(jsAttrValue), function(prop) {
				var instance = self.hasOwnProperty(prop) && self[prop];
				if (!instance) {
					instance = self[prop] = instantiation();
					extend(instance, this);
				}
				instance[instance.length++] = node;
			});
		}
		if ($node.attr('noscan') !== undefined && $node.attr('app') && node !== self[0]) return true;
	}
});

function walkTheDOM(node, func) {
	if (func(node)) return;
	node = node.firstChild;
	while (node) {
		walkTheDOM(node, func);
		node = node.nextSibling;
	}
}

function removeAttr(node) {
	$(node).removeAttr($.plus.attr);
}

function instantiation() {
	var obj = inherit($.fn);
	obj.length = 0;
	return obj;
}

var viewModels = $.plus.viewModel;
/*
*@param {boolean} 再扫描 为true时重新扫描
*@returns {object} 返回viewModel对象
*/
$.fn.getVM = function(rescan) {
	var elem = this[0],
		viewIndex = elem['viewIndex'],
		isNum = typeof viewIndex === 'number',
		viewModel;

	if (isNum && !rescan) {
		return viewModels[viewIndex];
	}

	viewModel = scan(elem);

	if (isNum) {
		viewModels.splice(viewIndex, 1, viewModel);
	} else {
		elem['viewIndex'] = viewModels.length;
		viewModels.push(viewModel);
	}

	return viewModel;
};