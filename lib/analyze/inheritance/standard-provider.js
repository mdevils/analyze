var JsClass = require('../../object-model/class');
var JsDoc = require('../../jsdoc');
var JsFunction = require('../../object-model/function');

var StandardProvider = function() {};
StandardProvider.prototype = {
    process: function(file) {
        var classes = [];
        var functions = [];
        var classIndex = {};
        function getClassObj(className) {
            if (classIndex.hasOwnProperty(className)) {
                return classIndex[className];
            }
            var classObj = false;
            file.iterateNodesByType('FunctionDeclaration', function(subNode) {
                if (subNode.id.name === className) {
                    var jsDocNode = file.getJsDocByEndLine(subNode.loc.start.line - 1);
                    var jsDoc = null;
                    if (jsDocNode) {
                        jsDoc = JsDoc.parse(jsDocNode.value);
                        var jsDocName = jsDoc.selectOption('name');
                        if (jsDocName) {
                            className = jsDocName;
                        }
                    }
                    classObj = new JsClass(className, jsDoc);
                }
            });
            if (!classObj) {
                file.iterateNodesByType('VariableDeclarator', function(subNode) {
                    if (subNode.id.name === className) {
                        var jsDocNode = file.getJsDocByEndLine(subNode.loc.start.line - 1);
                        var jsDoc = null;
                        if (jsDocNode) {
                            jsDoc = JsDoc.parse(jsDocNode.value);
                            var jsDocName = jsDoc.selectOption('name');
                            if (jsDocName) {
                                className = jsDocName;
                            }
                        }
                        classObj = new JsClass(className, jsDoc);
                    }
                });
            }
            if (classObj) {
                classes.push(classObj);
            }
            classIndex[className] = classObj;
            return classObj;
        }
        file.iterateNodesByType('AssignmentExpression', function(node) {
            if (node.left.type === 'MemberExpression' && node.left.property.name === 'prototype') {
                if (node.left.object.type === 'Identifier' && node.right.type === 'ObjectExpression') {
                    var className = node.left.object.name;
                    var classObj = getClassObj(className);
                    if (classObj) {
                        node.right.properties.forEach(function(property) {
                            if (property.value.type === 'FunctionExpression') {
                                var jsDocNode = file.getJsDocByEndLine(property.loc.start.line - 1);
                                var jsDoc = null;
                                if (jsDocNode) {
                                    jsDoc = JsDoc.parse(jsDocNode.value);
                                }
                                var method = new JsFunction(
                                    property.key.name || property.key.value,
//                                    property.value.loc.start.line,
//                                    property.value.loc.end.line,
                                    jsDoc
                                );
                                classObj.addMember(method);
                            }
                        });
                    }
                }
            }
            if (node.right.type === 'FunctionExpression' &&
                node.left.type === 'MemberExpression' &&
                node.left.object.type === 'MemberExpression' &&
                node.left.object.property.name === 'prototype'
            ) {
                if (node.left.object.object.type === 'Identifier') {
                    var classDecl = getClassObj(node.left.object.object.name);
                    var jsDocNode = file.getJsDocByEndLine(node.loc.start.line - 1);
                    var jsDoc = null;
                    if (jsDocNode) {
                        jsDoc = JsDoc.parse(jsDocNode.value);
                    }
                    var method = new JsFunction(
                        node.left.property.name || node.left.property.value,
//                        node.loc.start.line,
//                        node.loc.end.line,
                        jsDoc
                    );
                    if (classDecl) {
                        classDecl.addMember(method);
                    }
                }
            }
        });
        file.iterateNodesByType('FunctionDeclaration', function(node) {
            var classObj = classIndex[node.id.name];
            if (!classObj) {
                var jsDocNode = file.getJsDocByEndLine(node.loc.start.line - 1);
                var jsDoc = null;
                if (jsDocNode) {
                    jsDoc = JsDoc.parse(jsDocNode.value);
                }
                if (jsDoc && jsDoc.selectOption('name')) {
                    classObj = new JsClass(jsDoc.selectOption('name'), jsDoc);
                    classes.push(classObj);
                    classIndex[classObj.getName()] = classObj;
                } else {
                    functions.push(new JsFunction(
                        node.id.name,
//                        node.loc.start.line,
//                        node.loc.end.line,
                        jsDoc
                    ));
                }
            }
        });
        file.iterateNodesByType('AssignmentExpression', function(node) {
            if (node.left.type === 'MemberExpression' &&
                node.left.object.type === 'Identifier' &&
                node.right.type === 'FunctionExpression'
            ) {
                var classObj = getClassObj(node.left.object.name);
                if (classObj) {
                    var jsDocNode = file.getJsDocByEndLine(node.loc.start.line - 1);
                    var jsDoc = null;
                    if (jsDocNode) {
                        jsDoc = JsDoc.parse(jsDocNode.value);
                    }
                    var method = new JsFunction(
                        node.left.property.name || node.left.property.value,
//                        node.loc.start.line,
//                        node.loc.end.line,
                        jsDoc
                    );
//                    method.setStatic(true);
                    classObj.addStaticMember(method);
                }
            }
        });
        return {
            classes: classes,
            functions: functions
        }
    }
};

module.exports = StandardProvider;
