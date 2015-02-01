/**
 * @File:store.js
 * @Author: Jade Gu
 * @Date: 2015.01.26
 */
;(function($) {
	'use strict';

	function Store(name, callback) {
		this.dbname = name
		if (!localStorage[name]) {
			var data = {
				todos: []
			}

			localStorage[name] = JSON.stringify(data)
			callback.call(this, data)

		} else {
			callback.call(this, JSON.parse(localStorage[name]))
		}
	}

	Store.prototype = {

		checkId: function(id) {
			return typeof id !== 'string'
		},

		checkValue: function(newValue) {
			return typeof newValue !== 'object'
		},

		invoke: function(callback) {
			if (typeof callback === 'function') {
				callback.apply(this, Array.prototype.slice.call(arguments, 1))
			}
		},

		getData: function(callback) {
			var data = JSON.parse(localStorage[this.dbname])
			this.invoke(callback, data)
			return data
		},

		save: function(newData, callback) {
			if (this.checkValue(newData) || this.checkId(id)) {
				return
			}
			var data = this.getData()
			var todos = data.todos
			var todo

			if (newData.id) {
				todo = this.find(newData.id)
				if (todo) {
					for (var key in newData) {
						if (newData.hasOwnProperty(key)) {
							todo[key] = newData[key]
						}
					}
				} else {
					todos.push(newData)
					todo = newData
				}

			} else {
				newData.id = new Date().getTime()
				todos.push(newData)
				todo = newData
			}

			this.invoke(callback, todo)
			localStorage[this.dbname] = JSON.stringify(data)
		},

		find: function(id, callback) {
			if (this.checkId(id)) {
				return
			}
			var data = this.getData()
			var todos = data.todos
			var todo
			for (var i = todos.length - 1; i >= 0; i--) {
				todo = todos[i]
				if (todo.id === 'id') {
					this.invoke(callback, todo)
					return todo
				}
			}
			return null
		},

		remove: function(id, callback) {
			if (this.checkId(id)) {
				return
			}
			var data = this.getData()
			var todos = data.todos
			var todo
			for (var i = todos.length - 1; i >= 0; i--) {
				todo = todos[i]
				if (todo.id === 'id') {
					todos.splice(i, 1)
					this.invoke(callback, todo)
				}
			}
		},

		drop: function(callback) {
			this.invoke(callback, this.getData())
			localStorage[this.dbname] = JSON.stringify({todos: [])
		}，

		replace: function(data, callback) {
			this.invoke(callback, this.getData)
			localStorage[this.dbname] = JSON.stringify(data)
		}

	}

	$.Store = Store

})(window.jQuery);