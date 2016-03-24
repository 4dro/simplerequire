console.log('pack1/C executing');
define([
	'./D'
], function(D){
	return {
		a: 'D',
		b: D
	};
});