//app.js
var superagent = require('superagent')
var encoding = require('encoding')
var BufferHelper = require('bufferhelper')
var iconv = require('iconv-lite')
var cheerio = require('cheerio')
var path = require('path')
var url = require('url')
var fs = require('fs')
var http = require('http')

//获取当前路径，方便读写目录跟文件
var cwd = process.cwd()

/*var part1 ='http://baoxian.taobao.com/json/PurchaseList.do?spm=0.0.0.0.7xctOa&page='
var part2 = '&&itemId=42426683935&sellerId=352262586&callback=callbackres'*/
/*var part1 = 'http://baoxian.taobao.com/json/PurchaseList.do?page='
var part2 = '&itemId=40402620440&sellerId=352262586&callback=mycallback&sold_total_num=0&callback=mycallback'*/
var part1 = 'http://baoxian.taobao.com/json/PurchaseList.do?spm=0.0.0.0.v1MHYx&page='
var part2 = '&&itemId=18461227493&sellerId=407675891&callback=callbackres'


var TIME_RE = /\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}:\d{2}/g
var AMOUNT_RE = /<td>[(\\r)(\\n)(\\t)(\s)]*\d+[(\\r)(\\n)(\\t)(\s)]*<\\\/td>/g
var PRICE_RE = /<em>\d+\.\d+<\\\/em>/g
/*/\(.{3}\)/g*/
var TYPE_RE = /平安车险-.{3}/g
var result = []
var count = 12650
var errCount = 0

function getData(url) {
	var req = http.get(part1 + count + part2, function(res) {
		var bufferHelper = new BufferHelper();
		res.on('data', function(chunk) {
			bufferHelper.concat(chunk);
		});
		res.on('end', function() {
			var html = bufferHelper.toBuffer();
			html = iconv.decode(html, 'GBK');
			var times = html.match(TIME_RE)
			var amounts = html.match(AMOUNT_RE)
			var prices = html.match(PRICE_RE)
			var types = html.match(TYPE_RE)
			var data = []

			times.forEach(function(time, i) {
				data.push([types[i].slice(5), prices[i].match(/\d+\.\d+/)[0], amounts[i].match(/\d+/)[0], time].join())
			})

			Array.prototype.push.apply(result, data)


/*			console.log(html.match(TIME_RE))
			console.log(html.match(AMOUNT_RE))
			console.log(html.match(PRICE_RE))
			console.log(html.match(TYPE_RE))*/

			if (!count % 2000 || !count) {
				saveData()
			}

			console.log(url)
			if (count > 0) {
				getData(part1 + (--count) + part2)
			}
		});
	})

	req.on('err', function(e) {
		console.log(count)
		if (count > 0) {
			getData(part1 + (--count) + part2)
		}
	})
}

var fileCount = 0

function saveData() {
	if (!result.length) {
		return console.log('empty')
	}
	var filename = path.join(cwd, 'pingan', 'data' + (fileCount++) + '.txt')
	fs.writeFile(filename, result.join('\n'), function(err) {
		console.log(err || 'files:' + fileCount)
	})
	result = []
}


for (var i = 0; i < 50; i += 1) {
	getData(part1 + (--count) + part2)
}

/*getData(part1 + count + part2)*/

console.log('start')