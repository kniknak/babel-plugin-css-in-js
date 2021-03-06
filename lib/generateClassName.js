'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = generateClassName;

var _compressClassName = require('./compressClassName');

var _compressClassName2 = _interopRequireDefault(_compressClassName);

var _splitSelector3 = require('./utils/splitSelector');

var _splitSelector4 = _interopRequireDefault(_splitSelector3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var invalidChars = /[^_a-z0-9-]/ig;

function generateClassName(id, options) {
  var result = '';

  if (options.prefix) {
    result += options.prefix.replace(invalidChars, '_') + '-';
  } else if (options.prefixes) {
    result += options.prefixes.map(function (p) {
      return p.replace(invalidChars, '_');
    }).join('-') + '-';
  }

  result += id;

  result = result.replace("modules_", "").replace("server_", "").replace("tmp-build_", "").replace("tmp_", "").replace("dist_", "").replace("_tsx-", "-").replace("_jsx-", "-").replace("_js-", "-").replace("_ts-", "-");
  if (options.compressClassNames) {
    var _splitSelector = (0, _splitSelector4.default)(result);

    var _splitSelector2 = _slicedToArray(_splitSelector, 2);

    var className = _splitSelector2[0];
    var selector = _splitSelector2[1];

    return (0, _compressClassName2.default)(className, options) + selector;
  }

  return result;
}
module.exports = exports['default'];