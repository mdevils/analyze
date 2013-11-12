var colors = require('colors');

module.exports.formatLong = function(error, colorize) {
    var loc = error.loc;
    if (loc) {
        var lineNumber = error.loc.getStartLine() - 1;
        var lines = error.loc.getFile().getLines();
        var result = [
            renderLine(lineNumber, lines[lineNumber], true, colorize)
        ];
        var i = lineNumber - 1;
        var linesAround = 2;
        while (i >= 0 && i >= (lineNumber - linesAround)) {
            result.unshift(renderLine(i, lines[i], false, colorize));
            i--;
        }
        i = lineNumber + 1;
        while (i < lines.length && i <= (lineNumber + linesAround)) {
            result.push(renderLine(i, lines[i], false, colorize));
            i++;
        }
        result.unshift(formatErrorMessage(error.message, error.loc.getFile().getFilename(), colorize));
        return result.join('\n');
    } else {
        return formatErrorMessage(error.message, null, colorize);
    }
};

module.exports.formatShort = function(error) {
    var loc = error.loc;
    var message = error.message;
    if (loc) {
        return message + ' at ' + loc.getFile().getFilename() + ' #' + loc.getStartLine();
    } else {
        return message;
    }
};

/**
 * Formats error message header.
 *
 * @param {String} message
 * @param {String} filename
 * @param {Boolean} colorize
 * @returns {String}
 */
function formatErrorMessage(message, filename, colorize) {
    return (colorize ? colors.bold(message) : message) +
        (filename ? ' at ' + (colorize ? colors.green(filename) : filename) + ' :' : ':');
}

/**
 * Simple util for prepending spaces to the string until it fits specified size.
 *
 * @param {String} s
 * @param {Number} len
 * @returns {String}
 */
function prependSpaces(s, len) {
    while (s.length < len) {
        s = ' ' + s;
    }
    return s;
}

/**
 * Renders single line of code in style error formatted output.
 *
 * @param {Number} n line number
 * @param {String} line
 * @param {Boolean} isCurrent
 * @param {Boolean} colorize
 * @returns {String}
 */
function renderLine(n, line, isCurrent, colorize) {
    // Convert tabs to spaces, so errors in code lines with tabs as indention symbol
    // could be correctly rendered, plus it will provide less verbose output
    line = line.replace(/\t/g, ' ');

    // "n + 1" to print lines in human way (counted from 1)
    var lineNumber = prependSpaces((n + 1).toString(), 5) + ' |';
    return ' ' + (colorize ? colors.grey(lineNumber) : lineNumber) + (colorize && isCurrent ? colors.red(line) : line);
}

