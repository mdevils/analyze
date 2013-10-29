module.exports = require('inherit')({

    __constructor: function () {
        this._sourceRoots = [];
        this._scopes = [];
    },

    addSourceRoot: function (sourceRoot) {
        this._sourceRoots.push(sourceRoot);
    },

    getSourceRoots: function () {
        return this._sourceRoots;
    },

    addScope: function (scope) {
        this._scopes.push(scope);
    },

    addScopes: function (scopes) {
        this._scopes = this._scopes.concat(scopes);
    },

    getScopes: function () {
        return this._scopes;
    }
});
