var generatePumlUrl = require('puml-link').generatePumlUrl;

module.exports = function (project) {
    console.log(generatePumlUrl(require('./puml/generator')(project)));
};
