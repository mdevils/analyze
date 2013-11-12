var Module = require('../object-model/module');
var Project = require('../object-model/project');

module.exports = function (project, entityName) {
    var resProject = new Project();
    var sourceMap = {};
    var targetMap = {};
    var acceptedSourceEntities = {};
    var acceptedTargetEntities = {};
    acceptedSourceEntities[entityName] = true;
    project.getDependencies().forEach(function (dep) {
        var src = dep.getSourceEntityName();
        var dest = dep.getTargetEntityName();
        (sourceMap[src] || (sourceMap[src] = [])).push(dest);
        (targetMap[dest] || (targetMap[dest] = [])).push(src);
    });
    function acceptSourceDeps(className) {
        acceptedSourceEntities[className] = true;
        var deps = sourceMap[className];
        if (deps) {
            deps.forEach(function (targetClass) {
                acceptSourceDeps(targetClass);
            });
        }
    }
    function acceptTargetDeps(className) {
        acceptedTargetEntities[className] = true;
        var deps = targetMap[className];
        if (deps) {
            deps.forEach(function (soourceClass) {
                acceptTargetDeps(soourceClass);
            });
        }
    }
    acceptSourceDeps(entityName);
    acceptTargetDeps(entityName);
    project.getMembers().forEach(function (module) {
        var resModule = new Module(module.getName());
        resModule.setFilename(module.getFilename());
        module.getDependencies().forEach(function (dep) {
            resModule.addDependency(dep);
        });
        module.getMembers().forEach(function (member) {
            if (acceptedSourceEntities[member.getName()] || acceptedTargetEntities[member.getName()]) {
                resModule.addMember(member);
            }
        });
        resProject.addMember(resModule);
    });
    project.getDependencies().forEach(function (dep) {
        if (acceptedSourceEntities[dep.getSourceEntityName()] || acceptedTargetEntities[dep.getTargetEntityName()]) {
            resProject.addDependency(dep);
        }
    });
    return resProject;
};
