/**
 *File: jplus.js
 *Author: Jade
 *Date: 2014.11.20
 */
;(function(factory) {
	if (typeof define === 'function') {
		var paths = {}
		if (define.amd) {
			paths = requirejs.s.contexts._.config.paths
		} else if (define.cmd) {
			paths = seajs.data.alias
		}
		if ('jquery' in paths) {
			define(function(require) {
				var $ = require('jquery')
				factory($, window)
				return $
			})
		} else if ('zepto' in paths) {
			define(function(require) {
				var $ = require('zepto')
				factory($, window)
				return $
			})
		}
	} else {
		factory(window.jQuery || window.Zepto || window, window)
	}
})(function($, global) {