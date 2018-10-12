/**
 * Experimental style guide generator for use primarily with Style-O-Matic
 * @namespace styleguide-o-matic
 */
var vfs = require("vinyl-fs");
var converter = require("./src/converter");

module.exports = function(...args) {
  vfs
    .src(["src/components/**/package.json"])
    .pipe(converter(...args))
    .pipe(vfs.dest("src/components"));
};
