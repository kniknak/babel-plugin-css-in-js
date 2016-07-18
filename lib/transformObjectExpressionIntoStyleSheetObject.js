'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = transformObjectExpressionIntoStyleSheetObject;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _babelCore = require('babel-core');

var _babelGenerator = require('babel-generator');

var _babelGenerator2 = _interopRequireDefault(_babelGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isBlank = /^\s*$/;

function transformObjectExpressionIntoStyleSheetObject(expr, context) {
    (0, _assert2.default)(_babelCore.types.isObjectExpression(expr), 'must be a object expression');

    context = _vm2.default.createContext((0, _objectAssign2.default)({}, context));

    context.evaluate = function evaluate(node) {
        return _vm2.default.runInContext((0, _babelGenerator2.default)(node).code, this);
    };

    var result = {};

    expr.properties.forEach(function (property) {
        processTopLevelProperty(property.key, property.value, result, context);
    });

    return result;
}

function processTopLevelProperty(key, value, result, context) {
    var name = keyToName(key, context);

    (0, _assert2.default)(_babelCore.types.isObjectExpression(value), 'top-level value must be a object expression');

    result[name] = {};

    processProperties(value.properties, result[name], context);
}

function processProperties(properties, result, context) {
    properties.forEach(function (property) {
        processProperty(property.key, property.value, result, context);
    });
}

function processProperty(key, value, result, context) {
    var name = keyToName(key, context);

    if (canEvaluate(value, context)) {
        var val = context.evaluate(value);
        /*
         console.log(val)
         console.log(typeof val.prototype)
         console.log(typeof val.toString)
         console.log(typeof val.prototype.toString)
          if (typeof val.toString === "function") {
         val = val.toString()
         }
          console.log(val)
         */
        (0, _assert2.default)(typeof val === 'string' || typeof val === 'number' || typeof val.toString === "function", 'value must be a string or number or has toString method');

        if (typeof val === 'string') {
            if (name !== "content") {
                (0, _assert2.default)(!isBlank.test(val), 'string value cannot be blank');
            }
        }

        result[name] = val;
    } else if (_babelCore.types.isObjectExpression(value)) {
        result[name] = {};

        processProperties(value.properties, result[name], context);
    } else if (_babelCore.types.isUnaryExpression(value) && value.prefix === true && value.operator === '-') {
        (0, _assert2.default)(_babelCore.types.isLiteral(value.argument), 'invalid unary argument type');

        result[name] = -value.argument.value;
    } else {
        console.log(value);
        (0, _assert2.default)(false, 'invalid value expression type');
    }
}

function keyToName(key, context) {
    if (_babelCore.types.isIdentifier(key) || _babelCore.types.isLiteral(key) && typeof key.value === 'string') {
        return key.name || key.value;
    } else {
        //        return context[key.object.name][key.property.name]
        return context.evaluate(key);
    }
}

function canEvaluate(expr, context) {
    if (_babelCore.types.isLiteral(expr)) {
        return true;
    } else if (_babelCore.types.isIdentifier(expr) && context.hasOwnProperty(expr.name)) {
        return true;
    } else if (_babelCore.types.isMemberExpression(expr)) {
        return _babelCore.types.isIdentifier(expr.property) && canEvaluate(expr.object, context);
    } else if (_babelCore.types.isBinaryExpression(expr)) {
        return canEvaluate(expr.left, context) && canEvaluate(expr.right, context);
    } else if (_babelCore.types.isUnaryExpression(expr)) {
        return canEvaluate(expr.argument, context);
    } else if (_babelCore.types.isArrayExpression(expr)) {
        return expr.elements.reduce(function (result, expr) {
            if (!canEvaluate(expr, context)) {
                console.log(expr);
            }
            return result && canEvaluate(expr, context);
        }, true);
    } else if (_babelCore.types.isCallExpression(expr)) {
        /*  if (expr.callee.object === "undefined") {
         console.log(expr)
         assert(false, "invalid expr.callee.object")
         return false
         }
          if (typeof context[expr.callee.object.name] !== "object") {
         console.log("expression: ",  expr)
         console.log("context: ", context)
         assert(false, "context." + expr.callee.object.name + " is not defined")
         return false
         }
          if (context[expr.callee.object.name].hasOwnProperty(expr.callee.property.name) === undefined) {
         console.log("expression: ",  expr)
         console.log("context." + expr.callee.object.name + ": ", context[expr.callee.object.name])
         assert(false, "context." + expr.callee.object.name + "." + expr.callee.property.name + " is not defined")
         return false
         }
          if (typeof context[expr.callee.object.name][expr.callee.property.name] !== "function") {
         console.log("expression: ",  expr)
         console.log("context." + expr.callee.object.name + "." + expr.callee.property.name + ": ", context[expr.callee.object.name][expr.callee.property.name])
         assert(false, "context." + expr.callee.object.name + "." + expr.callee.property.name + " is not a function")
         return false
         }
          if (!expr.arguments.reduce(function(result, expr) {return result && canEvaluate(expr, context)}, true)) {
         console.log("expr.arguments: ",  expr.arguments)
         assert(false, "cant evaluate expr.arguments")
         return false
         }*/

        return true;
    }

    return false;
}
module.exports = exports['default'];