/**
 * Source File Object
 * @namespace data
 */
const fs = require("fs");
const path = require("path");
/**
 * Stored RegExp patterns used for parsing svg file data
 * @constant {Object} PATTERNS
 * @property {RegExp} PATTERNS.comments1 - RegExp pattern
 * @property {RegExp} PATTERNS.comments2 - RegExp pattern
 * @property {RegExp} PATTERNS.comments3 - RegExp pattern
 * @property {RegExp} PATTERNS.comments4 - RegExp pattern
 * @memberof svg-data
 */
const PATTERNS = {
  comments1: /<!--[\s\S]*?-->/g,
  comments2: /((?:\/\*){1}[\w\d\s\W\S]*?(?:\*\/){1})|((?:\/\/){1}[\w\d\s\W]*?(?:[\r\n]))/g,
  comments3: /(\n+(?![^\n]))/gm,
  comments4: /^([\w\s\S\W\r\n]+)(?:class)/g
};
/**
 * Source File Data Object
 * @function SourceFileData
 * @memberof data
 */
function SourceFileData(filePath, contents, options) {
  const self = this;
  if (options.styles) {
    self.name = path.basename(filePath, path.extname(filePath));
    self.version = "0.0.0";
    self.description = `${self.name}: ver.${self.version} `;
    self.example = "";
  } else {
    const pkg = JSON.parse(contents);
    Object.entries(pkg).forEach(([attr, val]) => {
      self[attr] = val;
    });
    if (!self.description) {
      self.description = `${self.name}: ver.${self.version} `;
    }
    if (options.styles) {
      self.example = `<${self.name}>
        Example Content
      </${self.name}>`;
    } else {
      let exampleContents = fs.readFileSync(path.dirname(filePath) + "/Example.js", "utf-8");
      exampleContents = exampleContents.replace(/((?:\/\*){1}[\w\d\s\W\S]*?(?:\*\/){1})|((?:\/\/){1}[\w\d\s\W]*?(?:[\r\n]))/g, "");
      exampleContents = exampleContents.replace(/(\n+(?![^\n]))/gm, "");
      self.example = exampleContents.replace(/^([\w\s\S\W\r\n]+)(?:const)/g, "const");
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
