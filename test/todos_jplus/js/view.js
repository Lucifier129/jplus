/**
 * @File: view.js
 * @Author: Jade
 * @Date: 2015.02.01
 */
;(function($) {


	$.app = $.app || {}

	var view = $.app.view = {}

	var todo_item_template =
		'<li js="refresh:todos;data-id:id;isCompleted:completed;" noscan>\
			<div class="view">\
				<input class="toggle" type="checkbox">\
				<label js="text:title"></label>\
				<button class="destroy"></button>\
			</div>\
			<input class="edit">\
		</li>'

	$.fn.isCompleted = function(completed) {
		return this.each(function() {
			var $this = $(this)
			if (completed) {
				$this.addClass('completed')
				$this.find('.toggle').attr('checked', 'checked')
			} else {
				$this.removeClass('completed')
				$this.find('.toggle').removeAttr('checked')
			}
		})
	}

	view['todo-list'] = {

		id: 'todo-list',

		template: todo_item_template,

		getElem: function() {
			return $('#' + this.id)
		},

		getTodos: function() {
			var that = this
			var result = []
			var $elem = this.getElem()
			$elem.find('li').each(function() {
				var todo = that.getTodo(this)
				result.push(todo)
			})
			return result
		},

		getTodo: function(index) {
			var $elem = this.getElem()
			var $target
			if (typeof index === 'number') {
				$target = $elem.find('eq(' + index + ')')
			} else if (index.nodeName) {
				$target = $(index)
			}
			var result = {
				id: $target.data('id'),
				completed: $target.hasClass('completed'),
				title: $target.find('label').text()
			}
			return result
		},

		getCompleted: function() {
			return this.getElem().find('.completed')
		},

		getActive: function() {
			return this.getElem().find('li').filter(function() {
				return !$(this).hasClass('completed')
			})
		},

		getAll: function() {
			return this.getElem().children()
		},

		refresh: function(data) {
			var $elem = this.getElem()
			if ($.isPlainObject(data)) {
				this.data = data
			} else {
				data = this.data
			}
			if (!$elem.children().length) {
				$elem.html(this.template)
			}
			$elem.refresh(data)
		},

		startEdit: function($item) {
			var title = $item.find('label').text()
			var input = $item.find('.edit').get(0)
			input.value = title
			$item.addClass('editing')
			input.focus()
		},

		endEdit: function($item) {
			$item.removeClass('editing')
			var val = $item.find('.edit').val()
			var $label = $item.find('label')
			var title = $label.text()
			val = $.trim(val)
			if (!val) {
				return ''
			} else if (val === title) {
				return null
			} else {
				$label.text(val)
				return this.getTodo($item.get(0))
			}
		}
	}

	view['todo-count'] = {

		id: 'todo-count',

		getElem: function() {
			return $('#' + this.id)
		},

		refresh: function(count) {
			if (typeof count !== 'number') {
				return this
			}
			var $elem = this.getElem()
			if (count > 0) {
				var text = count + ' item left'
				$elem.text(text)
			} else if (count === 0) {
				$elem.empty()
			}

			return this
		}
	}

	view['clear-completed'] = {

		id: 'clear-completed',

		getElem: function() {
			return $('#' + this.id)
		},

		refresh: function(count) {
			if (typeof count !== 'number') {
				return this
			}
			var $elem = this.getElem()
			if (count > 0) {
				var text = 'Clear completed (' + count + ')'
				$elem.text(text)
			} else if (count === 0) {
				$elem.empty()
			}

			return this
		}
	}

	view['new-todo'] = {
		id: 'new-todo',

		getElem: function() {
			return document.getElementById(this.id)
		},

		getNewTodo: function() {
			var elem = this.getElem()
			var val = elem.value
			val = $.trim(val)
			if (val && val !== this.defaultValue) {
				var todo = {
					id: new Date().getTime(),
					completed: false,
					title: val
				}
				return todo
			}
		},

		clear: function() {
			this.getElem.value = ''
		}
	}


}(window.jQuery))