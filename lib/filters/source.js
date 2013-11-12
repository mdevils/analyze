var Module = require('../object-model/module');
var Project = require('../object-model/project');

module.exports = function (project, entityName) {
    var resProject = new Project();
    var depsMap = {};
    var acceptedEntities = {};
    acceptedEntities[entityName] = true;
    project.getDependencies().forEach(function (dep) {
        var src = dep.getSourceEntityName();
        (depsMap[src] || (depsMap[src] = [])).push(dep.getTargetEntityName());
    });
    function acceptDeps(className) {
        acceptedEntities[className] = true;
        var deps = depsMap[className];
        if (deps) {
            deps.forEach(function (targetClass) {
                acceptDeps(targetClass);
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
        if (acceptedEntities[dep.getSourceEntityName()]) {
            resProject.addDependency(dep);
        }
    });
    return resProject;
};
