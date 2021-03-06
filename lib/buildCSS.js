'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = buildCSS;

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _foreach = require('foreach');

var _foreach2 = _interopRequireDefault(_foreach);

var _transformSpecificationIntoCSS = require('./transformSpecificationIntoCSS');

var _transformSpecificationIntoCSS2 = _interopRequireDefault(_transformSpecificationIntoCSS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildCSS(stylesheets, options) {
  var css = '';

  (0, _foreach2.default)(stylesheets, function (stylesheet, name) {
    var cssOptions = (0, _objectAssign2.default)({}, options);
    cssOptions.prefixes = [options.filename, name];

    css += (0, _transformSpecificationIntoCSS2.default)(stylesheet, cssOptions);

    if (css.length) {
      css += '\n';
    }
  });

  if (css.length === 0) {
    return css;
  }

  var vp = options.vendorPrefixes;

  if (vp) {
    if ((typeof vp === 'undefined' ? 'undefined' : _typeof(vp)) === 'object') {
      css = (0, _postcss2.default)([(0, _autoprefixer2.default)(vp)]).process(css).css;
    } else {
      css = (0, _postcss2.default)([_autoprefixer2.default]).process(css).css;
    }
  }

  if (options.minify) {
    css = new _cleanCss2.default().minify(css).styles;
  }

  return css;
}
module.exports = exports['default'];