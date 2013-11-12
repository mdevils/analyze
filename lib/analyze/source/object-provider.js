var Loc = require('../../object-model/loc');
var JsDoc = require('../../jsdoc');
var JsFunction = require('../../object-model/function');
var JsObject = require('../../object-model/object');

/**
 * Провайдер функций, экспортируемых из модуля.
 *
 * @constructor
 */
var FlatModuleProvider = function() {};
FlatModuleProvider.prototype = {
    process: function(file) {
        var objects = [];
        var objectIndex = {};

        file.getComments().forEach(function (comment) {
            if (comment.type === 'Block' && comment.value.charAt(0) === '*') {
                var loc = Loc.fromNode(file, comment);
                var jsdoc = JsDoc.parse(comment.value, loc);
                var params = jsdoc.selectOptions('param');
                var returns = jsdoc.selectOption('returns');
                var name = jsdoc.selectOption('name');
                if (name && (params.length > 0 || returns)) {
                    var nameParts = name.split('.');
                    var funcName = nameParts.pop();
                    var prefix = nameParts.join('.');
                    var func = JsFunction.fromJsDoc(funcName, jsdoc);
                    func.setLoc(loc);
                    if (prefix) {
                        if (!objectIndex[prefix]) {
                            var namePart = nameParts.shift(),
                                destObj;
                            if (!objectIndex[namePart]) {
                                destObj = new JsObject(namePart);
                                objects.push(destObj);
                                objectIndex[namePart] = destObj;
                            }
                            destObj = objectIndex[namePart];
                            namePart = nameParts.shift();
                            while (namePart) {
                                var subObj = destObj.getMember(namePart);
                                if (!subObj) {
                                    subObj = new JsObject(namePart);
                                    destObj.addMember(subObj)
                                }
                                destObj = subObj;
                                namePart = nameParts.shift();
                            }
                            objectIndex[prefix] = destObj;
                        }
                        objectIndex[prefix].addMember(func);
                    } else {
                        objects.push(func);
                    }
                }
            }
        });

        return objects;
    }
};

module.exports = FlatModuleProvider;
