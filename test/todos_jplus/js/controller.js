/**
 * @File: controller.js
 * @Author: Jade
 * @Date: 2015.02.01
 */
;
(function($) {

	var model = $.app.model
	var view = $.app.view
	var controller = $.app.controller = {}

	var ENTER_KEY = 13
	var ESCAPE_KEY = 27


	controller.route = function(hash) {
		var data = {
			'/': model.getAllTodos(),
			'/active': model.getActiveTodos(),
			'/completed': model.getCompletedTodos()
		}
		if (!(hash in data)) {
			return
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
		this.updateToggleAll()
	}

	controller.updateFooter = function() {
		var allTodosLen = model.getAllTodos().length
		var completedLen = model.getCompletedTodos().length
		var activeLen = model.getActiveTodos().length
		view['clear-completed'].refresh(completedLen)
		view['todo-count'].refresh(activeLen)
		if (!allTodosLen) {
			$('#footer').hide()
		} else {
			$('#footer').show()
		}
	}

	controller.updateToggleAll = function() {
		var allTodosLen = model.getAllTodos().length
		var completedLen = model.getCompletedTodos().length
		var toggleAll = document.getElementById('toggle-all')
		if (allTodosLen && allTodosLen === completedLen) {
			toggleAll.checked = true
		} else {
			toggleAll.checked = false
		}
	}

	controller.saveTodos = function() {
		var todos = view['todo-list'].getTodos()
		$.each(todos, function(i, todo) {
			model.saveTodo(todo)
		})
	}

	controller.update = function() {
		this.route(this.getHash())
	}

	controller.getHash = function() {
		return '/' + location.hash.replace('#/', '')
	}

	controller.checkTodo = function(todo) {
		if (!todo) {
			return
		}
		var hash = this.getHash()
		switch (hash) {
			case '/':
				break
			case '/active':
				if (todo.completed) {
					view['todo-list'].removeItem(todo.id)
				}
				break
			case '/completed':
				if (!todo.completed) {
					view['todo-list'].removeItem(todo.id)
				}
				break
		}
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
				document.getElementById('new-todo').focus()
			})


		$(document)

			//触发写入新todo
			.on('blur', '#new-todo', function() {
				$(document).off('keyup.newTodo')
			})

			//写入新todo
			.on('focus', '#new-todo', function(e) {
				$(document).on('keyup.newTodo', function(e) {
					if (e.keyCode === ENTER_KEY) {
						var todo = view['new-todo'].getNewTodo()
						view['new-todo'].clear()
						model.saveTodo(todo)
						view['todo-list'].addItem(todo)
						that.checkTodo(todo)
						that.updateFooter()
						that.updateToggleAll()
					}
				})
			})

			//切换选中所有与放弃所有
			.on('change', '#toggle-all', function() {
				var allTodos = model.getAllTodos()
				var checked = this.checked
				$.each(allTodos, function(i, todo) {
					todo.completed = checked
					model.saveTodo(todo)
				})
				that.update()
			})

			//切换单个todo项
			.on('change', '#todo-list li .toggle', function() {
				var $item = $(this).closest('li')
				$item.isCompleted(this.checked)
				var todo = view['todo-list'].getTodo($item.get(0))
				model.saveTodo(todo)
				that.checkTodo(todo)
				that.updateFooter()
				that.updateToggleAll()
			})

			//销毁单个todo项
			.on('click', '#todo-list li .destroy', function() {
				var $item = $(this).closest('li')
				var id = $item.attr('data-id')
				model.removeTodoById(id)
				view['todo-list'].removeItem(id)
				that.updateFooter()
				that.updateToggleAll()
			})

			//清除所有已完成的todo项
			.on('click', '#clear-completed', function() {
				var completedTodos = model.getCompletedTodos()
				$.each(completedTodos, function() {
					model.removeTodoById(this.id)
					view['todo-list'].removeItem(this.id)
				})
				that.updateFooter()
				that.updateToggleAll()
			})

			//编辑一个todo项
			.on('dblclick', '#todo-list li label', function() {
				var $item = $(this).closest('li')
				view['todo-list'].startEdit($item)
			})

			//编辑内容处理
			.on('blur', '#todo-list li .edit', function() {
				var $item = $(this).closest('li')
				var todo = view['todo-list'].endEdit($item)
				if (todo === '') {
					var id = $item.attr('data-id')
					model.removeTodoById(id)
					view['todo-list'].removeItem(id)
					that.updateFooter()
					that.updateToggleAll()
				} else if ($.isPlainObject(todo)) {
					model.saveTodo(todo)
					view['todo-list'].refreshItem(todo)
				}
				$(document).off('keyup.endEdit')
			})

			//触发编辑todo项完成
			.on('focus', '#todo-list li .edit', function() {
				var $this = $(this)
				$(document).on('keyup.endEdit', function(e) {
					var keyCode = e.keyCode
					if (keyCode === ESCAPE_KEY || keyCode === ENTER_KEY) {
						$this.trigger('blur')
					}
				})
			})
	}

	controller.init = function() {
		model.init()
		this.addEvent()
	}

}(window.jQuery));