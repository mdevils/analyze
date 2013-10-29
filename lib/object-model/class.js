module.exports = require('inherit')(require('./entity'), {

    setExtends: function (extend) {
        this._extends = extend;
    },

    getExtends: function () {
        return this._extends;
    }

});
