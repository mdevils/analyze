module.exports = require('inherit')(require('./entity'), {

    /**
     * @returns {Loc}
     */
    getLoc: function () {
        return this._loc;
    },

    /**
     * @param {Loc} loc
     */
    setLoc: function (loc) {
        this._loc = loc;
    }

});
