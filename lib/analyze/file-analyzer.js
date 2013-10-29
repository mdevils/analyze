var inherit = require('inherit');
var esprima = require('esprima');
var JsClass = require('../object-model/class');
var JsFunction = require('../object-model/function');
var JsFile = require('../js-file');
var JsDoc = require('../jsdoc');
var InheritProvider = require('./inheritance/inherit-provider');
var StandardProvider = require('./inheritance/standard-provider');
var YMProvider = require('./module-providers/ym');

/**
 * @name SourceAnalyzer
 */
module.exports = inherit({

    __constructor: function(filename) {
        this._filename = filename;
        this._source = null;
        this._classes = [];
        this._functions = [];
        this._tree = null;
        this._structureProviders = [
            new InheritProvider(),
            new StandardProvider()
        ];
        this._moduleProviders = [
            new YMProvider()
        ];
        this._moduleInfo = null;
    },

    parse: function(str, errorLog) {
        this._source = str;
        this._tree = esprima.parse(str, {loc: true, range: true, comment: true, tokens: true});
        var file = new JsFile(str, this._tree, this._filename);
        for (i = 0, l = this._moduleProviders.length; i < l; i++) {
            this._moduleInfo = this._moduleProviders[i].process(file, errorLog);
            if (this._moduleInfo) {
                break;
            }
        }

        for (var i = 0, l = this._structureProviders.length; i < l; i++) {
            var provider = this._structureProviders[i];
            var res = provider.process(file, errorLog);
            this._classes = this._classes.concat(res.classes);
            this._functions = this._functions.concat(res.functions);
        }
    },

    getClasses: function() {
        return this._classes;
    },

    getFunctions: function() {
        return this._functions;
    },

    getModuleInfo: function () {
        return this._moduleInfo;
    },

    getFilename: function () {
        return this._filename;
    },

    toJSON: function() {
        return {
            classes: this._classes,
            functions: this._functions
        };
    }

});


