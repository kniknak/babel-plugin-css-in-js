'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearCache = clearCache;
exports.default = compressClassName;

var _DiskCache = require('./utils/DiskCache');

var _DiskCache2 = _interopRequireDefault(_DiskCache);

var _MemoryCache = require('./utils/MemoryCache');

var _MemoryCache2 = _interopRequireDefault(_MemoryCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cacheName = 'classnames';

function getCache(options) {
  if (options.cacheDir) {
    return new _DiskCache2.default(cacheName, options);
  }

  return new _MemoryCache2.default(cacheName);
}

function clearCache(options) {
  getCache(options).clear();
}

function compressClassName(className, options) {
  var cache = getCache(options);

  return cache.fetch(className, function (keys) {
    return '_' + keys.length.toString(36).split('').reverse().join('');
  });
}