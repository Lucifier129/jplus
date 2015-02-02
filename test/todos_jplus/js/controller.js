/**
 * @File: controller.js
 * @Author: Jade
 * @Date: 2015.02.01
 */
;(function($) {

	var model = $.app.model
	var view = $.app.view
	var controller = $.app.controller = {}


	controller.route = function(hash) {
		var data = {
			'/': model.getAllTodos(),
			'/active': model.getActiveTodos(),
			'/completed': model.getCompletedTodos()
		}
		view['todo-list'].refresh({
			todos: data[hash]
		})
		view['clear-completed'].refresh(data['/completed'].length)
		view['todo-count'].refresh(data['/active'].length)
		$('#filters .selected').removeClass('selected')
		$('#filters [href="#' + hash + '"]').addClass('selected')
		if (!data['/'].length) {
			$('#footer').hide()
		} else {
			$('#footer').show()
		}
	}

	controller.saveTodos = function() {
		var todos = view['todo-list'].getTodos()
		$.each(todos, function(i, todo) {
			model.saveTodo(todo)
		})
	}

	controller.update = function() {
		var hash = '/' + location.hash.replace('#/', '')
		this.route(hash)
	}

	controller.addEvent = function() {
		var that = this

		$(window)
			.on('beforeunload', function() {
				model.saveLocalStorage()
			})
			.on('hashchange', function() {
				that.update()
			})
			.on('load', function() {
				that.update()
				$('#newTodo').trigger('focus')
			})


		$(document)
			.on('blur', '#new-todo', function() {
				$(document).off('newTodo')
			})
			.on('focus', '#new-todo', function(e) {
				$(document).on('keyup.newTodo', function(e) {
					if (e.keyCode === 13) {
						var todo = view['new-todo'].getNewTodo()
						view['new-todo'].clear()
						model.saveTodo(todo)
						that.update()
					}
				})
			})
			.on('change', '#toggle-all', (function() {
				var status = 0
				return function() {
					var allTodos = model.getAllTodos()
					$.each(allTodos, function(i, todo) {
						todo.completed = !status
					})
					status = (status + 1) % 2
					that.update()
				}
			})())
			.on('change', '#todo-list li .toggle', function() {
				var $item = $(this).closest('li')
				var todo = view['todo-list'].getTodo($item.get(0))
				todo.completed = this.checked
				model.saveTodo(todo)
				that.update()
			})
			.on('click', '#todo-list li .destroy', function() {
				var $item = $(this).closest('li')
				var id = $item.data('id')
				model.removeTodoById(id)
				that.update()
			})
			.on('click', '#clear-completed', function() {
				var completedTodos = model.getCompletedTodos()
				$.each(completedTodos, function() {
					model.removeTodoById(this.id)
				})
				that.update()
			})
			.on('dblclick', '#todo-list li label', function() {
				var $item = $(this).trigger('focus').closest('li')
				view['todo-list'].startEdit($item)
			})
			.on('blur', '#todo-list li .edit', function() {
				var $item = $(this).closest('li')
				var todo = view['todo-list'].endEdit($item)
				if (todo === '') {
					var id = $item.data('id')
					model.removeTodoById(id)
					that.update()
				} else if ($.isPlainObject(todo)) {
					model.saveTodo(todo)
					that.update()
				}
			})
	}

	controller.init = function() {
		model.init()
		this.addEvent()
	}

}(window.jQuery));