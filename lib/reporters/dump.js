var JsClass = require('../object-model/class');
var JsObject = require('../object-model/object');
var JsFunction = require('../object-model/function');
var JsTemplate = require('../object-model/template');

module.exports = function (project) {
    var text = '';

    function repeat(s, n) {
        var ret = '';
        for (var i = 0; i < n; i++) {
            ret += s;
        }
        return ret;
    }

    function dumpObject(obj, level) {
        var res = '';
        level = level || 0;
        var indent = repeat('\t', level);
        res += indent + 'object ' + obj.getName() + ' {';
        obj.getMembers().forEach(function (subObj) {
            if (subObj instanceof JsFunction) {
                res += '\n' + dumpFuncDecl(subObj, level + 1);
            } else if (subObj instanceof JsObject) {
                res += '\n' + dumpObject(subObj, level + 1);
            }
        });
        res += indent + '}\n';
        return res;
    }

    function dumpFuncDecl(method, level, isStatic) {
        var indent = repeat('\t', level);
        var ret = method.getReturnType();
        var desc = (isStatic ? 'static ' : '') +
            (method.isProtected() ? 'protected ' : '') +
            (ret ? ret : '*') + ' ' + method.getName() +
            '(' + method.getArguments().map(
                function (arg) {
                    return (arg.type || '*') + ' ' + arg.name;
                }
            ).join(', ') + ')' +
            ' {}';
        var res = '';
        if (method.getDescription()) {
            res += indent + '// ' + method.getDescription() + '\n';
        }
        res += indent + desc + '\n';
        return res;
    }

    project.getMembers().forEach(function (module) {
        module.getMembers().forEach(function (moduleMember) {
            if (moduleMember instanceof JsClass) {
                text += 'class ' + moduleMember.getName() +
                    (moduleMember.getExtends() ? ' extends ' +  moduleMember.getExtends() : '') +
                    ' {';

                moduleMember.getEvents().forEach(function (event) {
                    if (event.getDescription()) {
                        text += '\n\t// ' + event.getDescription();
                    }
                    text += '\n\tevent ' + event.getName() + ';\n';
                });

                moduleMember.getMembers().forEach(function (method) {
                    if (!method.isPrivate()) {
                        text += '\n' + dumpFuncDecl(method, 1, false);
                    }
                });

                moduleMember.getStaticMembers().forEach(function (method) {
                    if (!method.isPrivate()) {
                        text += '\n' + dumpFuncDecl(method, 1, true);
                    }
                });

                text += '}\n\n';
            } else if (moduleMember instanceof JsObject) {
                text += dumpObject(moduleMember) + '\n';
            } else if (moduleMember instanceof JsTemplate) {
                text += 'template ' + moduleMember.getName() + ' {\n';
                text += moduleMember.getArguments().map(
                    function (arg) {
                        return '\t' + (arg.type || '*') + ' ' + arg.name;
                    }
                ).join('\n');
                text += '\n}\n\n';
            } else if (moduleMember instanceof JsFunction) {
                text += dumpFuncDecl(moduleMember, 0, false) + '\n';
            }
        });
    });

    console.log(text);
};
