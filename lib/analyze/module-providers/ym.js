var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');

var YMProvider = function() {};
YMProvider.prototype = {
    process: function(file) {
        var result = null;
        file.iterateNodesByType('CallExpression', function(node) {
            if (node.callee.type === 'MemberExpression' &&
                node.callee.object.type === 'Identifier' &&
                node.callee.object.name === 'modules' &&
                node.callee.property.type === 'Identifier' &&
                node.callee.property.name === 'define'
            ) {
                var moduleName = node.arguments[0].value;
                result = {
                    name: moduleName,
                    dependencies: this._uniqueDeps((node.arguments[1].elements ? node.arguments[1].elements.map(function (elm) {
                        return elm.value;
                    }) : []).concat(this.buildAdditionalDeps(file, moduleName)))
                };
            }
        }.bind(this));
        return result;
    },

    _uniqueDeps: function (deps) {
        var index = {};
        deps.forEach(function (name) {
            index[name] = true;
        });
        return Object.keys(index);
    },

    buildAdditionalDeps: function (file, moduleName) {
        var yamlFile = file.getFilename().replace(/\.js$/, '.deps.yaml');
        var additionalDeps = [];
        var blockName = path.basename(file.getFilename()).replace(/^([^\.]+)\.js/, '$1').split('__').shift();
        if (fs.existsSync(yamlFile)) {
            var depData = yaml.load(fs.readFileSync(yamlFile, 'utf8'));
            if (!Array.isArray(depData)) {
                depData = [];
            }
            depData.forEach(function (item) {
                if (typeof item === 'string') {
                    item = {block: item};
                }
                if (!item.block) {
                    item.block = blockName;
                }
                var strDep = item.block + (item.elem ? '__' + item.elem : '');
                if (strDep !== moduleName) {
                    additionalDeps.push(strDep);
                }
            });
        }
        return additionalDeps;
    }
};

module.exports = YMProvider;
