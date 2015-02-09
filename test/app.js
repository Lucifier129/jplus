//app.js
var superagent = require('superagent')
var encoding = require('encoding')
var iconv = require('iconv-lite')
var cheerio = require('cheerio')
var path = require('path')
var url = require('url')
var fs = require('fs')

//获取当前路径，方便读写目录跟文件
var cwd = process.cwd()

var part1 = 'http://baoxian.taobao.com/json/PurchaseList.do?spm=0.0.0.0.t8I2d2&page='
var part2 = '&&itemId=18793807024&sellerId=366268061&callback=callbackres'

var TIME_RE = /\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}:\d{2}/g
var AMOUNT_RE = /<td>[(\\r)(\\n)(\\t)(\s)]*\d+[(\\r)(\\n)(\\t)(\s)]*<\\\/td>/g
var PRICE_RE = /<em>\d+\.\d+<\\\/em>/g
var result = []
var count = 0
var errCount = 0
var fileCount = 1
function getJSON(url) {
	superagent
		.get(url)
		.end(function(res) {
			if (!res.ok) {
				return
			}

			if ((!(count % 500)) && result.length) {
				console.log(fileCount)
				fs.writeFile(path.join(cwd, 'dadi', 'data' + fileCount++ + '.txt'), result.join('\n'), function(err) {
					console.log(err || 'done')
				})
				if (count) {
					result = []
				}
			}
			try {
				var times = res.text.match(TIME_RE)
				var prices = res.text.match(PRICE_RE)
				var combo = []
				console.log(times, prices)
				times.forEach(function(time, i) {
					combo.push([time, prices[i].match(/\d+\.\d+/)].join())
				})
				Array.prototype.push.apply(result, combo)
			} catch (e) {
				console.log(++errCount, count)
			}
			
			console.log(url)
			if (count > 0) {
				getJSON(part1 + (++count) + part2)
			}
		})
}

for (var i =0; i < 20; i += 1) {
	getJSON(part1 + (++count) + part2)
}
/*
getJSON(part1 + count+ part2)*/

console.log('start')