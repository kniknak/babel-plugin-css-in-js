'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = transformStyleSheetObjectIntoSpecification;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _foreach = require('foreach');

var _foreach2 = _interopRequireDefault(_foreach);

var _splitSelector5 = require('./utils/splitSelector');

var _splitSelector6 = _interopRequireDefault(_splitSelector5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isMediaQueryDeclaration = /^@/;
var hasAttachedSelector = /[^:\[]+[:\[]/;
var isStandaloneSelector = /^[:\[]/;
var isValidStyleName = /^[_a-zA-Z]+[ _a-zA-Z0-9-]*[_a-zA-Z0-9-]*$/;

function transformStyleSheetObjectIntoSpecification(content) {
  assertPlainObject(content);

  var styles = {};

  (0, _foreach2.default)(content, function (value, key) {
    if (isMediaQueryDeclaration.test(key)) {
      processMediaQuery(styles, key.substring(1), value);
    } else if (isStandaloneSelector.test(key)) {
      (0, _assert2.default)(false, 'stand-alone selectors are not allowed at the top-level');
    } else if (hasAttachedSelector.test(key)) {
      var _splitSelector = (0, _splitSelector6.default)(key);

      var _splitSelector2 = _slicedToArray(_splitSelector, 2);

      var styleName = _splitSelector2[0];
      var selectorName = _splitSelector2[1];

      processStyleAndSelector(styles, styleName, selectorName, value);
    } else {
      processStyle(styles, key, value);
    }
  });

  return styles;
}

function processMediaQuery(styles, mediaQueryName, content) {
  assertPlainObject(content);

  (0, _foreach2.default)(content, function (value, key) {
    if (isMediaQueryDeclaration.test(key)) {
      (0, _assert2.default)(false, 'media queries cannot be nested into each other');
    } else if (isStandaloneSelector.test(key)) {
      (0, _assert2.default)(false, 'stand-alone selectors are not allowed in top-level media queries');
    } else if (hasAttachedSelector.test(key)) {
      var _splitSelector3 = (0, _splitSelector6.default)(key);

      var _splitSelector4 = _slicedToArray(_splitSelector3, 2);

      var styleName = _splitSelector4[0];
      var selectorName = _splitSelector4[1];

      processStyleAndMediaQueryAndSelector(styles, styleName, mediaQueryName, selectorName, value);
    } else {
      processStyleAndMediaQuery(styles, key, mediaQueryName, value);
    }
  });
}

function processStyle(styles, styleName, content) {
  assertPlainObject(content);

  var style = initStyleSpec(styles, styleName);

  (0, _foreach2.default)(content, function (value, key) {
    if (value.toString() !== "[object Object]") {
      value = value.toString();
    }

    if (isMediaQueryDeclaration.test(key)) {
      processStyleAndMediaQuery(styles, styleName, key.substring(1), value);
    } else if (isStandaloneSelector.test(key)) {
      processStyleAndSelector(styles, styleName, key, value);
    } else if (hasAttachedSelector.test(key)) {
      (0, _assert2.default)(false, 'styles cannot be nested into each other');
    } else if (isPlainObject(value)) {
      Object.keys(value).map(function (selectorName) {
        processStyle(styles, styleName + "__" + key, value);
      });
    } else {
      processRule(style.rules, key, value);
    }
  });
}

function processStyleAndMediaQuery(styles, styleName, mediaQueryName, content) {
  assertPlainObject(content);

  var style = initStyleSpec(styles, styleName);
  var mediaQuery = initMediaQuerySpec(style.mediaQueries, mediaQueryName);

  (0, _foreach2.default)(content, function (value, key) {
    if (value.toString() !== "[object Object]") {
      value = value.toString();
    }

    if (isMediaQueryDeclaration.test(key)) {
      (0, _assert2.default)(false, 'media queries cannot be nested into each other');
    } else if (isStandaloneSelector.test(key)) {
      processStyleAndMediaQueryAndSelector(styles, styleName, mediaQueryName, key, value);
    } else if (hasAttachedSelector.test(key)) {
      (0, _assert2.default)(false, 'styles cannot be nested into each other');
    } else {
      processRule(mediaQuery.rules, key, value);
    }
  });
}

function processStyleAndSelector(styles, styleName, selectorName, content) {
  assertPlainObject(content);

  var style = initStyleSpec(styles, styleName);
  var selector = initSelectorSpec(style.selectors, selectorName);

  (0, _foreach2.default)(content, function (value, key) {
    if (value.toString() !== "[object Object]") {
      value = value.toString();
    }

    if (isMediaQueryDeclaration.test(key)) {
      (0, _assert2.default)(false, 'media queries cannot be nested into selectors');
    } else if (isStandaloneSelector.test(key)) {
      processStyleAndSelector(styles, styleName, selectorName + key, value);
    } else if (hasAttachedSelector.test(key)) {
      (0, _assert2.default)(false, 'styles cannot be nested into each other');
    } else {
      processRule(selector.rules, key, value);
    }
  });
}

function processStyleAndMediaQueryAndSelector(styles, styleName, mediaQueryName, selectorName, content) {
  (0, _assert2.default)(isPlainObject(content), 'style value must be a plain object');

  var style = initStyleSpec(styles, styleName);
  var mediaQuery = initMediaQuerySpec(style.mediaQueries, mediaQueryName);
  var selector = initSelectorSpec(mediaQuery.selectors, selectorName);

  (0, _foreach2.default)(content, function (value, key) {
    if (value.toString() !== "[object Object]") {
      value = value.toString();
    }

    if (isMediaQueryDeclaration.test(key)) {
      (0, _assert2.default)(false, 'media queries cannot be nested into each other');
    } else if (isStandaloneSelector.test(key)) {
      processStyleAndMediaQueryAndSelector(styles, styleName, mediaQueryName, selectorName + key, value);
    } else if (hasAttachedSelector.test(key)) {
      (0, _assert2.default)(false, 'styles cannot be nested into each other');
    } else {
      processRule(selector.rules, key, value);
    }
  });
}

function processRule(rules, key, value) {
  (0, _assert2.default)(typeof value === 'string' || typeof value === 'number', 'value must be a number or a string');
  rules[key] = value;
}

function initStyleSpec(styles, name) {
  (0, _assert2.default)(isValidStyleName.test(name), 'style name is invalid');

  styles[name] = styles[name] || { rules: {}, selectors: {}, mediaQueries: {} };
  return styles[name];
}

function initMediaQuerySpec(mediaQueries, name) {
  mediaQueries[name] = mediaQueries[name] || { rules: {}, selectors: {} };
  return mediaQueries[name];
}

function initSelectorSpec(selectors, name) {
  selectors[name] = selectors[name] || { rules: {} };
  return selectors[name];
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function assertPlainObject(content) {
  (0, _assert2.default)(isPlainObject(content), 'value must be a plain object');
}
module.exports = exports['default'];