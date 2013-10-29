module.exports = require('inherit')({

    __constructor: function (name, jsDoc) {
        this._name = name;
        this._jsDoc = jsDoc;

        this._members = [];
        this._memberIndex = {};

        this._staticMembers = [];
        this._staticMemberIndex = {};
    },

    getName: function () {
        return this._name;
    },

    getMembers: function () {
        return this._members;
    },

    addMember: function (member) {
        this._members.push(member);
        this._memberIndex[member.getName()] = member;
    },

    getMember: function (name) {
        return this._memberIndex[name];
    },

    getStaticMembers: function () {
        return this._staticMembers;
    },

    addStaticMember: function (member) {
        this._staticMembers.push(member);
        this._staticMemberIndex[member.getName()] = member;
    },

    getStaticMember: function (name) {
        return this._staticMemberIndex[name];
    },

    getJsDoc: function () {
        return this._jsDoc;
    },

    type: 'unknown'

});
