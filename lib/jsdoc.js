function JsDoc() {
    this._description = '';
    this._options = [];
}

JsDoc.prototype = {

    getDescription: function() {
        return this._description;
    },

    setDescription: function(description) {
        this._description = description;
    },

    hasOption: function (name) {
        var options = this._options;
        for (var i = 0, l = options.length; i < l; i++) {
            if (options[i].name === name) {
                return true;
            }
        }
        return false;
    },

    addOption: function(name, value) {
        this._options.push({name: name, value: value});
    },

    getOptions: function() {
        return this._options;
    },

    selectOption: function(name) {
        var options = this._options;
        for (var i = 0, l = options.length; i < l; i++) {
            if (options[i].name === name) {
                return options[i].value;
            }
        }
        return undefined;
    },

    selectOptions: function(name) {
        var result = [];
        var options = this._options;
        for (var i = 0, l = options.length; i < l; i++) {
            if (options[i].name === name) {
                result.push(options[i].value);
            }
        }
        return result;
    },

    toJSON: function() {
        return {
            description: this._description,
            options: this._options
        };
    },

    /**
     * @returns {Loc}
     */
    getLoc: function () {
        return this._loc;
    },

    /**
     * @param {Loc} loc
     */
    setLoc: function (loc) {
        this._loc = loc;
    }
};

JsDoc.parse = function(str, loc) {
    var result = new JsDoc();
    result.setLoc(loc);

    var lines = str.split('\n').map(function(line) {
        return line.replace(/^\s*\*( )?/, '');
    });
    var description = [];
    var line = lines.shift();
    while (line !== undefined && !line.match(/\s*@([a-zA-Z]+)/)) {
        description.push(line);
        line = lines.shift();
    }
    result.setDescription(description.join('\n').trim());

    while (line !== undefined && line.match(/\s*@([a-zA-Z]+)/)) {
        var lineBits = line.trim().split(' ');
        var optName = lineBits[0].substr(1);
        var optValue = [lineBits.slice(1).join(' ')];
        line = lines.shift();
        while (line !== undefined && !line.match(/\s*@([a-zA-Z]+)/)) {
            optValue.push(line);
            line = lines.shift();
        }
        result.addOption(optName, optValue.join('\n').trim());
    }
    return result;
};

module.exports = JsDoc;

