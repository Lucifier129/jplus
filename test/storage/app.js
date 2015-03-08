//app.js
var path = require('path')
var iconv = require('iconv-lite')
var fetch = require('./fetch')
var write = require('./write')
var cwd = process.cwd()

var part1 = 'http://baoxian.taobao.com/json/PurchaseList.do?_ksTS=1423445374502_996&callback=mycallback&spm=a2800.6624961.0.0.DixWJ8&page='
var part2 = '&&itemId=24175480069&sellerId=407675891'

var count = 1
var fileCount = 1
var interval = 1000
var charset = 'gbk'
var dirname = 'stroage'
var storage = []

function getData(url) {
	fetch(url, function(data) {
		var gbk = iconv.decode(data, charset)
		try {
			matchData(gbk)
			console.log(url + ' match')
		} catch (e) {
			console.log(url + ' no match')
		}

		getData(part1 + count++ +part2)

		if (storage.length && !(storage.length % interval)) {
			saveData(storage)
			storage = []
		}
	}, function(err) {
		console.log(url + ' error')
		getData(part1 + count++ +part2)
	})
}

var TIME_RE = /\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}:\d{2}/g
var AMOUNT_RE = /<td>[(\\r)(\\n)(\\t)(\s)]*\d+[(\\r)(\\n)(\\t)(\s)]*<\\\/td>/g
var PRICE_RE = /<em>\d+\.\d{2}/g

function matchData(data) {
	var times = data.match(TIME_RE)
	var amouts = data.match(AMOUNT_RE)
	var prices = data.match(PRICE_RE)
	var combo = []
	times.forEach(function(time, i) {
		var amount = amouts[i].match(/\d+/)[0]
		var price = prices[i].match(/\d+\.\d{2}/)[0]
		combo.push([time, price, amount].join())
	})
	Array.prototype.push.apply(storage, combo)
}

function saveData() {
	var pathname = 'data' + fileCount++ + '.txt'
	write(path.join(cwd, dirname, pathname), storage.join('\n'), function(err) {
		console.log(err || pathname)
	})
}

for (var i = 0; i < 10; i += 1) {
	getData(part1 + count++ + part2)
}




console.log('start')