//scan
//requrie arr.js/inherit.js/parseAttr.js/staticMethod.js
function scan(node) {
	return new scan.init(node);
}

scan.init = function(node) {
	this[0] = node;
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
				item.removeAttr && item.removeAttr('js');
				deep && delete this[key];
			}
		}
		return this;
	},
	getAttr: function(node) {
		if (/text/.test(node.nodeName)) return;
		var self = this,
			$node = $(node),
			noscan = $node.attr('noscan'),
			jsAttrValue = $node.attr('js');

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
		if (noscan !== undefined) return true;
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
	$(node).removeAttr('js');
}

function instantiation() {
	var obj = inherit($.fn);
	obj.length = 0;
	return obj;
}

$.fn.getVM = function(rescan) {
	var vmodel;
	if (rescan || !(vmodel = this.data('vmodel'))) {
		vmodel = this.data('vmodel', scan(this[0]).collect()).data('vmodel');
	}
	return vmodel;
};