//css3fix
var style = document.createElement('div').style,
	prefix = ['', '-webkit-', '-moz-', '-ms-', '-o-'],
	len = prefix.length,
	camelCase = $.camelCase;

$.css3fix = function(prop) {
	var i = 0, fixed;
	for (; i < len; i += 1) {
		fixed = camelCase(prefix[i] + prop);
		if (fixed in style) {
			return fixed;
		}
	}
	return false;
};