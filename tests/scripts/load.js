console.log("I'm executing");
define([], function(){});
//defer();

function defer()
{
	var body = document.body;
	for (var i = 0; i < 10000; i++)
	{
		var node = document.createElement('div');
		body.appendChild(node);
	}
	var flag = document.createElement('div');
	flag.style.position = 'absolute';
	flag.style.backgroundColor= 'red';
	flag.style.height = '100px';
	flag.textContent = 'Ive loaded';
	body.appendChild(flag);
}