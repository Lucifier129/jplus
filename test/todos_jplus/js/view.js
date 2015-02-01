/**
* @File: view.js
* @Author: Jade
* @Date: 2015.02.01
*/
;(function($) {


	$.app = $.app || {}

	var view = $.app.view = {}

	var todo_item_template =
		'<li js="refresh:todos;data-id:id;attr-class:completed;" noscan>\
			<div class="view">\
				<input class="toggle" type="checkbox">\
				<label js="text:title"></label>\
				<button class="destroy"></button>\
			</div>\
		</li>'

	view['todo-list'] = {

		id: 'todo-list',

		template: todo_item_template,

		refresh: function(data) {

			var todos = data.todos
			var _data = {
				todos: []
			}
			var _todos = _data.todos
			$.each(todos, function(i, todo) {
				var item = _todos[i] = $.extend({}, todo)
				item.completed = todo.completed ? 'completed' : ''
			})

			if ($.isPlainObject(data)) {
				this.$elem.refresh(data)
			}
		},

		add: function(data) {
			var $item = $(this.template)
			$item.refresh(data)
			this.$elem.append($item)
		},

		remove: function(index) {
			this.$elem.find('li:eq(' + index + ')').remove()
		},

		init: function(data) {
			this.$elem = $('#' + this.id)
			this.$elem.html(this.template).refresh(data)
		}
	}

	view['todo-count'] = {

		id: 'todo-count',

		refresh: function(count) {
			if (typeof count !== 'number') {
				return this
			}

			if (count > 0) {
				var text = count + ' item left'
				this.$elem.text(text)
			} else if (count === 0) {
				this.$elem.empty()
			}

			return this
		},

		init: function(count) {
			this.$elem = $('#' + this.id)
			this.refresh(count)
		}
	}

	view['clear-completed'] = {

		id: 'clear-completed',

		refresh: function(count) {
			if (typeof count !== 'number') {
				return this
			}

			if (count > 0) {
				var text = 'Clear completed (' + count + ')'
				this.$elem.text(text)
			} else if (count === 0) {
				this.$elem.empty()
			}

			return this
		},

		init: function(count) {
			this.$elem = $('#' + this.id)
			this.$elem.refresh(count)
		}
	}


}(window.jQuery))