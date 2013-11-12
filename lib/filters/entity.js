var Module = require('../object-model/module');
var Project = require('../object-model/project');

module.exports = function (project, value) {
    var resProject = new Project();
    var acceptedTypes = {};
    value.split(',').forEach(function (v) {
        acceptedTypes[v] = true;
    });
    var entityNamesToRemove = {};
    project.getMembers().forEach(function (module) {
        var resModule = new Module(module.getName());
        resModule.setFilename(module.getFilename());
        module.getDependencies().forEach(function (dep) {
            resModule.addDependency(dep);
        });
        module.getMembers().forEach(function (member) {
            if (!acceptedTypes[member.type]) {
                entityNamesToRemove[member.getName()] = true;
            } else {
                resModule.addMember(member);
            }
        });
        resProject.addMember(resModule);
    });
    project.getDependencies().forEach(function (dep) {
        if (!entityNamesToRemove[dep.getSourceEntityName()] && !entityNamesToRemove[dep.getTargetEntityName()]) {
            resProject.addDependency(dep);
        }
    });
    return resProject;
};
