#!/usr/bin/env node
var program = require('commander');
var Builder = require('../lib/builder');
var PlantUml = require('../lib/puml');

program.command('puml')
    .description('build PlantUML')
    .option('--scope <dir>', 'process directory')
    .action(function() {
        var builder = new Builder();
        builder.buildProject(process.cwd(), args.scope).then(function (project) {
            var plantUml = new PlantUml();
            console.log(plantUml.exportToPlantUml(project));
        }).done();
    });

program.command('validate')
    .option('--scope <dir>', 'process directory')
    .action(function(args) {
        var builder = new Builder();
        builder.buildProject(process.cwd(), args.scope).then(function () {
            builder.getErrorLog().report();
        }).done();
    });

program.parse(process.argv);
