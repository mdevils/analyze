module.exports = require('inherit')({
    __constructor: function (type, sourceClass, targetClass) {
        this._type = type;
        this._sourceClass = sourceClass;
        this._targetClass = targetClass;
    },

    getType: function () {
        return this._type;
    },

    getSourceClass: function () {
        return this._sourceClass;
    },

    getTargetClass: function () {
        return this._targetClass;
    }
}, {
    typeInheritance: 'inheritance',
    typeAssociation: 'association',
    typeAggregation: 'aggregation',
    typeComposition: 'composition'
});
