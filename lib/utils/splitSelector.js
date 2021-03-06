'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = splitSelector;
function splitSelector(name) {
  var indexOfColon = name.indexOf(':');
  var indexOfBracket = name.indexOf('[');

  if (indexOfColon < 0 && indexOfBracket < 0) {
    return [name, ''];
  }

  var splitIndex = void 0;

  if (indexOfColon < 0) {
    splitIndex = indexOfBracket;
  } else if (indexOfBracket < 0) {
    splitIndex = indexOfColon;
  } else {
    splitIndex = Math.min(indexOfBracket, indexOfColon);
  }

  return [name.substr(0, splitIndex), name.substr(splitIndex)];
}
module.exports = exports['default'];