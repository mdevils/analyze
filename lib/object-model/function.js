var treeIterator = require('../analyze/tree-iterator');

module.exports = require('inherit')(require('./loc-entity'), {

    __constructor: function (name, jsdoc) {
        this.__base.apply(this, arguments);
        this._arguments = [];
        this._description = undefined;
        this._modifier = 'public';
    },

    addArgument: function (name, type, info, optional, defaultValue) {
        this._arguments.push({name: name, type: type, info: info, optional: optional, defaultValue: defaultValue});
    },

    getArguments: function () {
        return this._arguments;
    },

    getReturnType: function () {
        return this._returnType;
    },

    setReturnType: function (type) {
        this._returnType = type;
    },

    getDescription: function () {
        return this._description;
    },

    setDescription: function (desc) {
        this._description = desc;
    },

    getModifier: function () {
        return this._modifier;
    },

    setModifier: function (modifier) {
        this._modifier = modifier;
    },

    isPublic: function () {
        return this._modifier === 'public';
    },

    isProtected: function () {
        return this._modifier === 'protected';
    },

    isPrivate: function () {
        return this._modifier === 'private';
    },

    type: 'function'
}, {
    fromFunctionExpression: function (name, expr, jsdoc) {
        var func = new this(name, jsdoc);
        var argNames = expr.params.map(function (param) {
            return param.name;
        });
        if (argNames) {
            var paramTypes = {};
            var paramDescs = {};
            if (jsdoc) {
                jsdoc.selectOptions('param').forEach(function (param) {
                    var paramInfo = this._parseParam(param);
                    if (paramInfo) {
                        paramTypes[paramInfo.name] = paramInfo.type;
                        paramDescs[paramInfo.name] = paramInfo.info;
                    }
                }, this);
            }
            argNames.forEach(function (argName) {
                func.addArgument(argName, paramTypes[argName], paramDescs[argName]);
            });
        }
        var returnType;
        if (jsdoc) {
            returnType = (jsdoc.selectOption('returns') || '').replace(/{|}/g, '');
        }
        if (!returnType) {
            var foundValueReturn = false;
            treeIterator.iterate(expr.body, function (node) {
                if (node && node.type === 'ReturnStatement' && node.argument) {
                    foundValueReturn = true;
                }
            }, undefined, undefined, function (node) {
                return node && node.type !== 'FunctionExpression' && node.type !== 'FunctionDeclaration';
            });
            if (!foundValueReturn) {
                returnType = 'void';
            }
        }
        func.setReturnType(returnType);
        func.setDescription(this._extractDescription(jsdoc));
        func.setModifier(this._getModifier(name, jsdoc));
        return func;
    },
    fromJsDoc: function (name, jsdoc) {
        var func = new this(name, jsdoc);
        jsdoc.selectOptions('param').forEach(function (param) {
            var paramInfo = this._parseParam(param);
            if (paramInfo) {
                func.addArgument(
                    paramInfo.name, paramInfo.type, paramInfo.info, paramInfo.optional, paramInfo.defaultValue
                );
            }
        }, this);
        func.setReturnType((jsdoc.selectOption('returns') || '').replace(/{|}/g, '') || 'void');
        func.setModifier(this._getModifier(name, jsdoc));
        func.setDescription(this._extractDescription(jsdoc));
        return func;
    },
    _parseParam: function (param) {
        var m = param.match(/{([^}]+)}\s*([\[\]\.="'a-zA-Z\$_0-9]+)\s*(.*)/);
        var argName;
        var argType;
        var argDesc;
        var argOptional;
        var argDefaultValue;
        if (m) {
            argName = m[2];
            argType = m[1];
            argDesc = m[3];
        } else {
            param = param.replace(/^\s*/g, '').replace(/\s+/g, ' ');
            var paramValue = param.split(' ');
            argName = paramValue.shift();
            argDesc = paramValue.join(' ');
        }
        if (argName.match(/^\[.*\]$/)) {
            argOptional = true;
            argName = argName.replace(/^\[|\]$/g, '');
        }
        if (argName.indexOf('=') !== -1) {
            var nameParts = argName.split('=');
            argName = nameParts.shift();
            argDefaultValue = nameParts.join('=');
        }
        if (argName.indexOf('.') === -1) {
            return {
                name: argName,
                type: argType,
                info: argDesc,
                optional: argOptional,
                defaultValue: argDefaultValue
            };
        }
    },
    _getModifier: function (name, jsdoc) {
        if (jsdoc) {
            if (jsdoc.hasOption('public')) {
                return 'public';
            }
            if (jsdoc.hasOption('protected')) {
                return 'protected';
            }
            if (jsdoc.hasOption('private')) {
                return 'private';
            }
        }
        return name.charAt(0) === '_' ? 'private' : 'public';
    },
    _extractDescription: function (jsdoc) {
        return jsdoc ? jsdoc.getDescription().replace(/\n/g, ' ').replace(/\s+/g, ' ') : undefined;
    }
});
