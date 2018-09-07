/**
 * Source File Object
 * @namespace data
 */
/**
 * Stored RegExp patterns used for parsing sourceFile file data
 * @constant {Object} PATTERNS
 * @property {RegExp} PATTERNS.nan - RegExp pattern
 * @property {RegExp} PATTERNS.comments - RegExp pattern
 * @property {RegExp} PATTERNS.rootMarkup - RegExp pattern
 * @property {RegExp} PATTERNS.innerMarkup - RegExp pattern
 * @property {RegExp} PATTERNS.parseAttributes - RegExp pattern
 * @property {RegExp} PATTERNS.styleBlock - RegExp pattern
 * @property {RegExp} PATTERNS.styleBlockInner - RegExp pattern
 * @property {RegExp} PATTERNS.styleDef - RegExp pattern
 * @property {RegExp} PATTERNS.styleProps - RegExp pattern
 * @property {RegExp} PATTERNS.styleElements - RegExp pattern
 * @property {RegExp} PATTERNS.styleIDs - RegExp pattern
 * @property {RegExp} PATTERNS.styleClasses - RegExp pattern
 * @memberof data
 */
const PATTERNS = {
  nan: /(NaN(\s)?)+/g,
  comments: /<!--[\s\S]*?-->/g,
  rootMarkup: /<(\w+)([^>]*)>([\w\d\s\W\S]*?)(?=<\/\1>)/,
  innerMarkup: /(?:<(\w+)[^>]*?>?)([\w\W\s\S\d\D]*?)(?:<\/\1>|\/>)/,
  parseAttributes: /([\w\-]+)\=\"([\s\w\d\-\.\(\)\{\}\#\!]+)\"/,
  styleBlock: /(?=<style[^>]*>)([\w\W]*<\/style>)/g,
  styleBlockInner: /(?:<style[^>]*>)([\w\W]*)(?:<\/style>)/g,
  styleDef: /[\.\#]?([\w\d\-]+){(.+?)}/g,
  styleProps: /([\w\d\-]+)\:([\w\d\s\.\#\,\-]+)(?=[},;]|$)/,
  styleElements: /[^\.\#]([\w\d\-]+){(.+?)}/,
  styleIDs: /\#([\w\d\-]+){(.+?)}/,
  styleClasses: /\.([\w\d\-]+){(.+?)}/
};
/**
 * Apply camel case to a string
 * @function camelCase
 * @param input
 * @return {String}
 * @memberof data
 */
function camelCase(input) {
  return input.replace(/\W+(.)/g, function(match, chr) {
    return chr.toUpperCase();
  });
}

/**
 * Source File Data Object
 * @function SourceFileData
 * @memberof data
 */
function SourceFileData(id, contents) {
  let elements = {};
  let ids = {};
  let classes = {};
  let sourceFile = contents.replace(PATTERNS.comments, "");

  const styleMatches = sourceFile.match(PATTERNS.styleBlockInner);

  if (styleMatches) {
    const styles = styleMatches[0];
    elements = this.getStyleData(styles, PATTERNS.styleElements);
    ids = this.getStyleData(styles, PATTERNS.styleIDs);
    classes = this.getStyleData(styles, PATTERNS.styleClasses);
  }

  sourceFile = sourceFile.replace(PATTERNS.styleBlock, "");
  sourceFile = sourceFile.replace(PATTERNS.nan, "-");
  sourceFile = sourceFile.replace(new RegExp("<defs></defs>", "g"), "");
  this.name = id;
  this.sourceFile = sourceFile;
  this.data = {
    styles: { elements, ids, classes },
    props: {}
  };
  const markup = new RegExp(PATTERNS.rootMarkup, "gim");
  const self = this;
  let xmlParse;
  while ((xmlParse = markup.exec(sourceFile)) !== null) {
    self.data.tag = xmlParse[1];
    const attribs = xmlParse[2];
    const innerHTML = xmlParse[3];
    if (attribs) {
      const parse = new RegExp(PATTERNS.parseAttributes, "g");
      while ((attrArray = parse.exec(attribs)) !== null) {
        const attrib = camelCase(attrArray[1]);
        self[attrib] = attrArray[2];
        self.data.props[attrib] = attrArray[2];
      }
    }
    if (innerHTML) {
      if (innerHTML.substring(0, 1) === "<") {
        self.data.children = this.getChildData(innerHTML, PATTERNS.innerMarkup);
      } else {
        self.data.context = innerHTML;
      }
    }
  }
}
/**
 * Parse string CSS to object data
 * @function getStyleData
 * @param {String} input - String to be parsed
 * @param {RegExp} pattern - pattern to use
 * @return {Object}
 * @memberof data
 * @example
 *  const elements = SourceFileData.getStyleData(string, PATTERNS.styleElements);
 */
SourceFileData.prototype.getStyleData = function(input, pattern) {
  const output = {};
  const def = new RegExp(pattern, "g");
  while ((defArray = def.exec(input)) !== null) {
    const tag = defArray[1];
    const props = {};
    if (defArray[2]) {
      const parse = new RegExp(PATTERNS.styleProps, "g");
      while ((propArray = parse.exec(defArray[2])) !== null) {
        props[propArray[1]] = propArray[2];
      }
    }
    output[tag] = props;
  }
  return output;
};
/**
 * Use regex to find a childs contents and nested elements
 * @function getChildData
 * @param {String} input - String to be parsed
 * @param {RegExp} pattern - pattern to use
 * @return {Array}
 * @memberof data
 * @example
 *  const children = SourceFileData.getChildData(string, PATTERNS.innerMarkup);
 */
SourceFileData.prototype.getChildData = function(input, pattern) {
  const self = this;
  const output = [];
  const markup = new RegExp(pattern, "gim");
  let markupArray;
  while ((markupArray = markup.exec(input)) !== null) {
    const tag = markupArray[1];
    const attribs = markupArray[2];
    const innerHTML = markupArray[3];
    const item = {
      tag: markupArray[1],
      props: {}
    };

    if (attribs) {
      const parse = new RegExp(PATTERNS.parseAttributes, "g");
      while ((attrArray = parse.exec(attribs)) !== null) {
        const attrib = camelCase(attrArray[1]);
        item.props[attrib] = attrArray[2];
      }
    }
    if (innerHTML) {
      if (innerHTML.substring(0, 1) === "<") {
        item.children = this.getChildData(innerHTML, PATTERNS.innerMarkup);
      } else {
        item.context = innerHTML;
      }
    }

    output.push(item);
  }
  return output;
};

/**
 * Misc helper func
 * @function getSourceFileData
 * @param {String} sourceFile
 * @return {Object} SourceFileData
 * @memberof data
 */
function getSourceFileData(id, sourceFile) {
  return new SourceFileData(id, sourceFile);
}

module.exports.getSourceFileData = getSourceFileData;
