var JsClass = require('../../object-model/class');
var JsDoc = require('../../jsdoc');
var JsFunction = require('../../object-model/function');

var YMProvider = function() {};
YMProvider.prototype = {
    process: function(file) {
        var result = null;
        file.iterateNodesByType('CallExpression', function(node) {
            if (node.callee.type === 'MemberExpression' &&
                node.callee.object.type === 'Identifier' &&
                node.callee.object.name === 'modules' &&
                node.callee.property.type === 'Identifier' &&
                node.callee.property.name === 'define'
            ) {
                result = {
                    name: node.arguments[0].value,
                    dependencies: node.arguments[1].elements ? node.arguments[1].elements.map(function (elm) {
                        return elm.value;
                    }) : []
                };
            }
        });
        return result;
    }
};

module.exports = YMProvider;
