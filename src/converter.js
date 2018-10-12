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
var getDispatcher = require("./dispatcher").getDispatcher;
var getSourceFileObject = require("./object").getSourceFileObject;
var PLUGIN_NAME = "StyleGuide-O-Matic";
var CoM = require("console-o-matic");
CoM.setName(PLUGIN_NAME);

/**
 * Default configuration. Everything here can be overridden
 * @constant {Object} options
 * @property {Boolean} options.async - Use async processing
 * @property {String} options.srcPath - Define the svg output file path.
 * @property {Function} options.postProcess - Apply additional data changes AFTER core processes
 * @memberof converter
 */
var options = {
  examples: false,
  guidePath: "../../styleguide",
  srcPath: ""
};

/**
 * Path correction helper
 * @function getCleanPath
 * @param {String} pathValue
 * @param {Stream} fileValue
 * @return {String} Usable path
 * @memberof converter
 */
function getCleanPath(pathValue, fileValue) {
  var p = pathValue.replace(/\/$/, "");
  var s = p.length > 0 ? "/" : "";
  return `${p}${s}${fileValue}`;
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
    CoM.log(`Generating ${fileName} for ${data.name} in ${filePath}`);
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
function writeGuideFiles(stream, data, config) {
  var fileName = `${data.name}.md`;
  var template = fs.readFileSync(__dirname + "/template/ComponentReadMe", "utf-8");
  var filePath = getCleanPath(config.guidePath, fileName);
  makeTemplateFile(fileName, template, filePath, stream, data);
}

/**
 * Misc helper func
 * @function writeExampleFiles
 * @param {Stream} stream
 * @param {Object} data
 * @param {Object} config
 * @memberof converter
 */
function writeExampleFiles(stream, data, config) {
  var fileName = "Example.js";
  var template = fs.readFileSync(__dirname + "/template/Example", "utf-8");
  var filePath = `./${config.srcPath}/${data.name}/${fileName}`;
  makeTemplateFile(fileName, template, filePath, stream, data);
}

module.exports = function(config) {
  config = _.merge(_.cloneDeep(options), config || {});

  CoM.log("Working...");

  return through.obj(
    function(file, enc, cb) {
      var stream = this;
      var fileName = path.basename(file.path, path.extname(file.path));
      var fileObject = getSourceFileObject(file, config);
      if (config.examples) {
        writeExampleFiles(stream, fileObject.data, config);
      } else {
        writeGuideFiles(stream, fileObject.data, config);
      }
      cb(null);
    },
    function(cb) {
      CoM.log("Work Complete");
      cb(null);
    }
  );
};
