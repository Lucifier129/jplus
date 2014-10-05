//parseAttr
var SEMICOLON_RE = /[^;]+/g,
	COLON_RE = /[^:]+/g,
	DASH_RE = /[^-]+/g;

function parseJsAttr(attrValue) {
	return arrToObj(attrToArr(attrValue));
}

function attrToArr(attrValue) {
	var ret = trim(attrValue).match(SEMICOLON_RE);
	return each(ret, function(i, value) {
		var item = ret[i] = trim(value).match(COLON_RE);
		item[0] = trim(item[0]);
		item[1] && (item[1] = trim(item[1]));
		if (item[0].indexOf('-') !== -1) {
			item[0] = trim(item[0]).match(DASH_RE);
		}

	});
}

function arrToObj(attrValueArr) {
	var ret = {};
	each(attrValueArr, function() {
		var item = this;

		switch (true) {
			case item.length === 1:
				ret[item[0]] = {};
				break;
			case isArray(item[0]):
				ret[item[1]] = {
					method: item[0][0],
					args: item[0].slice(1)
				};
				break;
			case item[0] in $.fn:
				ret[item[1]] = {
					method: item[0],
					args: arr
				};
				break;
			default:
				ret[item[0]] = {
					method: noop
				};
		}

	});
	return ret;
}