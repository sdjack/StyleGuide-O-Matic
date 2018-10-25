/**
 * Dispatch module used in file conversion
 * @namespace scsshelper
 */
const _ = require("lodash");
const async = require("async");
const fs = require("fs");
const find = require("find");
const sass = require("node-sass");
const sassExtract = require("sass-extract");
const getSourceFileObject = require("./object").getSourceFileObject;

/**
 * Default configuration. Everything here can be overridden
 * @constant {Object} defaultConfig
 * @memberof scsshelper
 */
const defaultConfig = {};
/**
 * Dispatch module used in file conversion
 * @function ScssHelper
 * @param {Object} config - Usage settings
 * @memberof scsshelper
 */
function ScssHelper(config) {
  this._settings = config;
  this._registry = {};
  this._queue = [];
  const self = this;

  find.file(/\.scss$/, config.src.styles, function(files) {
    _.forEach(files, (pathValue) => {
      _.forEach(config.componentList, (name) => {
        if (pathValue.indexOf(name) !== -1) {
          if (!self._registry[name] || pathValue.indexOf("loader.scss") !== -1) {
            self._registry[name] = pathValue;
          }
        }
      });
    });
    console.log(self._registry);
    // const id = fileName;
    // if (!self._registry[id]) {
    //   self._registry[id] = true;
    //   self._queue.push(function(data, callback) {
    //     if (fs.existsSync(stylePath)) {
    //       file.data.styles = sassExtract.renderSync({ file: stylePath });
    //       var cssSource = file.data.styles.css.toString();
    //       cssSource = cssSource.replace(/((?:\/\*){1}[\w\d\s\W\S]*?(?:\*\/){1})|((?:\/\/){1}[\w\d\s\W]*?(?:[\r\n]))/g, "");
    //       cssSource = cssSource.replace(/(\n+(?![^\n]))/gm, "");
    //       file.data.styles.css = cssSource;
    //     }
    //   });
    // }
  });

  this.compile = function(callback) {
    const self = this;
    async.waterfall(self._queue, callback);
  };
}

/**
 * Misc helper func
 * @function getScssHelper
 * @param {Object} config - Usage settings
 * @return {Object} ScssHelper
 * @memberof scsshelper
 */
function getScssHelper(config) {
  return new ScssHelper(config);
}

module.exports.getScssHelper = getScssHelper;
