//data.js for jplus-test

module.exports = {
	theTitle: '标题：jplus-test',
	center: 'center',
	name: '作者：Jade',
	paragraph: ['段落：TEST。', '段落：TEST1。', '段落：TEST2。', '段落：TEST3。', '段落：TEST4。', '段落：TEST5。', '段落：TEST6。', '段落：TEST7。', '段落：TEST8。', '段落：TEST9。'],
	red: '#f00',
	change: [{
			textIndent: '100px'
		},
		1000
	],
	func: function() {
		this.css('border', '1px solid #eaeaea').animate({
			height: 100,
			lineHeight: '100px'
		}, 400);
	},
	tpl: {
		html: '<span js="text: tplText"></span>',
		refresh: {
			tplText: 'some word create by tpl.'
		}
	}

};

module.exports = {
	theTitle: '标题：jplus-test-change',
	name: '作者：Jade-change',
	paragraph: ['段落change：TEST。', '段落change：TEST1。', '段落change：TEST2。', '段落change：TEST3。', '段落change：TEST4。', '段落change：TEST5。', '段落change：TEST6。', '段落change：TEST7。', '段落change：TEST8。', '段落change：TEST9。', '段落change：TEST9。'],
	red: 'green',
	change: [{
			textIndent: '200px'
		},
		1000
	],
	func: function() {
		this.css('border', '3px solid #eaeaea').animate({
			height: 50,
			lineHeight: '50px'
		}, 400);
	},
	tpl: {
		refresh:{
			tplText: 'change-some word create by tpl.'
		}
	}
};