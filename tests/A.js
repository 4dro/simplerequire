console.log('A executing');
define([
	'B',
	'pack1/C',
	'pack2/E',
	'./pack2/E'
], function(B, C, E){
return {
	a: 'A',
	b: B,
	c: C,
	e: E
};
});