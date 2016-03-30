'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = plugin;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _foreach = require('foreach');

var _foreach2 = _interopRequireDefault(_foreach);

var _fs = require('fs');

var _path = require('path');

var _mkdirp = require('mkdirp');

var _transformObjectExpressionIntoStyleSheetObject = require('./transformObjectExpressionIntoStyleSheetObject');

var _transformObjectExpressionIntoStyleSheetObject2 = _interopRequireDefault(_transformObjectExpressionIntoStyleSheetObject);

var _transformStyleSheetObjectIntoSpecification = require('./transformStyleSheetObjectIntoSpecification');

var _transformStyleSheetObjectIntoSpecification2 = _interopRequireDefault(_transformStyleSheetObjectIntoSpecification);

var _generateClassName = require('./generateClassName');

var _generateClassName2 = _interopRequireDefault(_generateClassName);

var _buildCSS = require('./buildCSS');

var _buildCSS2 = _interopRequireDefault(_buildCSS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var KEY = '__cssinjs';

var DEFAULT_OPTIONS = {
  identifier: 'cssInJS',
  vendorPrefixes: false,
  minify: false,
  compressClassNames: false,
  mediaMap: {},
  context: null,
  cacheDir: 'tmp/cache/',
  bundleFile: 'bundle.css'
};

function plugin(context) {
  context[KEY] = {
    cache: {},
    visiting: {}
  };

  return {
    visitor: visitor(context)
  };
}

function visitor(context) {
  var t = context.types;

  return {
    Program: {
      enter: function enter() {
        var filename = (0, _path.relative)(process.cwd(), this.file.opts.filename);
        var options = buildOptions(this.opts, filename);

        this.cssInJS = { filename: filename, options: options, stylesheets: {} };

        context[KEY].visiting[filename] = true;
      },
      exit: function exit() {
        var _this = this;

        var filename = this.cssInJS.filename;

        /* istanbul ignore if */
        if (!context[KEY].visiting[filename]) return;

        var css = (0, _buildCSS2.default)(this.cssInJS.stylesheets, this.cssInJS.options);

        this.file.metadata.css = css;

        if (css && css.length) {
          context[KEY].cache[this.cssInJS.filename] = css;
        } else {
          delete context[KEY].cache[this.cssInJS.filename];
        }

        if (this.cssInJS.options.bundleFile && Object.keys(context[KEY].cache).length) {
          (function () {
            var bundleFile = (0, _path.join)(process.cwd(), _this.cssInJS.options.bundleFile);
            var output = [];

            (0, _mkdirp.sync)((0, _path.dirname)(bundleFile));

            (0, _foreach2.default)(context[KEY].cache, function (fileCSS) {
              output.push(fileCSS);
            });

            (0, _fs.writeFileSync)(bundleFile, output.join(''), { encoding: 'utf8' });
          })();
        }

        context[KEY].visiting[filename] = false;
      }
    },

    CallExpression: function CallExpression(path) {
      if (!t.isIdentifier(path.node.callee, { name: this.cssInJS.options.identifier })) {
        return;
      }

      (0, _assert2.default)(t.isVariableDeclarator(path.parentPath.node), 'return value of cssInJS(...) must be assigned to a variable');

      var sheetId = path.parentPath.node.id.name;
      var expr = path.node.arguments[0];

      (0, _assert2.default)(expr, 'cssInJS(...) call is missing an argument');

      var obj = (0, _transformObjectExpressionIntoStyleSheetObject2.default)(expr, this.cssInJS.options.context);
      var sheet = (0, _transformStyleSheetObjectIntoSpecification2.default)(obj);

      this.cssInJS.stylesheets[sheetId] = sheet;

      var gcnOptions = (0, _objectAssign2.default)({}, this.cssInJS.options, { prefixes: [this.cssInJS.filename, sheetId] });

      var map = {};

      Object.keys(sheet).map(function (styleId) {
        if (styleId.indexOf("__") < 0) {
          map[styleId] = (0, _generateClassName2.default)(styleId, gcnOptions);
        } else {
          var left = styleId.split("__")[0];
          var right = styleId.split("__")[1];

          if (_typeof(map[left]) !== "object") {
            map[left] = {};
          }

          map[left][right] = (0, _generateClassName2.default)(styleId, gcnOptions);
        }
      });

      var objectToAST = function objectToAST(map) {
        var result = [];

        Object.keys(map).map(function (key) {
          if (_typeof(map[key]) !== "object") {
            result.push(t.objectProperty(t.identifier(key), t.stringLiteral(map[key])));
          } else {
            result.push(t.objectProperty(t.identifier(key), t.objectExpression(objectToAST(map[key]))));
          }
        });

        return result;
      };

      path.replaceWith(t.objectExpression(objectToAST(map)));
    }
  };
}

var contextFileCache = {};

function buildOptions(options, filename) {
  options = (0, _objectAssign2.default)({}, DEFAULT_OPTIONS, options, { filename: filename });

  if (typeof options.context === 'string') {
    var file = (0, _path.resolve)(options.context);

    if (typeof contextFileCache[file] === 'undefined') {
      contextFileCache[file] = require(file);
    }

    options.context = contextFileCache[file];
  }

  return options;
}
module.exports = exports['default'];