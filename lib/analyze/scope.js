module.exports = require('inherit')({
    __constructor: function (node) {
        this._variables = {};
        this._arguments = {};
    },

    addVariable: function (name, value) {
        this._variables[name] = value;
    },

    getVariables: function () {
        return this._variables;
    },

    addArgument: function (name, value) {
        this._arguments[name] = value;
    },

    getArguments: function () {
        return this._arguments;
    }
});
