//swipe.js
var suportTouch = 'ontouchstart' in document,
	eventType = suportTouch ? {
		start: 'touchstart',
		move: 'touchmove',
		end: 'touchend'
	} : {
		start: 'mousedown',
		move: 'mousemove',
		end: 'mouseup'
	},
	getCoor = function(e) {
		getCoor = 'touches' in e ? function(e) {
			var touch = e.touches[0];
			return {
				x: touch.clientX,
				y: touch.clientY
			};
		} : function(e) {
			return {
				x: e.clientX,
				y: e.clientY
			};
		};
		return getCoor(e);
	},
	addEvent = document.addEventListener ? function(elem, type, callback) {
		elem.addEventListener(type, callback, false);
	} : function(elem, type, callback) {
		elem.attachEvent('on' + type, callback);
	},
	removeEvent = document.removeEventListener ? function(elem, type, callback) {
		elem.removeEventListener(type, callback);
	} : function(elem, type, callback) {
		elem.detachEvent('on' + type, callback);
	},
	setImmediate = typeof window.setImmediate === "function" ? function(fn) {
		window.setImmediate(fn);
	} : function(fn) {
		window.setTimeout(fn, 0);
	};


function Swipe(elem, callback) {
	this.elem = elem;
	this.callback = callback;
	this.data = {
		start: {},
		move: {}
	};
}

Swipe.prototype = {
	eventType: eventType,
	init: function() {
		return this.addSwipe();
	},
	addSwipe: function() {
		var self = this;
		this.START = function(e) {
			self.start.call(self, e);
		};
		addEvent(this.elem, this.eventType.start, this.START);
		return this;
	},
	removeSwipe: function() {
		removeEvent(this.elem, this.eventType.start, this.START);
		return this;
	},
	addEvent: function(eName, callback) {
		if (typeof eName === 'string' && $.isFunction(callback)) {
			this.callback[eName] = callback;
		}
		return this;
	},
	addDocEvent: function() {
		var self = this;
		this.MOVE = function(e) {
			self.move.call(self, e);
		};
		this.END = function(e) {
			self.end.call(self, e);
		};
		addEvent(document, this.eventType.move, this.MOVE);
		addEvent(document, this.eventType.end, this.END);
	},
	removeDocEvent: function() {
		removeEvent(document, this.eventType.move, this.MOVE);
		removeEvent(document, this.eventType.end, this.END);
	},
	preventDefault: function(e) {
		'preventDefault' in (e = e || window.event) ? e.preventDefault() : (e.returnValue = false);
	},
	start: function(e) {
		var self = this,
			elem = self.elem,
			data = self.data,
			callback = self.callback,
			client = getCoor(e);
		self.preventDefault(e);
		data.start.x = data.move.x = client.x;
		data.start.y = data.move.y = client.y;
		data.start.timeStamp = +new Date();
		data.start.begin = true;
		data.start.dir = function(y, x) {
			var dir = Math.atan2(Math.abs(y), Math.abs(x)) * (180 / Math.PI);
			data.start.dir = function() {
				return dir;
			};
			return dir;
		};
		'start' in callback && callback.start.call(elem, e, data.start);
		setImmediate(function() {
			self.addDocEvent();
		});
	},
	move: function(e) {
		var data = this.data,
			elem = this.elem,
			callback = this.callback,
			client = getCoor(e);
		this.preventDefault(e);
		data.move.dir = data.start.dir(client.y - data.start.y, client.x - data.start.x);
		data.move.x = client.x - data.move.x;
		data.move.y = client.y - data.move.y;
		'move' in callback && callback.move.call(elem, e, data.move);
		data.move.x = client.x;
		data.move.y = client.y;
	},
	end: function(e) {
		var data = this.data,
			elem = this.elem,
			callback = this.callback;
		this.preventDefault(e);
		this.removeDocEvent();
		data.start.begin = false;
		data.end = {
			x: data.move.x - data.start.x,
			y: data.move.y - data.start.y,
			t: +new Date() - data.start.timeStamp,
			dir: {},
			stop: false
		};
		if (data.end.t < 220 && Math.max(Math.abs(data.end.x), Math.abs(data.end.y)) > 10) {
			if (data.move.dir > 30) {
				data.end.dir[data.end.y > 0 ? 'down' : 'up'] = 1;
			} else {
				data.end.dir[data.end.x > 0 ? 'right' : 'left'] = 1;
			}
			for (var prop in data.end.dir) {
				if (prop in callback) {
					data.end.stop = true;
					callback[prop].call(elem, e, data.end);
				}
			}
			return;
		} else if (data.end.t < 200 && Math.max(Math.abs(data.end.x), Math.abs(data.end.y)) < 10) {
			if ('tap' in callback) {
				if (suportTouch) {
					var target = e.target;
					if (target.nodeName === 'A') {
						setTimeout(function() {
							target.click();
						}, 0);
					} else if (target.parentNode.nodeName === 'A') {
						setTimeout(function() {
							target.parentNode.click();
						}, 0);
					}
				}
				callback.tap.call(elem, e, data);
			}
			return;
		}
		if (!data.end.stop && 'end' in callback) {
			callback.end.call(elem, e, data.end, data.move);
		}
	}
};


$.fn.swipe = function(callback) {
	if (!callback || !$.isPlainObject(callback)) return this;
	return this.each(function() {
		$(this).data('swipe', new Swipe(this, callback).init());
	});
};