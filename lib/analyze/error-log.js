module.exports = require('inherit')({
    __constructor: function () {
        this._log = [];
    },

    log: function (error) {
        this._log.push(error);
    },

    report: function () {
        if (this._log.length) {
            console.error(this._log.join('\n'));
        }
    }
});
