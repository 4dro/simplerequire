console.log('pack2/E executing');
define([
	'./pack21/F'
], function(F){
	return {
		a: 'E',
		b: F
	};
});