console.log('A executing');
define([
	'B'
], function(B, C, E){
return {
	a: 'A',
	b: B,
	c: C,
	e: E
};
});