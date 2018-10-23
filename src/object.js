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
  this.config = config;
  this.path = file.path;
  this.contents = file.contents.toString();
  this.id = path.basename(file.path, path.extname(file.path));
  this.data = getSourceFileData(this.path, this.contents, this.config);

  const self = this;
  this.compile = function(callback) {
    try {
      process.nextTick(function() {
        callback(null, self);
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
