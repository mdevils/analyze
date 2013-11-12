var JsFunction = require('../object-model/function');

module.exports = function (project, errors, value) {
    var forceMethodName = {};
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
                }
            } else if (opt.charAt(0) === '+') {
                forceMethodName[opt.substr(1)] = true;
            }
        });
    }
    function findErrors(path, entity) {
        if (entity instanceof JsFunction &&
            (modifierIndex[entity.getModifier()] || forceMethodName[entity.getName()])
        ) {
            var args = entity.getArguments();
            for (var i = 0, l = args.length; i < l; i++) {
                var arg = args[i];
                if (!arg.type) {
                    errors.log(
                        'No param type for "' + arg.name + '" at ' + path.concat(entity.getName()).join('.'),
                        entity.getLoc()
                    );
                    break;
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
