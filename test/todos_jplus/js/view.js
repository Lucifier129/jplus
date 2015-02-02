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
		console.log(completed)
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

		getTodos: function() {
			var that = this
			var result = []
			this.$elem.find('li').each(function() {
				var todo = that.getTodo(this)
				result.push(todo)
			})
			return result
		},

		getTodo: function(index) {
			var $target
			if (typeof index === 'number') {
				$target = this.$elem.find('eq(' + index + ')')
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
			return this.$elem.find('.completed')
		},

		getActive: function() {
			return this.$elem.find('li').filter(function() {
				return !$(this).hasClass('completed')
			})
		},

		getAll: function() {
			return this.$elem.children()
		},

		refresh: function(data) {
			if ($.isPlainObject(data)) {
				this.data = data
			} else {
				data = this.data
			}
			if (!this.$elem.children().length) {
				this.$elem.html(this.template)
			}
			this.$elem.refresh(data)
		},

		startEdit: function($item) {
			var title = $item.find('label').text()
			$item.find('.edit').val(title)
			$item.addClass('editing')
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
		},

		init: function() {
			this.$elem = $('#' + this.id)
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

	view['new-todo'] = {
		id: 'new-todo',

		getNewTodo: function() {
			var val = this.elem.value
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
			this.elem.value = ''
		},

		init: function() {
			this.elem = $('#' + this.id)[0]
		}
	}


}(window.jQuery))