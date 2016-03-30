import assert from 'assert';
import vm from 'vm';
import extend from 'object-assign';
import { types as t } from 'babel-core';
import generate from 'babel-generator';

const isBlank = /^\s*$/


export default function transformObjectExpressionIntoStyleSheetObject(expr, context) {
  assert(t.isObjectExpression(expr), 'must be a object expression');

  context = vm.createContext(extend({}, context));

  context.evaluate = function evaluate(node) {
    return vm.runInContext(generate(node).code, this);
  };

  const result = {};

  expr.properties.forEach((property) => {
    processTopLevelProperty(property.key, property.value, result, context);
  });

  return result;
}

function processTopLevelProperty(key, value, result, context) {
  const name = keyToName(key, context);

  assert(t.isObjectExpression(value), 'top-level value must be a object expression');

  result[name] = {};

  processProperties(value.properties, result[name], context);
}

function processProperties(properties, result, context) {
  properties.forEach((property) => {
    processProperty(property.key, property.value, result, context);
  });
}

function processProperty(key, value, result, context) {
  const name = keyToName(key, context);

  if (canEvaluate(value, context)) {
    const val = context.evaluate(value);
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
    assert(typeof val === 'string' || typeof val === 'number' || typeof val.toString === "function", 'value must be a string or number or has toString method');

    if (typeof val === 'string') {
      assert(!isBlank.test(val), 'string value cannot be blank');
    }

    result[name] = val;
  } else if (t.isObjectExpression(value)) {
    result[name] = {};

    processProperties(value.properties, result[name], context);
  } else if (t.isUnaryExpression(value) && value.prefix === true && value.operator === '-') {
    assert(t.isLiteral(value.argument), 'invalid unary argument type');

    result[name] = -value.argument.value;
  } else {
      console.log(value)
    assert(false, 'invalid value expression type');
  }
}

function keyToName(key, context) {
    if (t.isIdentifier(key) || t.isLiteral(key) && typeof key.value === 'string') {
        return key.name || key.value;
    } else {
//        return context[key.object.name][key.property.name]
        return context.evaluate(key);
    }
}

function canEvaluate(expr, context) {
  if (t.isLiteral(expr)) {
    return true;
  } else if (t.isIdentifier(expr) && context.hasOwnProperty(expr.name)) {
    return true;
  } else if (t.isMemberExpression(expr)) {
    return t.isIdentifier(expr.property) && canEvaluate(expr.object, context);
  } else if (t.isBinaryExpression(expr)) {
    return canEvaluate(expr.left, context) && canEvaluate(expr.right, context);
  } else if (t.isUnaryExpression(expr)) {
    return canEvaluate(expr.argument, context)
  } else if (t.isArrayExpression(expr)) {
    return expr.elements.reduce(function(result, expr) {
      if (!canEvaluate(expr, context)) {
        console.log(expr)
      }
      return result && canEvaluate(expr, context)
    }, true)
  } else if (t.isCallExpression(expr)) {
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

    return true
  }

  return false;
}
