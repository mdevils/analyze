/**
 * @name Loc
 */
module.exports = require('inherit')({
    __constructor: function (file, startLine, endLine) {
        this._file = file;
        this._startLine = startLine;
        this._endLine = endLine;
    },

    getFile: function () {
        return this._file;
    },

    getStartLine: function () {
        return this._startLine;
    },

    getEndLine: function () {
        return this._endLine;
    }
}, {
    fromNode: function (file, node) {
        return new this(file, node.loc.start.line, node.loc.end.line);
    }
});
