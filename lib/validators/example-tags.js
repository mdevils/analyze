var JsFunction = require('../object-model/function');

module.exports = function (project, errors) {
    function findErrors(path, entity) {
        if (entity instanceof JsFunction) {
            var jsDoc = entity.getJsDoc();
            if (jsDoc) {
                if (entity.getDescription().indexOf('```') !== -1) {
                    errors.log(
                        'There is @example tag for examples at ' + path.concat(entity.getName()).join('.'),
                        jsDoc.getLoc()
                    );
                }
            }
        }
        var subPath = path.concat();
        if (entity.getName()) {
            subPath.push(entity.getName());
        }
        entity.getMembers().forEach(findErrors.bind(this, subPath));
        entity.getStaticMembers().forEach(findErrors.bind(this, subPath));
    }
    findErrors([], project);
};
