module.exports = require('inherit')(require('./entity'), {
    setDescription: function (description) {
        this._description = description;
    },

    getDescription: function () {
        return this._description;
    },

    type: 'event'
});
