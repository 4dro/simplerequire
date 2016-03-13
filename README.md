## Simple require

Asynchronous Module Definition API - https://github.com/amdjs/amdjs-api/wiki/AMD

Unlike original requirejs, it is supposed to be used in browsers only. No support for node.js (I think it's right because it already has
it's javascript module system).
No synchronous mode and no CommonJS-style requirements.

The library consists on one file: loader.js
The loader provides 2 global functions


_void_ **require**([_Object_ config,] _Array_ dependencies, _Function_ callback [, _Function_ errback])
Parameters.
**config**
 Optional.
**dependencies**
 Required. An array of dependent module IDs to load.
**callback**
  Required. Function to be called when all dependencies are loaded.
**errback**

Description.
Loads javascript modules specified in the _dependencies_ parameter. When all the modules
are loaded and processed, the callback function is called, with loaded modules as arguments.
Examples.
```
	require(['scripts/jquery', 'widgets/CustomButton'], function(jquery, CustomButton){
		CustomButton.apply(jquery('#submitButton'));
	});
```
```
void define([String moduleID,] Array dependencies, Function factory)
Parameters
moduleID
 Optional.
dependencies
 Required. An Array of module IDs this module depends upon.
factory
 Required. A function, which execution result is treated as the module content. The function is executed only once,
 after the dependecies have been resolved. Dependent modules are provided as the function arguments in the same order
 as they were specified in the dependencies argument.
Returns
 Nothing.
Description
 Define() function loads dependencies via a require() call. The only difference is that
 Unlike original requirejs, factory argument cannot be an object, it must be a function. Just return an object in that
 function to match factory argument of Object type. This is done for more strict define() declaration.
Examples
```
// package1 and package2 should be specified in the config
define(['package1/ui/SuperWidget', 'package2/utils/base64', 'package2/xhr/Request'],
 function(SuperWidget, base64, Request){
 //... do something with SuperWidget, base64 and Request classes
});

### Configuration
Configuration object may be defined before calling to require() function. It may have two options:
**baseUrl:** a URL used to resolve module ids that have no package. If the URL is relative, it is relative to _window.location.href_ directory.
Defaults to '.'.
**packages:** an object containing a map of {packageName: _URL to that package_}. Package name cannot start with a dot (.).
Package URLs could  be absolute or relative to baseUrl.
Configuration may be specified in two ways:
A data-require-config attribute of the <script> that loads the loader.js file.
A requireConfig object in the global scope defined before loading the loader.

### Module identifiers
Module identifier is a string containing a path to a module. They are passed to require() and define() functions in
dependencies array parameter. Corresponding javascript files are then loaded.
Identifier consists of a package name and a path within that package separated with '/' sign. Package name may be empty.
Every package has and associated URL path to find modules in. It is specified in require config (packages parameter).
Default package ('', empty name) is always associated with basePath paramter (which defaults to html page location directory).

### Plugins
A plugin is a modules that has a "!" sign in it's module ID. The srting to the left of the "!"
sign in the mid of the module, and the part after the "!" is a parameter to the plugin.

The loader insert modules as scripts to the document head. If the broser supports document.currentScript property,
then asynchronous scripts are loaded. Otherwise the scripts are loaded via xhr requests.

### Original requirejs setting that are not supported.
* No magic module names ("require", "export" and "module"). So you are not able make a module context sensitive
require inside your module.
* Config.
* No several search paths for a module. Only package path is used if a module starts with a package name, and the basePath
otherwise.
* No bundles and map. Every module should either a) have the same file name as it's module identifier or b) be loaded and defined in a
separate file before it's requirement.
* Shim.
Introduced to import usual non-AMD javascript files that don't use define() with require() function.
In simple require, use load them as usual javacript files with <sript src="noDefineFile"></script>


Optimizing

TODO