var Dependency = require('../../object-model/dependency');
var JsClass = require('../../object-model/class');

module.exports = require('inherit')({
    process: function (project, errorLog) {
        var modules = {};
        project.getMembers().forEach(function (module) {
            modules[module.getName()] = module;
        });

        project.getMembers().forEach(function (module) {
            module.getMembers().forEach(function (member) {

                if (member instanceof JsClass) {
                    if (member.getExtends()) {
                        project.addDependency(new Dependency(
                            Dependency.typeInheritance,
                            member.getName(),
                            member.getExtends()
                        ))
                    }
                }

                module.getDependencies().forEach(function (depName) {
                    getEntities(depName).forEach(function (className) {
                        if (!(member instanceof JsClass) || className !== member.getExtends()) {
                            project.addDependency(new Dependency(
                                Dependency.typeAssociation,
                                member.getName(),
                                className
                            ));
                        }
                    });
                });
            });
        });

        function getEntities(moduleName) {
            var module = modules[moduleName];
            if (module && module.getMembers().length > 0) {
                return module.getMembers().map(function (member) {
                    return member.getName();
                });
            } else {
                return [];
            }
        }

    }
});
