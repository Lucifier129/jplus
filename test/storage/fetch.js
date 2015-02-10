//fetch.js

var http = require('http')

function fetch(url, callback, errHandler) {
	var req = http.get(url, function(res) {
		var buffers = []
		res.on('data', function(chunk) {
			buffers.push(chunk)
		})
		res.on('end', function() {
			callback(Buffer.concat(buffers))
		})
	})

	req.on('err', errHandler || function(err) {
		console.log(err)
	})
}

module.exports = fetch