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
	swipe = function(elem, callback) {
		var data = {
				start: {},
				move: {}
			},
			fn = {
				start: function(e) {
					'preventDefault' in (e = e || window.event) ? e.preventDefault() : (e.returnValue = false);
					var client = getCoor(e);
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
					'start' in callback && callback.start.call(this, e, data.start);
					setImmediate(function() {
						addEvent(document, eventType.move, fn.move);
						addEvent(document, eventType.end, fn.end);
					});
				},
				move: function(e) {
					'preventDefault' in (e = e || window.event) ? e.preventDefault() : (e.returnValue = false);
					var client = getCoor(e);
					data.move.dir = data.start.dir(client.y - data.start.y, client.x - data.start.x);
					data.move.x = client.x - data.move.x;
					data.move.y = client.y - data.move.y;
					'move' in callback && callback.move.call(elem, e, data.move);
					data.move.x = client.x;
					data.move.y = client.y;
				},
				end: function(e) {
					'preventDefault' in (e = e || window.event) ? e.preventDefault() : (e.returnValue = false);
					removeEvent(document, eventType.move, fn.move);
					removeEvent(document, eventType.end, fn.end);
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
					}!data.end.stop && 'end' in callback && callback.end.call(elem, e, data.end, data.move);
				}
			};

		addEvent(elem, eventType.start, fn.start);
	},
	setImmediate = typeof window.setImmediate === "function" ? function(fn) {
		window.setImmediate(fn);
	} : function(fn) {
		window.setTimeout(fn, 0);
	};

$.fn.swipe = function(callback) {
	return this.each(function() {
		swipe(this, callback);
	});
};