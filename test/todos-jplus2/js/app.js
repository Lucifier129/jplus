/**
 * app.js
 */
(function (app) {
	app.todos = new app.Presenter('#todoapp', app.Model).init()
}($.app));