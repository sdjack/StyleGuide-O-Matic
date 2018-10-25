/**
 * Experimental style guide generator for use primarily with Style-O-Matic
 * @namespace converter
 */
var File = require("vinyl");
var Q = require("q");
var _ = require("lodash");
var path = require("path");
var async = require("async");
var fs = require("fs");
var through = require("through2");
var sass = require("node-sass");
var sassExtract = require("sass-extract");
var getDispatcher = require("./dispatcher").getDispatcher;
var getSourceFileObject = require("./object").getSourceFileObject;
var getScssHelper = require("./scsshelper").getScssHelper;
var PLUGIN_NAME = "StyleGuide-O-Matic";
var CoM = require("console-o-matic");

CoM.setName(PLUGIN_NAME);

/**
 * Default configuration. Everything here can be overridden
 * @constant {Object} options
 * @property {Boolean} options.examples - Generate example boilerplate files
 * @property {Boolean} options.styles - Generate sass extractions.
 * @property {String} options.dest - Output directory.
 * @property {Object} options.src - Source file location data
 * @property {Array} options.componentList - List of component names to be included
 * @memberof converter
 */
var options = {
  examples: false,
  styles: false,
  dest: "",
  src: {
    root: "",
    components: null,
    styles: null
  },
  componentList: []
};

/**
 * Stored RegExp patterns
 * @constant {Object} PATTERNS
 * @property {RegExp} PATTERNS.comments1 - RegExp pattern
 * @property {RegExp} PATTERNS.comments2 - RegExp pattern
 * @property {RegExp} PATTERNS.docFlags - RegExp pattern
 * @memberof converter
 */
const PATTERNS = {
  comments1: /((?:\/\*){1}[\w\d\s\W\S]*?(?:\*\/){1})|((?:\/\/){1}[\w\d\s\W]*?(?:[\r\n]))/g,
  comments2: /(\n+(?![^\n]))/gm,
  docFlags: /(?:@)([\w]+)\s([\w\W\s\S]+?)(?=[\W]+@|[\W]+\*\/)/gm
};

/**
 * Verify that file is included
 * @function checkIncluded
 * @param {String} pathValue
 * @param {Array} pathList
 * @return {Boolean} valid
 * @memberof converter
 */
function checkIncluded(pathValue, pathList) {
  var valid = false;
  _.forEach(pathList, (name) => {
    if (pathValue.indexOf(`\\${name}.js`) !== -1) {
      valid = true;
    }
  });
  return valid;
}

/**
 * Misc helper func
 * @function prepareStyleData
 * @param {Object} styleData
 * @return {Object} output
 * @memberof converter
 */
function prepareStyleData(styleData) {
  var output = {};
  Object.entries(styleData.vars.global).forEach(
    ([name,data])=>{
      if (data.declarations && data.declarations.length > 0) {
        _.forEach(data.declarations, (decData) => {
          if (decData.in) {
            var fileName = path.basename(decData.in, path.extname(decData.in));
            if (!output[fileName]) {
              output[fileName] = {global: []};
            }
            output[fileName].global.push(data);
          }
        });
      }
    });

  return output;
}

/**
 * Misc helper func
 * @function makeFile
 * @param {String} dest
 * @param {Stream} stream
 * @param {*} buffer
 * @memberof converter
 */
function makeFile(dest, stream, buffer) {
  stream.push(
    new File({
      cwd: "./",
      base: "./",
      path: dest,
      contents: buffer
    })
  );
}

/**
 * Misc helper func
 * @function makeTemplateFile
 * @param {File} template
 * @param {String} filePath
 * @param {Stream} stream
 * @param {Object} data
 * @return {Promise.promise|*}
 * @memberof converter
 */
function makeTemplateFile(fileName, template, filePath, stream, data) {
  var deferred = Q.defer();
  var id = _.uniqueId();
  var out = "";

  try {
    var compiled = _.template(template);
    out = compiled(data);
    CoM.log(`Generating |skyblue:|${fileName}|:skyblue| in |seagreen:|${filePath}|:seagreen|`);
  } catch (e) {
    deferred.reject(e);
    CoM.warn(e);
    return deferred.promise;
  }

  var fileBuffer = new Buffer(out);
  makeFile(filePath, stream, fileBuffer);

  deferred.resolve(out);

  return deferred.promise;
}

/**
 * Misc helper func
 * @function writeGuideFiles
 * @param {Stream} stream
 * @param {Object} data
 * @param {Object} config
 * @memberof converter
 */
function writeGuideFiles(stream, file, config, scsshelper) {
  var fileName = `${file.data.name}.md`;
  var template = fs.readFileSync(__dirname + "/template/ComponentReadMe", "utf-8");
  var filePath = path.join(config.dest, fileName);
  // if (config.src.styles) {
  //   var stylePath = path.join(config.src.styles, `components/${file.data.name}/loader.scss`);
  //   if (fs.existsSync(stylePath)) {
  //     file.data.styles = sassExtract.renderSync({ file: stylePath });
  //     var cssSource = file.data.styles.css.toString();
  //     cssSource = cssSource.replace(PATTERNS.comments1, "");
  //     cssSource = cssSource.replace(PATTERNS.comments2, "");
  //     file.data.styles.css = cssSource;
  //   }
  // }
  makeTemplateFile(fileName, template, filePath, stream, file.data);
}

/**
 * Misc helper func
 * @function writeExampleFiles
 * @param {Stream} stream
 * @param {Object} data
 * @param {Object} config
 * @memberof converter
 */
function writeExampleFiles(stream, file, config) {
  var fileName = "Example.js";
  var template = fs.readFileSync(__dirname + "/template/Example", "utf-8");
  var filePath = path.join(config.dest, file.id, fileName);
  makeTemplateFile(fileName, template, filePath, stream, file.data);

  return file.data;
}

/**
 * Misc helper func
 * @function writeStyleFiles
 * @param {Stream} stream
 * @param {Object} data
 * @param {Object} config
 * @memberof converter
 */
function writeStyleFiles(stream, file, config, cb) {
  var fileName = `${file.id}.md`;
  var template = fs.readFileSync(__dirname + "/template/StyleReadMe", "utf-8");
  var filePath = path.join(config.dest, fileName);
  var rendered = sassExtract.renderSync({ file: file.path });
  makeTemplateFile(fileName, template, filePath, stream, rendered);
  if (cb) {
    return cb(file.data);
  }

  return file.data;
}

module.exports = function(config) {
  config = _.merge(_.cloneDeep(options), config || {});

  CoM.log("Working...");
  var dispatcher = getDispatcher(config);

  return through.obj(
    function(file, enc, cb) {
      var stream = this;
      if (file.contents && checkIncluded(file.path, config.componentList)) {
        // dispatcher.register(file);
        const extension = path.extname(file.path);
        const fileObject = getSourceFileObject(file, config);
        if (fileObject.data) {
          if (config.examples) {
            writeExampleFiles(stream, fileObject, config);
          } else {
            writeGuideFiles(stream, fileObject, config);
          }
        }
      }
      cb(null);
    },
    function(cb) {
      // var stream = this;
      // dispatcher.compile(function(err, fileObject) {
      //   if (fileObject.data) {
      //     if (config.examples) {
      //       writeExampleFiles(stream, fileObject, config);
      //     } else {
      //       writeGuideFiles(stream, fileObject, config, styleData);
      //     }
      //   }
      // });
      CoM.log("Work Complete");
      cb(null);
    }
  );
};
