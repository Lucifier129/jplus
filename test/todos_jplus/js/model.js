/**
* @File: model.js
* @Author: Jade
* @Date: 2015.02.01
*/
;(function ($) {

	$.app = $.app || {}


	var Store = $.Store

	$.app.model = {

		getData: function() {
			return this.store.getData()
		},

		getAllTodos: function() {
			return this.getData().todos
		},

		getCompletedTodos: function() {
			var todos = this.getAllTodos()
			var result = todos.filter(function(todo) {
				return todo.completed
			})
			return result
		},

		getActiveTodos: function() {
			var todos = this.getAllTodos()
			var result = todos.filter(function(todo) {
				return !todo.completed
			})
			return result
		},

		getTodoById: function(id) {
			return this.store.find(id)
		},

		saveTodo: function(todo) {
			if ($.isPlainObject(todo)) {
				this.store.save(todo)
			}
		},

		removeTodoById: function(id) {
			this.store.remove(id)
		},

		saveLocalStorage: function() {
			this.store.saveLocalStorage()
		},

		init: function() {
			this.store = new Store('jplus-todos')
		}
	}


}(window.jQuery));