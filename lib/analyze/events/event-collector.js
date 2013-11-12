var JsDoc = require('../../jsdoc');
var JsEvent = require('../../object-model/event');

module.exports = require('inherit')({
    __constructor: function (className) {
        this._events = [];
        this._className = className;
    },
    /**
     * @param {JsFile} jsFile
     */
    collect: function (jsFile) {
        var comments = jsFile.getTree().comments;
        for (var i = 0, l = comments.length; i < l; i++) {
            if (comments[i].type === 'Block' && comments[i].value.charAt(0) === '*') {
                var jsdoc = JsDoc.parse(comments[i].value);
                if (jsdoc.hasOption('event')) {
                    var eventOpt = jsdoc.selectOption('event');
                    var eventParts = eventOpt.split('#');
                    var className = eventParts.shift();
                    var eventName = eventParts.shift();
                    if (className === this._className) {
                        var event = new JsEvent(eventName, jsdoc);
                        event.setDescription(jsdoc.getDescription());
                        this._events.push(event);
                    }
                }
            }
        }
    },
    /**
     * @returns Event[]
     */
    getEvents: function () {
        return this._events;
    }
});
