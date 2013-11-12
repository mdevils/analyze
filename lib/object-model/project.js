var Module = require('./module.js');

module.exports = require('inherit')(require('./entity'), {

    __constructor: function () {
        this.__base.apply(this, arguments);
        this._dependencies = [];
        this._dependencyIndex = {};
    },

    addDependency: function (dependency) {
        var key = dependency.getType() + ' ' + dependency.getSourceEntityName() + ' ' + dependency.getTargetEntityName();
        if (this._dependencyIndex[key]) {
            return;
        }
        this._dependencyIndex[key] = true;
        this._dependencies.push(dependency);
    },

    getDependencies: function () {
        return this._dependencies;
    },

    ensureModule: function (name) {
        var module = this.getMember(name);
        if (!module) {
            module = new Module(name);
            this.addMember(module);
        }
        return module;
    },

    type: 'project'

});
