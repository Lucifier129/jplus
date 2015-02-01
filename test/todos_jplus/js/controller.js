/**
 * @File: controller.js
 * @Author: Jade
 * @Date: 2015.02.01
 */
;
(function($) {
	$.app = $.app || {}
	var model = $.app.model
	var view = $.app.view
	var controller = $.app.controller = {}

	model.init()

	$.each(view, function(_, viewModel) {
		viewModel.init()
	})


	controller.route = {
		'/': function() {
			var allTodos = model.getAllTodos()
			var completedTodos = model.getCompletedTodos()
			var activeTodos = model.getActiveTodos()
			view['todo-list'].refresh({
				todos: allTodos
			})
			view['clear-completed'].refresh(completedTodos.length)
			view['todo-count'].refresh(activeTodos.length)
		},
		'/active': function() {
			var activeTodos = model.getActiveTodos()
		}
	}



	controller.saveTodos = function() {
		$('#todo-list li').each(function() {
			var $elem = $(this)
			model.saveTodo({
				id: $elem.data('id'),
				completed: $elem.hasClass('completed'),
				title: $elem.text()
			})
		})
	}

	controller.addEvent = function() {
		var that = this

		$(window).on('beforeunload', function() {
			that.saveTodos()
		})


		$(document)
			.on('blur', '#new-todo', function() {
				var val = this.value
				if (val && val !== this.defaultValue) {
					var newTodo = {
						completed: false,
						title: val
					}
					view['todo-list'].add(newTodo)
					model.saveTodo(newTodo)
				}
			})
			.on('keyup', function(e) {
				if (e.keyCode === 13) {
					$('#new-todo').trigger('blur')
				}
			})
			.on('click', '#toggle-all', function() {
				$('#todo-list li').toggleClass('completed')

			})
			.on('click', '#todo-list li .destroy', function() {
				var $item = $(this).closest('li')
				model.removeTodoById($item.data('id'))
				$item.remove()
			})
	}

}(window.jQuery))