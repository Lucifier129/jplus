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
			var todos = this.getTodos()
			var result = todos.filter(function(todo) {
				return todo.completed
			})
		},

		getActiveTodos: function() {
			var todos = this.getTodos()
			var result = todos.filter(function(todo) {
				return !todo.completed
			})
		},

		getTodoById: function(id) {
			return this.store.find(id)
		},

		saveTodo: function(newTodo) {
			if ($.isPlainObject(newTodo)) {
				this.store.save(newTodo)
			}
		},

		removeTodoById: function(id) {
			this.store.remove(id)
		}

		init: function() {
			this.store = new Store('jplus-todos')
		}
	}


}(window.jQuery));