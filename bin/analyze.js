#!/usr/bin/env node
var program = require('commander');
var Builder = require('../lib/builder');

program.command('report')
    .description('report scheme info')
    .option('-r, --reporter <reporter>', 'reporter (puml, dump, errors)')
    .option('-s, --scope <dir>', 'process directory')
    .option('-f, --filter <filter>')
    .option('-v, --validator <validator>')
    .action(function(args) {
        var builder = new Builder();
        builder.buildProject(process.cwd(), args.scope).then(function (project) {
            if (args.filter) {
                args.filter.split(':').forEach(function (filterStr) {
                    var filterParts = filterStr.split('=');
                    var filterName = filterParts.shift();
                    var filterValue = filterParts.shift();
                    project = require('../lib/filters/' + filterName)(project, filterValue);
                });
            }
            if (args.validator) {
                args.validator.split(':').forEach(function (validatorStr) {
                    var validatorParts = validatorStr.split('=');
                    var validatorName = validatorParts.shift();
                    var validatorValue = validatorParts.shift();
                    require('../lib/validators/' + validatorName)(project, builder.getErrorLog(), validatorValue);
                });
            }
            require('../lib/reporters/' + (args.reporter || 'dump'))(project, builder.getErrorLog());
        }).done();
    });

program.parse(process.argv);
