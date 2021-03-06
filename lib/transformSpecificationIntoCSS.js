'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = transformSpecificationIntoCSS;

var _foreach = require('foreach');

var _foreach2 = _interopRequireDefault(_foreach);

var _buildCSSRule = require('./buildCSSRule');

var _buildCSSRule2 = _interopRequireDefault(_buildCSSRule);

var _generateClassName = require('./generateClassName');

var _generateClassName2 = _interopRequireDefault(_generateClassName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transformSpecificationIntoCSS(spec) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var css = [];

  (0, _foreach2.default)(spec, function (value, key) {
    processStyle(css, key, value, 0, options);
  });

  return css.join('\n');
}

function processStyle(css, name, spec, level, options) {
  processRules(css, name, spec.rules, level, options);
  processSelectors(css, name, spec.selectors, level, options);
  processMediaQueries(css, name, spec.mediaQueries, level, options);
}

function processRules(css, name, rules, level, options) {
  if (isEmpty(rules)) {
    return;
  }

  css.push(indent(level) + '.' + (0, _generateClassName2.default)(name, options) + ' {');

  (0, _foreach2.default)(rules, function (value, key) {
    css.push(indent(level + 1) + (0, _buildCSSRule2.default)(key, value));
  });

  css.push(indent(level) + '}');
}

function processSelectors(css, name, selectors, level, options) {
  if (isEmpty(selectors)) {
    return;
  }

  (0, _foreach2.default)(selectors, function (value, key) {
    processRules(css, name + key, value.rules, level, options);
  });
}

function processMediaQueries(css, name, mediaQueries, level, options) {
  if (isEmpty(mediaQueries)) {
    return;
  }

  (0, _foreach2.default)(mediaQueries, function (value, key) {
    processMediaQuery(css, name, key, value, level, options);
  });
}

function processMediaQuery(css, name, query, content, level, options) {
  var mediaQueryCSS = [];

  processRules(mediaQueryCSS, name, content.rules, level + 1, options);
  processSelectors(mediaQueryCSS, name, content.selectors, level + 1, options);

  if (mediaQueryCSS.length) {
    css.push(indent(level) + '@' + generateMediaQueryName(query, options) + ' {');
    Array.prototype.push.apply(css, mediaQueryCSS);
    css.push(indent(level) + '}');
  }
}

function generateMediaQueryName(name, options) {
  if (options.mediaMap) {
    return options.mediaMap[name] || name;
  }

  return name;
}

function indent(level) {
  var result = '';

  for (var i = 0; i < level; i++) {
    result += '  ';
  }

  return result;
}

function isEmpty(obj) {
  return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || Object.keys(obj).length === 0;
}
module.exports = exports['default'];