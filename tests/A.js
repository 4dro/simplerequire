console.log('A executing');
define(
	['B'],
function(B){
return {
	a: 'A',
	b: B
};
});