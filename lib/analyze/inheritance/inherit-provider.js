var JsClass = require('../../object-model/class');
var JsDoc = require('../../jsdoc');
var JsFunction = require('../../object-model/function');

var InheritProvider = function() {};
InheritProvider.prototype = {
    process: function(file) {
        var classes = [];
        var inheritMethodName = 'inherit';
//        file.iterateNodesByType('CallExpression', function(node) {
//            if (node.callee.type === 'Identifier' && node.callee.name === 'require') {
//                if (node.arguments.length &&
//                    node.arguments[0].type === 'Literal' &&
//                    node.arguments[0].value === 'inherit'
//                ) {
//                    var parent = node.parentNode;
//                    if (parent.type === 'VariableDeclarator') {
//                        inheritMethodName = parent.id.name;
//                    }
//                }
//            }
//        });
        if (inheritMethodName) {
            file.iterateNodesByType('CallExpression', function(node) {
                if (node.callee.type === 'Identifier' && node.callee.name === inheritMethodName) {
                    var jsDocNode = file.getJsDocByEndLine(node.loc.start.line - 1);
                    var className = null;
                    var jsDoc = null;
                    if (jsDocNode) {
                        jsDoc = JsDoc.parse(jsDocNode.value);
                        className = jsDoc.selectOption('name');
                    }
                    if (!className) {
                        var parent = node.parentNode;
                        if (parent.type === 'VariableDeclarator') {
                            className = parent.id.name;
                        } else if (parent.type === 'AssignmentExpression') {
                            if (parent.left.type === 'Identifier') {
                                className = parent.left.name;
                            }
                        }
                    }
                    if (className) {
                        var classObj = new JsClass(className, jsDoc);
                        classes.push(classObj);
                        var isStatic = false;
                        var extToken = node.arguments[0];
                        if (extToken.type === 'Identifier') {
                            classObj.setExtends(extToken.name);
                        }
                        for (var i = 0, l = node.arguments.length; i < l; i++) {
                            var arg = node.arguments[i];
                            if (arg.type === 'ObjectExpression') {
                                arg.properties.forEach(function(property) {
                                    if (property.value.type === 'FunctionExpression') {
                                        var jsDocNode = file.getJsDocByEndLine(property.loc.start.line - 1);
                                        var jsDoc = null;
                                        if (jsDocNode) {
                                            jsDoc = JsDoc.parse(jsDocNode.value);
                                        }
                                        var method = new JsFunction(
                                            property.key.name || property.key.value,
                                            jsDoc
                                        );
//                                        method.setStatic(isStatic);
//                                        classObj.addMethod(method);
                                        if (isStatic) {
                                            classObj.addStaticMember(method);
                                        } else {
                                            classObj.addMember(method);
                                        }
                                    }
                                });
                                isStatic = true;
                            }
                        }
                    }
                }
            });
        }
        return {
            classes: classes,
            functions: []
        }
    }
};

module.exports = InheritProvider;
