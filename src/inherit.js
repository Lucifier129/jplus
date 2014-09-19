//inherit
var inherit = Object.create || function(proto) {
	var F = function() {};
	F.prototype = proto;
	return new F();
};