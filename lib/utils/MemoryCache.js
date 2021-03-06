"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var hasOwnProperty = Object.prototype.hasOwnProperty;
var cache = {};

var MemoryCache = function () {
  function MemoryCache(name) {
    _classCallCheck(this, MemoryCache);

    this.name = name;

    this.fetch.bind(this);
    this.clear.bind(this);

    cache[name] = cache[name] || {};
  }

  _createClass(MemoryCache, [{
    key: "fetch",
    value: function fetch(key, miss) {
      if (hasOwnProperty.call(cache[this.name], key)) {
        return cache[this.name][key];
      }

      cache[this.name][key] = miss(Object.keys(cache[this.name]));
      return cache[this.name][key];
    }
  }, {
    key: "clear",
    value: function clear() {
      cache[this.name] = {};
    }
  }]);

  return MemoryCache;
}();

exports.default = MemoryCache;
module.exports = exports['default'];