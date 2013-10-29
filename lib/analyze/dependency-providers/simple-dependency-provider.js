var Dependency = require('../../object-model/dependency');

module.exports = require('inherit')({
    process: function (project, errorLog) {
        var modules = {};
        project.getMembers().forEach(function (module) {
            modules[module.getName()] = module;
        });

        project.getMembers().forEach(function (module) {
            if (hasClasses(module)) {
                var classes = module.getMembers();
                classes.forEach(function (jsClass) {

                    if (jsClass.getExtends()) {
                        project.addDependency(new Dependency(
                            Dependency.typeInheritance,
                            jsClass.getName(),
                            jsClass.getExtends()
                        ))
                    }

                    module.getDependencies().forEach(function (depName) {
                        getEntities(depName).forEach(function (className) {
                            if (className !== jsClass.getExtends()) {
                                project.addDependency(new Dependency(
                                    Dependency.typeAssociation,
                                    jsClass.getName(),
                                    className
                                ));
                            }
                        });
                    });
                });
            }
        });

        function getEntities(moduleName) {
            var module = modules[moduleName];
            if (module && module.getMembers().length > 0) {
                return module.getMembers().map(function (jsClass) {
                    return jsClass.getName();
                });
            } else {
                return [];
            }
        }

        function hasClasses(module) {
            return module.getMembers().length > 0;
        }

    }
});
