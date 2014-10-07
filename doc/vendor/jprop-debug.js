/*==================================================
 Copyright 2014 Jade Gu
 http://weibo.com/islucifier
 Released under the MIT license
2014.10.06
 ==================================================*/
;(function($, undefined) {
	'use strict';
//css3fix
var style = document.getElementsByTagName('body')[0].style,
	prefix = ['', '-webkit-', '-moz-', '-ms-', '-o-'],
	len = prefix.length,
	camelCase = $.camelCase;

$.css3fix = function(prop) {
	var i = 0, fixed;
	for (; i < len; i += 1) {
		fixed = camelCase(prefix[i] + prop);
		if (fixed in style) {
			return fixed;
		}
	}
	return false;
};
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
//swipeshow.js
var transform = $.css3fix('transform'),
	transition = $.css3fix('transition'),
	offsetMethod,
	styleElement;
if (transform && transition) {
	offsetMethod = {
		setX: function(elem, value) {
			elem.style[transform] = 'translateX(' + value + 'px)';
		},
		setY: function(elem, value) {
			elem.style[transform] = 'translateY(' + value + 'px)';
		},
		animateX: function(elem, value, callback) {
			$(elem).addClass('transi-for-swipeshow');
			offsetMethod.setX(elem, value);
			setTimeout(callback, 400);
		},
		animateY: function(elem, value, callback) {
			$(elem).addClass('transi-for-swipeshow');
			offsetMethod.setY(elem, value);
			setTimeout(callback, 400);
		}
	};
	styleElement = document.createElement('style');
	styleElement.type = 'text/css';
	styleElement.innerHTML = '.transi-for-swipeshow { -webkit-transition: all .4s ease-out; -moz-transition: all .4s ease-out; transition: all .4s ease-out;}';
	document.getElementsByTagName('head')[0].appendChild(styleElement);
} else {
	offsetMethod = {
		setX: function(elem, value) {
			elem.style.marginLeft = value + 'px';
		},
		setY: function(elem, value) {
			elem.style.marginTop = value + 'px';
		},
		animateX: function(elem, value, callback) {
			$(elem).animate({
				marginLeft: value
			}, 400, callback);
		},
		animateY: function(elem, value, callback) {
			$(elem).animate({
				marginTop: value
			}, 400, callback);
		}
	};
}


$.fn.swipeshow = function(options) {
	var settings = {
		dir: 'x',
		className: 'cur',
		speed: 3000,
		auto: true,
		type: 'click'
	};
	$.extend(settings, options);
	settings.dir = settings.dir.toUpperCase();

	var self = this,
		setter = offsetMethod['set' + settings.dir],
		animate = offsetMethod['animate' + settings.dir],
		parent = self.parent(),
		children = self.children(),
		length = children.length,
		width = parent.width(),
		height = parent.height(),
		position = parent.css('position'),
		x_axis = /x/i.test(settings.dir),
		elem_arr = [],
		preventDefault = true,
		distance,
		clone;
	if (length <= 1) {
		return this;
	} else if (length === 2) {
		children.each(function() {
			self.append($(this).clone(true));
		});
		children = self.children();
		length = 4;
		clone = true;
	}

	children.each(function() {
		elem_arr.push($(this));
	});

	distance = x_axis ? width : height;
	options = settings.opts ? $(settings.opts).children() : null;

	parent.css({
		position: /absolute|fixed|relative/.test(position) ? parent.css('position') : 'relative',
		overflow: 'hidden'
	});

	children.css({
		'float': 'left',
		width: width,
		height: height
	});

	self.css({
		position: 'absolute',
		top: 0,
		left: 0,
		width: x_axis ? width * length : width,
		height: x_axis ? height : height * length
	}).on('click', 'a', function(e) {
		if (preventDefault) {
			e.preventDefault();
		} else {
			preventDefault = true;
		}
	});

	var index = 0,
		offset = 0,
		count = 0,
		elem = self[0],
		animated = true,
		timer = null,
		hover,
		opts_parent,
		handler = ({
			check: function(value) {
				var diff = value - index;
				if (value > index) {
					count -= diff;
					count = count < 0 ? count + length : count;
				} else if (value < index) {
					count = (count - diff) % length;
				}
				index = value;
				offset = index * distance;
				return this;
			},
			callback: function() {
				var set = false;
				if (index === 0) {
					index = -1;
					self.children().last().prependTo(self);
					set = true;
				} else if (index === 1 - length) {
					index = 2 - length;
					self.children().first().appendTo(self);
					set = true;
				}
				if (set) {
					offset = index * distance;
					setter(transition ? self.removeClass('transi-for-swipeshow')[0] : elem, offset);
				}
				animated = true;
			},
			slide: function() {
				animated = false;
				animate(elem, offset, this.callback);
				if (options) {
					if (clone) {
						options.removeClass(settings.className)
							.eq(count % 2).add(options.eq(count))
							.addClass(settings.className);
					} else {
						options.eq(count).addClass(settings.className)
							.siblings().removeClass(settings.className);
					}
				}
				return this;
			},
			normal: function() {
				if (!animated) {
					return;
				}
				handler.check(Math.round(offset / distance)).slide();
				settings.callback && settings.callback.call(self, clone ? count % 2 : count);
			},
			next: function() {
				if (!animated) {
					return this;
				}
				handler.check(index - 1).slide();
				settings.callback && settings.callback.call(self, clone ? count % 2 : count);
				return this;
			},
			prev: function() {
				if (!animated) {
					return;
				}
				handler.check(index + 1).slide();
				settings.callback && settings.callback.call(self, clone ? count % 2 : count);
			}
		}).check(0).slide();

	self.swipe({
		tap: function() {
			preventDefault = false;
			handler.normal();
		},
		start: function() {
			if (!animated) {
				return;
			}
			self.removeClass('transi-for-swipeshow');
		},
		move: function(e, data) {
			if (!animated) {
				return;
			}
			offset += data[settings.dir.toLowerCase()];
			setter(elem, offset);
		},
		end: handler.normal,
		up: x_axis ? handler.normal : handler.next,
		down: x_axis ? handler.normal : handler.prev,
		left: x_axis ? handler.next : handler.normal,
		right: x_axis ? handler.prev : handler.normal
	});

	if (options && settings.type) {
		opts_parent = options.parent().on(settings.type, options.get(0).nodeName.toLowerCase(), function() {
			if (!animated) {
				return;
			}
			handler.check(-elem_arr[$(this).index()].index()).slide();
		});
	}

	if (settings.auto) {
		hover = function(e) {
			e.preventDefault();
			e.type === 'mouseenter' ? clearTimeout(timer) : handler.loop();
		};
		handler.loop = function() {
			timer = setTimeout(function() {
				handler.next().loop();
			}, settings.speed);
		};
		parent.on('mouseenter mouseleave', hover).data('hover', true);
		opts_parent && !opts_parent.parent().data('hover') && opts_parent.on('mouseenter mouseleave', hover);
		handler.loop();
	}

	if (settings.next) {
		settings.next = $(settings.next);
		settings.next.on('click', handler.next);
		hover && settings.next.parent().data('hover') || settings.next.on('mouseenter mouseleave', hover);

	}
	if (settings.prev) {
		settings.prev = $(settings.prev);
		settings.prev.on('click', handler.prev);
		hover && settings.prev.parent().data('hover') || settings.prev.on('mouseenter mouseleave', hover);
	}
	return this;
};
}(jQuery || Zepto));