//write.js

var fs = require('fs')

function write(pathname, data, callback) {
	fs.writeFile(pathname, data, callback || function(err) {
		console.log(err)
	})
}

module.exports = write