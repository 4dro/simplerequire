A builder for a simple require project. It takes several modules with define() in them, optimizes, and merges into a single js file.
Optionally, the loader js file could be also included in the optimized file.

Reqiures nodejs (https://nodejs.org/en/). The builder uses UglifyJS node package (https://github.com/mishoo/UglifyJS2).

Preparation to use: installing dependencies.
To install the uglifyjs, issue the following command in the "build" directory:
npm -install uglify-js
We assume the nodejs is already installed and available in the path.
That command will create a nome_modules folder in current directory and will download the unglifyjs package into it.
 It is highly recommended by node authors to install dependent
 modules locally https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders.


Usage.
node path/to/builder.js [config=path/to/config.file.json]
This command launches the build. Bulder.js script processed all the modules specified in includes option of the config and
produces an output minified js file.
Config path may be relative, but in this case it is relative to current directory, not to the loader file directory.
If the path contains spaces it should be enquoted. If the config file isn't specified, then the default (config.json file located next to builder.js) config is used.
Config file must be a valid json file, not a javascript one.

Config options.
Config.json is a json file with the following options:
{
  "basePath" : "",
  "outputFile" : "",
  "includeLoader" : "path/to/loader.file",
  "packages" : [],
  "includes" : [],
  "excludes" : []
}
Options
basePath - a directory that is a base for every relative path in other parameters or module names. If it is
 relative itself, for example = '.', it is resolved from the config.json file directory base, NOT from current directory.
 If this parameter is empty or not specified, then it defaults to current directory.
 Note the difference in calculating the path. Specifying the basePath as a relative path allowing you make the location
 of config.json file the base location, no matter what directory the command executed from. Otherwise you have to choose
 the location to execute "node builder.js" from (unless you have specified absolute urls in config.json).
outputFile - the name of the file to put the optimized js code to. It would be overwritten if exists.
includeLoader - boolean parameter specifies whether to add the loader file to the build. If not specified, you have to
 load the loader separately to make the optimized build work.
includes
 A mask of js files to build. Could start with a package name, then the files in that package will be built.
excludes
 Excludes several files from "includes" map.