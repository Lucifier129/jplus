/**
 * Presenter.js
 */

$.app = $.app || {};

(function(app) {

	var ENTER_KEY = 13
	var ESCAPE_KEY = 27

	function Presenter(View, Model) {
		this.View = View
		this.Model = Model
	}

	Presenter.prototype.init = function() {
		this.model = new this.Model('todos-jplus2')
		this.$scope = $('#todoapp')
		$.extend(this.$scope, {
			directive: this.View
		})
		this.listen()
		return this
	}

	Presenter.prototype.route = function(hash) {
		var mapping = {
			'/': 'getAll',
			'/active': 'getActive',
			'/completed': 'getCompleted'
		}
		if (!mapping.hasOwnProperty(hash)) {
			return
		}
		var data = {}
		for (var key in mapping) {
			if (mapping.hasOwnProperty(key)) {
				data[key] = this.model[mapping[key]]()
			}
		}
		var model = {
			list: {
				todos: data[hash]
			},
			hash: hash,
			actLen: data['/active'].length,
			comLen: data['/completed'].length
		}
		model.allCompleted = model.comLen === model.list.todos.length && model.comLen
		this.$scope.refresh(model)
	}

	Presenter.prototype.update = function() {
		var hash = '/' + location.hash.replace('#/', '')
		this.route(hash)
	}

	Presenter.prototype.listen = function() {
		var that = this

		function newTodo(value) {
			var data = new Date()
			that.model.addTodo({
				id: data.getTime(),
				time: data.toLocaleString(),
				completed: false,
				title: value
			})
			that.update()
		}

		function endEidted(input) {
			var $li = $(input).closest('li')
			var $label = $li.find('label')
			var id = $li.attr('data-id')
			var val = input.value
			if (!val) {
				that.model.removeTodo(id)
				console.log(id)
				that.update()
			} else if (val !== $label.text()) {
				var todo = that.model.getTodo(id)
				$label.text(todo.title = val)
			}
			$li.removeClass('editing')
		}

		this.$scope
			.on('change', '#new-todo', function() {
				var val = $.trim(this.value)
				if (val && val !== this.defaultValue) {
					newTodo(val)
					this.value = ''
				}
			})
			.on('keyup', '#new-todo', function(e) {
				var val = $.trim(this.value)
				if (val && val !== this.defaultValue && e.keyCode === ENTER_KEY) {
					newTodo(val)
					this.value = ''
				}
			})
			.on('change', '#todo-list .toggle', function() {
				var $li = $(this).closest('li')
				var id = $li.attr('data-id')
				var todo = that.model.getTodo(id)
				todo.completed = this.checked
				that.update()
			})
			.on('change', '#toggle-all', function() {
				var status = this.checked
				var todos = that.model.getAll()
				todos.forEach(function(todo) {
					todo['completed'] = status
				})
				that.update()
			})
			.on('click', '#todo-list .destroy', function() {
				var $li = $(this).closest('li')
				var id = $li.attr('data-id')
				that.model.removeTodo(id)
				that.update()
			})
			.on('click', '#clear-completed', function() {
				var todos = that.model.getAll()
				for (var i = todos.length - 1; i >= 0; i--) {
					if (todos[i].completed) {
						todos.splice(i, 1)
					}
				}
				that.update()
			})
			.on('dblclick', '#todo-list label', function() {
				var $this = $(this)
				var $li = $this.closest('li').addClass('editing')
				var $edit = $li.find('.edit').val($this.text())
				$edit[0].focus()
			})
			.on('change', '#todo-list .edit', function() {
				endEidted(this)
			})
			.on('keyup', '#todo-list .edit', function(e) {
				var keyCode = e.keyCode
				if (keyCode === ESCAPE_KEY || keyCode === ENTER_KEY) {
					endEidted(this)
				}
			})
			.on('blur', '#todo-list .edit', function() {
				$(this).closest('li').removeClass('editing')
			})

		$(window)
			.on('hashchange', this.update.bind(this))
			.on('beforeunload', this.model.save.bind(this.model))
		$(document)
			.ready(this.update.bind(this))
	}

	app.Presenter = Presenter

}($.app));