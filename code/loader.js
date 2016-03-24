/*
Bla bla bla copyright
* */
(function()
{
	if (typeof this.require != 'undefined' || typeof this.define != 'undefined')
	{
		console.error('Simple require: Another require API implementation exists! Exiting.');
		return;
	}

	// put our functions to the global scope
	this.require = require;
	this.define = define;

	var scriptsByUrl = {};
	var delayed = false;

	function require(config, dependencies, callback, errback)
	{
		if (!Array.isArray(dependencies) && Array.isArray(config))	// we have config
		{
			errback = callback;
			callback = dependencies;
			dependencies = config;
			config = null;
		}
		if (!Array.isArray(dependencies) || !(typeof callback == 'function'))	// wrong arguments
		{
			throw new Error('simple require: require() function called with invalid arguments');
		}
		var currentURL = globalConfig.baseUrl;
		if (config && config.currentURL)
		{
			currentURL = resolvePath(currentURL, config.currentURL);
		}
		var unresolvedDeps = [];
		var dependentModules = [];	// convert dependencies to Modules
		for (var i = 0; i < dependencies.length; i++)
		{
			var xx = processMid(dependencies[i], globalConfig.packages);
			var moduleBase = xx.packageName ? globalConfig.packages[xx.packageName] : currentURL;
			var depURL = resolvePath(moduleBase, xx.path) + '.js';
			var module = scriptsByUrl[depURL];
			if (module)
			{
				if (module.failed)
				{
					// TODO
				}
				if (!module.loaded)
				{
					unresolvedDeps.push(module);
				}
			}
			else
			{
				module = new ScriptFile(depURL, xx.packageName, xx.path);
				scriptsByUrl[depURL] = module;
				unresolvedDeps.push(module);
			}
			dependentModules.push(module);
		}
		for (i = 0; i < unresolvedDeps.length; i++)
		{
			unresolvedDeps[i].addListener(function(module, error){
				if (error)
				{
					// TODO
				}
				unresolvedDeps.splice(unresolvedDeps.indexOf(module), 1);
				if (unresolvedDeps.length == 0)
				{
					depsLoaded();
				}
			});
			if (!delayed && !module.loading)
			{
				module.load();
			}
		}
		if (unresolvedDeps.length == 0)
		{
			depsLoaded();
		}

		function depsLoaded()
		{
			var contents = [];
			for (var i = 0; i < dependentModules.length; i++)
			{
				contents.push(dependentModules[i].content);
			}
			callback.apply(this, contents);
		}
	}

	require.delay  = function(value)
	{
		delayed = value;
		if (!value)
		{
			// process delaying define()s
			for (var url in scriptsByUrl)
			{
				var module = scriptsByUrl[url];
				if (!module.loading)
				{
					module.load()
				}
			}
		}
	};


	var currentScript;
	var modules = {};
	var currentScriptSupported = (typeof document.currentScript == 'object');

	function define(mid, dependencies, callback, errback)
	{
		if (typeof mid != 'string')		// module id isn't specified, let current script to be the module
		{
			callback = dependencies;
			dependencies = mid;
			mid = undefined;
		}
		if (!Array.isArray(dependencies) || typeof callback != 'function')
		{
			throw new Error('simplerequire: define() invalid arguments.');
		}
		if (!mid)
		{
			// find the module id
			if (currentScriptSupported)
			{
				var scriptURL = document.currentScript.src;
				var anonModule = scriptsByUrl[scriptURL];
				mid = anonModule.path;
				if (anonModule.pack)
				{
					mid = anonModule.pack + '/' + anonModule.path;
				}
			}
			else
			{
				mid = currentScript.path;
				if (currentScript.pack)
				{
					mid = currentScript.pack + '/' + currentScript.path;
				}
				anonModule = currentScript;
			}
			if (anonModule.hasDefine)
			{
				throw new Error('simple require: several anonymus define() specified in a file');
			}
			anonModule.hasDefine = true;
		}
		var dirs = mid.split('/');
		dirs.pop();
		require({currentURL: dirs.join('/')}, dependencies, function(){
			if (modules[mid])
			{
				throw new Error('Module' + mid + ' already defined');
			}
			var content = callback.apply(this, arguments);
			modules[mid] = content;
			if (anonModule)
			{
				anonModule.content = content;
				anonModule.onDefineComplete();
			}
		});
	}

	var globalConfig = {
		baseUrl: '.',
		packages: {}
	};

	mixin(globalConfig, getAttrConfig());
	if (typeof requireConfig != 'undefined')
	{
		mixin(globalConfig, requireConfig);
	}
	globalConfig.baseUrl = resolvePath(extractPath(window.location.href), globalConfig.baseUrl);

	function ScriptFile(url, pack, path)
	{
		this.url = url;
		this.pack = pack;
		this.path = path;
		this.loaded = false;
		this.loading = false;
		this.hasDefine = false;
		this.listeners = [];
		this.content = null;
		this.failed = null;
	}

	ScriptFile.prototype.load = function()
	{
		this.loading = true;
		var self = this;
		if (currentScriptSupported)
		{
			var node = document.createElement('script');
			node.async = true;
			node.type = 'text/javascript';
			node.charset = 'utf-8';
			node.addEventListener('load', onLoad);
			node.addEventListener('error', onError);
			node.src = this.url;
			document.head.appendChild(node);
		}
		else
		{
			var request = new XMLHttpRequest();
			request.onreadystatechange = function(event)
			{
				if (request.readyState != 4)	// complete
				{
					return;
				}
				self.loading = false;
				var success = (request.status >= 200 && request.status < 300) || request.status == 304;
				if (success)
				{
					currentScript = self;
					var script = document.createElement('script');
					script.text = request.responseText;
					document.head.appendChild(script);
					// don't call listeners if we had a define() in anonymous module - wait for dependencies
					if (!self.hasDefine)
					{
						self.callListeners(null);
					}
				}
				else
				{
					self.failed = request.statusText;
					self.callListeners(request.statusText);
				}
			};
			request.open('GET', this.url, true);
			request.send();
		}

		function onLoad()
		{
			node.removeEventListener('load', onLoad);
			node.removeEventListener('error', onError);
			if (!self.hasDefine)
			{
				self.callListeners(null);
			}
		}
		function onError(event)
		{
			node.removeEventListener('load', onLoad);
			node.removeEventListener('error', onError);
			self.failed = event;
			self.callListeners(event);
		}
	};

	ScriptFile.prototype.addListener = function(callback)
	{
		this.listeners.push(callback);
	};

	ScriptFile.prototype.callListeners = function(error)
	{
		while (this.listeners.length)
		{
			var listener = this.listeners.shift();
			listener.call(this, this, error);
		}
	};
	ScriptFile.prototype.onDefineComplete = function()
	{
		this.callListeners(null);
	};
// ******************* Helper functions **********************************************
	function getAttrConfig()
	{
		var script;
		if (document.currentScript)
		{
			script = document.currentScript;
		}
		else
		{
			var scripts = document.getElementsByTagName("script");
			for (var i = scripts.length - 1; i >= 0; i--)
			{
				if (scripts[i].hasAttribute('data-require-config'))
				{
					script = scripts[i];
					break;
				}
			}
		}
		if (script)
		{
			var config = script.getAttribute('data-require-config');
			if (!config)
			{
				return;
			}
			// parse the config
			var cfgObj = parseJSProps(config);
			mixin(globalConfig, cfgObj);
		}
	}

	function parseUrl(url)
	{
		// parse the URL - http://www.ietf.org/rfc/rfc3986.txt Appendix B
		var urlPattern = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?");
		// url must be absolute
		var matches = url.match(urlPattern);
		var host = matches[2] + '://' + matches[4];
		return {host: host, path: matches[5]};
	}

	function extractPath(url)
	{
		var obj = parseUrl(url);
		var index = obj.path.lastIndexOf('/');
		if (index == -1)
		{

		}
		return obj.host + obj.path.substring(0, index);
	}

	// every module have package, path in the package, and the name of the module
	function processMid(mid, packages)
	{
		var packageName = '';	// default package
		var path = mid;
		if (!/^\w+:\/\/.+/.test(mid))	// is an absolute url? then use the default package
		{
			// find the matching package
			for (var name in packages)
			{
				if (mid.indexOf(name) == 0 && mid.charAt(name.length) == '/')
				{
					packageName = name;
					path = mid.substr(name.length);		// remove package name from the path
					break;
				}
			}
		}
		return {path: path, packageName: packageName};
	}

	function resolvePath(basePath, relativePath)
	{
		if (/^\w+:\/\/.+/.test(relativePath))
		{
			return relativePath;
		}
		var url = parseUrl(basePath);
		var path = url.path;
		if (relativePath.indexOf('/') == 0)		// it's an absolute path
		{
			path = '';
		}

		var dirs = path.split('/');
		var relDirs = relativePath.split('/');
		for (var i = 0; i < relDirs.length; i++)
		{
			var part = relDirs[i];
			if (part == '.')
			{
				continue;
			}
			if (part == '..')
			{
				dirs.pop();
			}
			else
			{
				dirs.push(part);
			}
		}
		return url.host + dirs.join('/');
	}

	// populates an object with properties form another one
	function mixin(thisObj, otherObj)
	{
		if (!otherObj)
		{
			return;
		}
		for (var prop in thisObj)
		{
			if (thisObj.hasOwnProperty(prop) && otherObj.hasOwnProperty(prop))
			{
				thisObj[prop] = otherObj[prop];
			}
		}
	}

	// parses data-require-config attribute, like that: baseUrl: dfsdfsdfs, packages: {aaa: 'aaa://fgfg', bb: 'b/c'}
	function parseJSProps(string)
	{
		// FIXME: use better parser, url that contains '}' or ',' won't be parsed correctly
		var props = {};
		var packRE = /(?:^|,)\s*packages\s*:\s*\{\s*(.*?)\s*\}/;
		var packages = string.match(packRE)[1];
		if (packages)
		{
			props.packages = {};
			var parts = packages.split(',');
			for (var i = 0; i < parts.length; i++)
			{
				var arr = parts[i].match(/\s*(\w+)\s*:\s*'(.*)'/);
				var name = arr[1];
				var url = arr[2];
				if (name && url)
				{
					props.packages[name] = url;
				}
			}
		}
		string = string.replace(packRE, '');
		var base = string.match(/(?:^|,)\s*baseUrl\s*:\s*'(.*?)'/)[1];
		if (base)
		{
			props.baseUrl = base;
		}
		return props;
	}
})();