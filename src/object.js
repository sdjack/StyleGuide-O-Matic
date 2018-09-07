/**
 * Source File Object
 * @namespace object
 */
const _ = require("lodash");
const path = require("path");
const getSourceFileData = require("./data").getSourceFileData;

/**
 * Source File Object
 * @function SourceFileObject
 * @param {File} file - The Source File
 * @param {Object} config - Usage settings
 * @memberof object
 */
function SourceFileObject(file, config) {
  this._settings = _.extend({}, config);
  this._path = file.path;
  this._contents = file.contents.toString();
  this._preprocessor = function(input, done) {
    done({ data: input });
  };

  this.id = path.basename(file.path, path.extname(file.path));
}

/**
 * Request the processed source file data
 * @function compile
 * @param {Function} callback - Post compile callback
 * @memberof object
 */
SourceFileObject.prototype.compile = function(callback) {
  const self = this;

  try {
    self._preprocessor.optimize(self._contents, function(result) {
      const sourceFileData = getSourceFileData(self.id, result.data);
      process.nextTick(function() {
        callback(null, sourceFileData);
      });
    });
  } catch (error) {
    callback(error, null);
  }
};

/**
 * Misc helper func
 * @function getSourceFileObject
 * @param {File} file - The Source File
 * @param {Object} config - Usage settings
 * @return {Object} SourceFileObject
 * @memberof object
 */
function getSourceFileObject(file, config) {
  return new SourceFileObject(file, config);
}

module.exports.getSourceFileObject = getSourceFileObject;
