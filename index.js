/**
 * Experimental style guide generator for use primarily with Style-O-Matic
 * @namespace styleguide-o-matic
 */
var vfs = require("vinyl-fs");
var converter = require("./src/converter");

module.exports = function(config) {
  var srcRoot = config.src.root;
  var destRoot = config.dest;
  vfs
    .src([`${srcRoot}/**/*`])
    .pipe(converter(config))
    .pipe(vfs.dest(destRoot));
};

module.exports.gulpPlugin = converter;
