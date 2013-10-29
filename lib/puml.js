var Dependency = require('./object-model/dependency');

module.exports = require('inherit')({

    exportToPlantUml: function (project) {
        var scheme = '@startuml\n\n';

        project.getMembers().forEach(function (module) {
            if (module.getMembers().length > 0) {
                var classes = module.getMembers();
                classes.forEach(function (jsClass) {
                    scheme += 'class ' + jsClass.getName() + '{\n';

                    var members = jsClass.getMembers().filter(function (method) {
                        return method.getName()[0] !== '_';
                    });
                    var staticMembers = jsClass.getStaticMembers().filter(function (method) {
                        return method.getName()[0] !== '_';
                    });

                    members.forEach(function (method) {
                        scheme += '\t' + method.getName() + '()\n';
                    });

                    if (members.length && staticMembers.length) {
                        scheme += '\t--\n';
                    }

                    staticMembers.forEach(function (method) {
                        scheme += '\tstatic ' + method.getName() + '()\n';
                    });
                    scheme += '}\n';
                    scheme += '\n';
                });
            }
        });
        scheme += '\n';
        project.getDependencies().forEach(function (dep) {
            scheme += dep.getSourceClass() + ' ' +
                (dep.getType() === Dependency.typeInheritance ? '--|>' : ' --> ') +
                ' ' + dep.getTargetClass() + '\n';
        });
        scheme += '\n@enduml\n';

        return scheme;
    }
});
