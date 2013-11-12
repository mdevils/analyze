var Module = require('../object-model/module');
var Project = require('../object-model/project');

module.exports = function (project, entityName) {
    var resProject = new Project();
    var depsMap = {};
    var acceptedEntities = {};
    acceptedEntities[entityName] = true;
    project.getDependencies().forEach(function (dep) {
        var dest = dep.getTargetEntityName();
        (depsMap[dest] || (depsMap[dest] = [])).push(dep.getSourceEntityName());
    });
    function acceptDeps(className) {
        acceptedEntities[className] = true;
        var deps = depsMap[className];
        if (deps) {
            deps.forEach(function (soourceClass) {
                acceptDeps(soourceClass);
            });
        }
    }
    acceptDeps(entityName);
    project.getMembers().forEach(function (module) {
        var resModule = new Module(module.getName());
        resModule.setFilename(module.getFilename());
        module.getDependencies().forEach(function (dep) {
            resModule.addDependency(dep);
        });
        module.getMembers().forEach(function (member) {
            if (acceptedEntities[member.getName()]) {
                resModule.addMember(member);
            }
        });
        resProject.addMember(resModule);
    });
    project.getDependencies().forEach(function (dep) {
        if (acceptedEntities[dep.getTargetEntityName()]) {
            resProject.addDependency(dep);
        }
    });
    return resProject;
};
