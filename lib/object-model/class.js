module.exports = require('inherit')(require('./loc-entity'), {

    __constructor: function () {
        this.__base.apply(this, arguments);
        this._events = [];
    },

    setExtends: function (extend) {
        this._extends = extend;
    },

    getExtends: function () {
        return this._extends;
    },

    setEvents: function (events) {
        this._events = events;
    },

    getEvents: function () {
        return this._events;
    },

    type: 'class'
});
