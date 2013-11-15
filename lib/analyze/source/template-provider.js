var JsClass = require('../../object-model/class');
var Loc = require('../../object-model/loc');
var JsDoc = require('../../jsdoc');
var JsTemplate = require('../../object-model/template');
var EventCollector = require('../events/event-collector');
var path = require('path');

var TemplateProvider = function() {};
TemplateProvider.prototype = {
    process: function(file, errorLog) {
        var templates = [];

        var baseName = path.basename(file.getFilename());

        if (baseName.match(/\.bt\.js$/)) {
            var templateName = baseName.replace(/\.bt\.js$/, '');
            var comments = file.getTree().comments;
            for (var i = 0, l = comments.length; i < l; i++) {
                if (comments[i].type === 'Block' && comments[i].value.charAt(0) === '*') {
                    var jsdoc = JsDoc.parse(comments[i].value);
                    if (jsdoc.hasOption('param')) {
                        templates.push(JsTemplate.fromJsDoc(templateName, jsdoc));
                        break;
                    }
                }
            }
        }

        return templates;
    }
};

module.exports = TemplateProvider;
