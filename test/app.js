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

var part1 ='http://baoxian.taobao.com/json/PurchaseList.do?spm=0.0.0.0.7xctOa&page='
var part2 = '&&itemId=42426683935&sellerId=352262586&callback=callbackres'
/*var part1 = 'http://baoxian.taobao.com/json/PurchaseList.do?page='
var part2 = '&itemId=40402620440&sellerId=352262586&callback=mycallback&sold_total_num=0&callback=mycallback'*/

var TIME_RE = /\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}:\d{2}/g
var AMOUNT_RE = /<td>[(\\r)(\\n)(\\t)(\s)]*\d+[(\\r)(\\n)(\\t)(\s)]*<\\\/td>/g
var result = []
var count = 2400
var errCount = 0
function getJSON(url) {
	superagent
		.get(url)
		.end(function(res) {
			if (!res.ok || !count) {
				fs.writeFile(path.join(cwd, 'times2.txt'), result.join('\n'), function(err) {
					console.log(err || 'done')
				})
				return
			}
			try {
				var amounts = res.text.match(AMOUNT_RE)
				var times = res.text.match(TIME_RE)
				var combo = []
				amounts.forEach(function(amount, i) {
					combo.push([amount.match(/\d+/)[0], times[i]].join())
				})
				Array.prototype.push.apply(result, combo)
			} catch (e) {
				console.log(++errCount, count)
			}
			
			console.log(url)
			getJSON(part1 + (--count) + part2)
		})
}

getJSON(part1 + count + part2)


console.log('start')