module.exports = require('inherit')(require('./entity'), {

    __constructor: function () {
        this.__base.apply(this, arguments);
        this._arguments = [];
    },

    addArgument: function (name, type) {
        this._arguments.push({name: name, type: type});
    },

    getArguments: function () {
        return this._arguments;
    },

    getReturnValue: function () {
        return this._returnValue;
    },

    setReturnValue: function (value) {
        this._returnValue = value;
    }

});
