var inherit = require('inherit');
var esprima = require('esprima');
var JsClass = require('../object-model/class');
var JsFunction = require('../object-model/function');
var JsFile = require('../js-file');
var JsDoc = require('../jsdoc');
var InheritProvider = require('./source/inherit-provider');
var ObjectProvider = require('./source/object-provider');
var TemplateProvider = require('./source/template-provider');
var YMProvider = require('./module-providers/ym');

/**
 * @name SourceAnalyzer
 */
module.exports = inherit({

    __constructor: function(filename) {
        this._filename = filename;
        this._source = null;
        this._members = [];
        this._tree = null;
        this._structureProviders = [
            new InheritProvider(),
            new ObjectProvider(),
            new TemplateProvider()
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
            this._members = this._members.concat(res);
        }
    },

    getMembers: function() {
        return this._members;
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


