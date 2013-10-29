var JsFile = function(source, tree, filename) {
    this._source = source;
    this._tree = tree;
    this._lines = source.split('\n');
    this._tokenIndex = null;
    this._filename = filename;
    var index = this._index = {};
    this.iterate(function(node, parentNode, parentCollection) {
        if (node) {
            var type = node.type;
            if (type) {
                node.parentNode = parentNode;
                node.parentCollection = parentCollection;
                (index[type] || (index[type] = [])).push(node);
            }
        }
    });
};

JsFile.prototype = {
    _buildTokenIndex: function() {
        var tokens = this._tree.tokens;
        var tokenIndex = {};
        for (var i = 0, l = tokens.length; i < l; i++) {
            tokenIndex[tokens[i].range[0]] = i;
        }
        this._tokenIndex = tokenIndex;
    },
    getTokenPosByRangeStart: function(start) {
        if (!this._tokenIndex) {
            this._buildTokenIndex();
        }
        return this._tokenIndex[start];
    },
    iterate: function(cb) {
        return iterateSourceTree(this._tree, cb);
    },
    getNodesByType: function(type) {
        if (typeof type === 'string') {
            return this._index[type] || [];
        } else {
            var result = [];
            for (var i = 0, l = type.length; i < l; i++) {
                var nodes = this._index[type[i]];
                if (nodes) {
                    result = result.concat(nodes);
                }
            }
            return result;
        }
    },
    iterateNodesByType: function(type, cb) {
        return this.getNodesByType(type).forEach(cb);
    },
    getSource: function() {
        return this._source;
    },
    getTree: function() {
        return this._tree;
    },
    getTokens: function() {
        return this._tree.tokens;
    },
    getComments: function() {
        return this._tree.comments;
    },
    getJsDocByEndLine: function(line) {
        var comments = this._tree.comments;
        for (var i = 0, l = comments.length; i < l; i++) {
            if (comments[i].loc.end.line === line || comments[i].loc.end.line === line - 1) {
                return comments[i];
            }
        }
        return null;
    },
    getLines: function() {
        return this._lines;
    },
    getFilename: function () {
        return this._filename;
    }
};

module.exports = JsFile;


var iterableProperties = {
    'body': true,
    'expression': true,

    // if
    'test': true,
    'consequent': true,
    'alternate': true,

    'object': true,

    //switch
    'discriminant': true,
    'cases': true,

    // return
    'argument': true,
    'arguments': true,

    // catch
    'handler': true,

    // for
    'init': true,
    'update': true,

    // for in
    'left': true,
    'right': true,

    // var
    'declarations': true,

    // array
    'elements': true,

    // object
    'properties': true,
    'key': true,
    'value': true,

    // new
    'callee': true,

    // xxx.yyy
    'property': true
};

function iterateSourceTree(node, cb, parentNode, parentCollection) {
    cb(node, parentNode, parentCollection);
    for (var propName in node) {
        if (node.hasOwnProperty(propName)) {
            if (iterableProperties[propName]) {
                var contents = node[propName];
                if (typeof contents === 'object') {
                    if (Array.isArray(contents)) {
                        for (var i = 0, l = contents.length; i < l; i++) {
                            iterateSourceTree(contents[i], cb, node, contents);
                        }
                    } else {
                        iterateSourceTree(contents, cb, node, [ contents ]);
                    }
                }
            }
        }
    }
}
