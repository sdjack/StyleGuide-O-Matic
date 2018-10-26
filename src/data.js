/**
 * Source File Object
 * @namespace data
 */
const fs = require("fs");
const path = require("path");
const sass = require("node-sass");
const sassExtract = require("sass-extract");
const CoM = require("console-o-matic");
/**
 * Stored RegExp patterns used for parsing file data
 * @constant {Object} PATTERNS
 * @property {RegExp} PATTERNS.comments1 - RegExp pattern
 * @property {RegExp} PATTERNS.comments2 - RegExp pattern
 * @property {RegExp} PATTERNS.comments3 - RegExp pattern
 * @property {RegExp} PATTERNS.comments4 - RegExp pattern
 * @property {RegExp} PATTERNS.docFlags - RegExp pattern
 * @memberof data
 */
const PATTERNS = {
  comments1: /<!--[\s\S]*?-->/g,
  comments2: /((?:\/\*){1}[\w\d\s\W\S]*?(?:\*\/){1})|((?:\/\/){1}[\w\d\s\W]*?(?:[\r\n]))/g,
  comments3: /(\n+(?![^\n]))/gm,
  comments4: /^([\w\s\S\W\r\n]+)(?:const)/g,
  docFlags: /(?:@)([\w]+)\s([\w\W\s\S]+?)(?=[\W]+@|[\W]\*{1,}\/)/
};
/**
 * Source File Data Object
 * @function SourceFileData
 * @memberof data
 */
function SourceFileData(filePath, contents, options) {
  const self = this;
  self.name = "Global";
  self.version = "0.0.0";
  self.description = "";
  self.example = "";
  self.styles = {vars: { global: {}}, css: ""};
  const symbols = new RegExp(PATTERNS.docFlags, "gim");
  let parsed;
  while ((parsed = symbols.exec(contents)) !== null) {
    if (parsed[1] && parsed[2]) {
      if (parsed[1] === "scss") {
        self.scssPath = parsed[2].trim();
      } else {
        self[parsed[1]] = parsed[2].trim();
      }
    }
  }
  if (self.namespace) {
    self.name = self.namespace;
  }
  if (!self.description) {
    self.description = `${self.name}: ver.${self.version} `;
  }
  if (self.scssPath) {
    const loaderScss = path.join(filePath, "../", self.scssPath, "loader.scss");
    const fallbackScss = path.join(filePath, "../", self.scssPath, `${self.name}.scss`);
    const scssFile = fs.existsSync(loaderScss) ? loaderScss : fs.existsSync(fallbackScss) ? fallbackScss : null;
    if (scssFile) {
      self.styles = sassExtract.renderSync({ file: scssFile });
      var cssSource = self.styles.css.toString();
      cssSource = cssSource.replace(PATTERNS.comments2, "");
      cssSource = cssSource.replace(PATTERNS.comments3, "");
      self.styles.css = cssSource;
    }
  }
}

/**
 * Misc helper func
 * @function getSourceFileData
 * @param {String} sourceFile
 * @return {Object} SourceFileData
 * @memberof data
 */
function getSourceFileData(...args) {
  return new SourceFileData(...args);
}

module.exports.getSourceFileData = getSourceFileData;
