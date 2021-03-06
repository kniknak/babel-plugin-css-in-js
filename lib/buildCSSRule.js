'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = buildCSSRule;
var isUnquotedContentValue = /^(normal|none|(\b(url\([^)]*\)|chapter_counter|attr\([^)]*\)|(no-)?(open|close)-quote|inherit)((\b\s*)|$|\s+))+)$/;
var uppercaseLetter = /([A-Z])/g;

var unitlessNumbers = {
  animationIterationCount: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridColumn: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  stopOpacity: true,
  strokeDashoffset: true,
  strokeOpacity: true,
  strokeWidth: true
};

function buildCSSRule(key, value) {
  if (!unitlessNumbers[key] && (typeof value === "number" || parseFloat(value).toString() === value)) {
    value = '' + value + 'px';
  } else if (key === 'content' && !isUnquotedContentValue.test(value)) {
    value = "'" + value.replace(/'/g, "\\'") + "'";
  }

  return hyphenate(key) + ': ' + value + ';';
}

function hyphenate(string) {
  return string.replace(uppercaseLetter, '-$1').toLowerCase();
}
module.exports = exports['default'];