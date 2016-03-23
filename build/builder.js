var UglifyJS = require('uglify-js');
var fs = require('fs');
var path = require('path');

// Find the -config argument
var args = process.argv.slice(2);
var cfgName = '';
for (var i = 0; i < args.length; i++)
{
	if (args[i].indexOf('config=') == 0)
	{
		cfgName = args[i].substr(7);
		cfgName = path.resolve(cfgName);
	}
}
if (!cfgName)
{
	cfgName = path.resolve(__dirname, './config.json');
}
console.log("Config used is " + cfgName);

var config = require(cfgName);
console.log(config);

console.log('Current dir is ' + process.cwd());
var base = '';
if (config.basePath)
{
	if (path.isAbsolute(config.basePath))
	{
		base = config.basePath;
	}
	else
	{
		base = path.resolve(cfgName, config.basePath);
	}
	console.log('Base path specified to ' + base);
}
else
{
	base = process.cwd();
	console.log('Base path not specified, using ' + base);
}

var packages = config.packages || {};
for (var pack in packages)
{
	packages[pack] = path.resolve(base, packages[pack]);
}

var files = ['A.js'];
var includes = config.includes || [];
for (i = 0; i < includes.length; i++)
{
	var mask = includes[i];
	var currentPath = base;
	for (pack in packages)
	{
		if (mask.indexOf(pack) == 0)    // starts with a package
		{
			currentPath = packages[pack];
			break;
		}
	}
}

var outputFile = path.resolve(base, config.outputFile || 'build.min.js');
console.log('Output file is ' + outputFile);
for (i = 0; i < files.length; i++)
{
	var code = processFile(files[i]);
	fs.appendFileSync(outputFile, code);
}

function processFile(filename)
{
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
	return minified;
}