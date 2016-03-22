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

Config options.
Config.json is a json file with the following options:
{
  "basePath" : "",
  "outputFile" : "",
  "includeLoader" : true,
  "packages" : [],
  "includes" : [],
  "excludes" : []
}
