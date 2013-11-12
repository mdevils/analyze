var JsClass = require('../../object-model/class');
var JsObject = require('../../object-model/object');
var JsFunction = require('../../object-model/function');
var Dependency = require('../../object-model/dependency');

module.exports = function (project) {
    var scheme = '@startuml\n\n';

    project.getMembers().forEach(function (module) {
        module.getMembers().forEach(function (moduleMember) {
            if (moduleMember instanceof JsClass) {
                scheme += 'class ' + moduleMember.getName() + ' {\n';

                moduleMember.getEvents().forEach(function (event) {
                    scheme += '\t~' + event.getName() + '\n';
                });

                var members = moduleMember.getMembers().filter(function (method) {
                    return method.isPublic();
                });
                var staticMembers = moduleMember.getStaticMembers().filter(function (method) {
                    return method.isPublic();
                });

                members.forEach(function (method) {
                    scheme += '\t+' + method.getName() + '()\n';
                });

                staticMembers.forEach(function (method) {
                    scheme += '\t+{static} ' + method.getName() + '()\n';
                });

                scheme += '}\n';
                scheme += '\n';
            } else if (moduleMember instanceof JsObject) {
                scheme += 'class ' + moduleMember.getName() + ' << (O,#ffbb77) >> {\n';
                scheme += moduleMember.getMembers().filter(function (member) {
                    return !(member instanceof JsFunction) || member.isPublic();
                }).map(function (member) {
                    if (member instanceof JsFunction) {
                        return '\t+' + member.getName() + '()';
                    } else {
                        return '\t+' + member.getName();
                    }
                }).join('\n');
                scheme += '\n}\n';
            } else if (moduleMember instanceof JsFunction) {
                scheme += 'class ' + moduleMember.getName() + ' << (F,lightblue) >>\n';
            }
        });
    });
    scheme += '\n';
    project.getDependencies().forEach(function (dep) {
        scheme += dep.getSourceEntityName() + ' ' +
            (dep.getType() === Dependency.typeInheritance ? '--|>' : ' --> ') +
            ' ' + dep.getTargetEntityName() + '\n';
    });
    scheme += '\n@enduml\n';

    return scheme;
};
