/**
 * Dispatch module used in file conversion
 * @namespace dispatcher
 */
const _ = require("lodash");
const async = require("async");
const getSourceFileObject = require("./object").getSourceFileObject;

/**
 * Default configuration. Everything here can be overridden
 * @constant {Object} defaultConfig
 * @memberof dispatcher
 */
const defaultConfig = {};
/**
 * Dispatch module used in file conversion
 * @function Dispatcher
 * @param {Object} config - Usage settings
 * @memberof dispatcher
 */
function Dispatcher(config) {
  this._settings = config;
  this._registry = {};
  this._queue = [];

  this._queue.push(function(callback) {
    callback(null, { sourceFile: [], sourceFiles: {} });
  });

  this.register = function(file) {
    const self = this;
    if (file.contents) {
      const sourceFileObject = getSourceFileObject(file, self._settings);
      const id = sourceFileObject.id;
      if (!self._registry[id]) {
        self._registry[id] = true;
        self._queue.push(function(data, callback) {
          sourceFileObject.compile(function(err, src) {
            data.sourceFile.push(src);
            data.sourceFiles[src.id] = src;
            callback(err, data);
          });
        });
      }
    }
  };

  this.compile = function(callback) {
    const self = this;
    async.waterfall(self._queue, callback);
  };
}

/**
 * Misc helper func
 * @function getDispatcher
 * @param {Object} config - Usage settings
 * @return {Object} Dispatcher
 * @memberof dispatcher
 */
function getDispatcher(config) {
  return new Dispatcher(config);
}

module.exports.getDispatcher = getDispatcher;
