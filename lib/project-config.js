module.exports = require('inherit')({

    __constructor: function () {
        this._sourceRoots = [];
    },

    addSourceRoot: function (sourceRoot) {
        this._sourceRoots.push(sourceRoot);
    },

    getSourceRoots: function () {
        return this._sourceRoots;
    }
});
