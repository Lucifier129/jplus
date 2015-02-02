/**
 * @File:store.js
 * @Author: Jade Gu
 * @Date: 2015.01.26
 */
;
(function($) {
	'use strict';

	function Store(name, callback) {
		this.dbname = name
		var data = JSON.parse(localStorage[name])

		if (!data) {
			var data = {
				todos: []
			}
		}
		this.data = data
		this.invoke(callback, data)
	}

	Store.prototype = {

		saveLocalStorage: function() {
			localStorage[this.dbname] = JSON.stringify(this.data)
		},

		checkId: function(id) {
			return !id
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
			this.invoke(callback, this.data)
			return this.data
		},

		save: function(newData, callback) {
			if (this.checkValue(newData)) {
				return
			}
			var data = this.getData()
			var todos = data.todos
			var todo

			if (newData.id) {
				for (var i = todos.length - 1; i >= 0; i--) {
					if (todos[i].id == newData.id) {
						todo = todos[i]
						break
					}
				}
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
		},

		find: function(id, callback) {
			if (this.checkId(id)) {
				return null
			}
			var data = this.getData()
			var todos = data.todos
			var todo

			for (var i = todos.length - 1; i >= 0; i--) {
				todo = todos[i]
				if (todo.id == id) {
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
				if (todo.id == id) {
					todos.splice(i, 1)
					this.invoke(callback, todo)
					break
				}
			}
		},

		drop: function(callback) {
			this.invoke(callback, this.getData())
			this.data = {
				todos: []
			}
		},

		replace: function(data, callback) {
			this.invoke(callback, this.getData)
			this.data = data
		}

	}

	$.Store = Store

})(window.jQuery);