define([
	'plus'
], function(require) {
	require('plus');
	var data = {
		name: 'Jade',
		date: '2014.11.01',
		content: 'test seajs'
	};

	return {
		init: function() {
			$('#container').html($('#temp').html()).refresh(data);
		}
	};
});