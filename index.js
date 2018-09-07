/**
 * Experimental style guide generator for use primarily with Style-O-Matic
 * @namespace styleguide-o-matic
 */
var PLUGIN_NAME = "StyleGuide-O-Matic";
var CoM = require("console-o-matic");
CoM.setName(PLUGIN_NAME);

module.exports = function(...args) {
  CoM.log("Loaded!");
  return PLUGIN_NAME;
};
