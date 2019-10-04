/**
 * The _model_module_version/_view_module_version this package implements.
 *
 * The html widget manager assumes that this is the same as the npm package
 * version number.
 */
const data = require('../package.json');
export const MODULE_VERSION = data.version;
export const MODULE_NAME = data.name;
