#!/usr/bin/env node
var program = require('commander');
var Builder = require('../lib/builder');
var PlantUml = require('../lib/puml');

program.command('puml')
    .description('build PlantUML')
    .action(function() {
        var builder = new Builder();
        builder.buildProject(process.cwd()).then(function (project) {
            var plantUml = new PlantUml();
            console.log(plantUml.exportToPlantUml(project));
        }).done();
    });

program.parse(process.argv);
