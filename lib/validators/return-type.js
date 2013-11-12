var JsFunction = require('../object-model/function');

module.exports = function (project, errors, value) {
    var exceptionsIndex = {};
    var modifierIndex = {
        public: true,
        private: true,
        protected: true
    };
    if (value) {
        value.split(',').forEach(function (opt) {
            if (opt.charAt(0) === '-') {
                if (opt.charAt(1) === '@') {
                    delete modifierIndex[opt.substr(2)];
                } else {
                    exceptionsIndex[opt.substr(1)] = true;
                }
            }
        });
    }
    function findErrors(path, entity) {
        if (entity instanceof JsFunction && !exceptionsIndex[entity.getName()] && modifierIndex[entity.getModifier()]) {
            if (!entity.getReturnType()) {
                errors.log(
                    'No return type at ' + path.concat(entity.getName()).join('.'),
                    entity.getLoc()
                );
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
