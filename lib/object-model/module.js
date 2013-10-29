module.exports = require('inherit')(require('./entity'), {

    __constructor: function () {
        this.__base.apply(this, arguments);
        this._dependencies = {};
        this._filename = null;
    },

    getModuleValue: function () {
        return this._moduleValue;
    },

    setModuleValue: function (value) {
        this._moduleValue = value;
    },

    getDependencies: function () {
        return Object.keys(this._dependencies);
    },

    addDependency: function (name) {
        this._dependencies[name] = true;
    },

    setFilename: function (filename) {
        this._filename = filename;
    },

    getFilename: function () {
        return this._filename;
    },

    type: 'module'

});
