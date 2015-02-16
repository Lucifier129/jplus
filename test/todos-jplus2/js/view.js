/**
 * view.js
 */
(function($) {

	var todoTemplate =
	'<li data-bind="vm:todos;addId:id;attr-title:time;checkStatus:completed">\
		<div class="view">\
			<input class="toggle" type="checkbox" data-bind="checkCompleted:completed">\
				<label data-bind="text:title;"></label>\
				<button class="destroy"></button>\
		</div>\
		<input class="edit">\
	</li>'

	$.extend($.fn, {
		addId: function(id) {
			this.attr('data-id', id)
		},
		checkStatus: function(completed) {
			if (completed) {
				this.addClass('completed')
			} else {
				this.removeClass('completed')
			}
		},
		checkCompleted: function(completed) {
			if (completed) {
				this.attr('checked', 'checked')
				this[0].checked = true
			} else {
				this.removeAttr('checked')
				this[0].checked = false
			}
		},
		setHash: function(hash) {
			var $target = this.find('[href="#' + hash + '"]')
			this.find('.selected').removeClass('selected')
			$target.addClass('selected')
		},
		countActive: function(len) {
			if (!len) {
				this.hide()
			} else {
				this.text(len + ' item left').show()
			}
		},
		countCompleted: function(len) {
			if (!len) {
				this.hide()
			} else {
				this.text('Clear completed (' + len + ')').show()
			}
		},
		todoList: function(list) {
			if (!list.todos.length) {
				this.hide()
			} else {
				if (!this.children().length) {
					this.html(todoTemplate)
				}
				this.refresh(list).show()
			}
		}
	})
}($));