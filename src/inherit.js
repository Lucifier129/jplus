define(function() {
	return Object.create || function(proto) {
		var F = function() {};
		F.prototype = proto;
		return new F();
	};
});