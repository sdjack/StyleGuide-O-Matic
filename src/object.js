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
  this._settings = config;
  this._path = file.path;
  this._contents = file.contents.toString();
  this.id = path.basename(file.path, path.extname(file.path));
  console.log(this._settings);
  this.data = getSourceFileData(file.path, this._contents, this._settings.examples);
  this.compile = function(callback) {
    const self = this;
    try {
      console.log(self._settings);
      const sourceFileData = getSourceFileData(self._path, self._contents, self._settings.examples);
      process.nextTick(function() {
        callback(null, sourceFileData);
      });
    } catch (error) {
      callback(error, null);
    }
  };
}

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
