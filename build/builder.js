var UglifyJS = require('uglify-js');
var fs = require('fs');
var path = require('path');

// Find the -config argument
var args = process.argv.slice(2);
console.log(args);
var cfgName = '';
for (var i = 0; i < args.length; i++)
{
	if (args[i].indexOf('config=') == 0)
	{
		cfgName = args[i].substr(7);
		//cfgName = path.resolve(cfgName);
	}
}
if (!cfgName)
{
	cfgName = './config.json';
}
var config = require(cfgName);
console.log(config);

var filename = '../tests/A.js';
var code = fs.readFileSync(filename, 'utf8');
var toplevel = UglifyJS.parse(code, {filename: filename});

toplevel.figure_out_scope();
var compressed_ast = toplevel.transform(UglifyJS.Compressor({}));

compressed_ast.figure_out_scope();
compressed_ast.compute_char_frequency();
compressed_ast.mangle_names();

var stream = UglifyJS.OutputStream({});
compressed_ast.print(stream);
var minified = stream.toString(); // this is your minified code

console.log(minified);