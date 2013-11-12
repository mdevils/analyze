var JsClass = require('../../object-model/class');
var Loc = require('../../object-model/loc');
var JsDoc = require('../../jsdoc');
var JsFunction = require('../../object-model/function');
var EventCollector = require('../events/event-collector');

var InheritProvider = function() {};
InheritProvider.prototype = {
    process: function(file, errorLog) {
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
                        jsDoc = JsDoc.parse(jsDocNode.value, Loc.fromNode(file, jsDocNode));
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
                        var eventCollector = new EventCollector(className);
                        eventCollector.collect(file);
                        classObj.setEvents(eventCollector.getEvents());
                        var isStatic = false;
                        var extToken = node.arguments[0];
                        classObj.setLoc(Loc.fromNode(file, node));
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
                                            jsDoc = JsDoc.parse(jsDocNode.value, Loc.fromNode(file, jsDocNode));
                                        }
                                        var method = JsFunction.fromFunctionExpression(
                                            property.key.name || property.key.value,
                                            property.value,
                                            jsDoc
                                        );
                                        method.setLoc(Loc.fromNode(file, property.value));
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
                    } else {
                        errorLog.log('Could not extract class name at ' + file.getFilename());
                    }
                }
            });
        }
        return classes;
    }
};

module.exports = InheritProvider;
