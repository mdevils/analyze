var messageFormat = require('./message-format');

module.exports = require('inherit')({
    __constructor: function () {
        this._log = [];
    },

    log: function (error, loc) {
        this._log.push({
            message: error,
            loc: loc
        });
    },

    hasErrors: function () {
        return this._log.length > 0;
    },

    getErrors: function () {
        return this._log;
    },

    explainErrors: function (colorize) {
        return this._log.map(function (e) {
            return messageFormat.formatLong(e, colorize);
        }, this).join('\n\n');
    },

    explainErrorsBriefly: function () {
        return this._log.map(function (e) {
            return messageFormat.formatShort(e);
        }, this).join('\n');
    }

});
