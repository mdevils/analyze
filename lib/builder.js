var vowFs = require('vow-fs');
var vow = require('vow');
var Project = require('./object-model/project');
var Analyzer = require('./analyze/file-analyzer');
var ErrorLog = require('./analyze/error-log');
var DependencyProvider = require('./analyze/dependency-providers/simple-dependency-provider');
var ProjectConfig = require('./project-config');

module.exports = require('inherit')({

    __constructor: function () {
        this._errorLog = new ErrorLog();
    },

    buildProject: function (projectDirectory, scopes) {
        var configPath = projectDirectory + '/.analyze.js';
        var config = new ProjectConfig();
        return vowFs.exists(configPath).then(function (exists) {
            if (exists) {
                require(configPath)(config);
            }
            if (!config.getSourceRoots().length) {
                config.addSourceRoot(projectDirectory);
            }
            if (scopes) {
                config.addScopes(scopes);
            }
            if (!config.getScopes().length) {
                config.addScopes(config.getSourceRoots());
            }
            return this.build(config.getScopes());
        }.bind(this));
    },

    build: function (directories) {
        var project = new Project();
        return vow.all(directories.map(function (directory) {
            return this.buildDirectory(directory, project);
        }, this)).then(function () {
            var depProvider = new DependencyProvider();
            depProvider.process(project);
            return project;
        });
    },

    buildDirectory: function (directory, project) {
        return vowFs.listDir(directory).then(function (files) {
            return vow.all(files.map(function (filename) {
                var fullname = directory + '/' + filename;
                return vowFs.stat(fullname).then(function (stat) {
                    if (stat.isDirectory()) {
                        return this.buildDirectory(fullname, project);
                    } else {
                        if (filename.match(/.js$/g) && !filename.match(/test.js$/g)) {
                            return vowFs.read(fullname, 'utf8').then(function (data) {
                                var analyzer = new Analyzer(fullname);
                                analyzer.parse(data, this._errorLog);
                                var moduleName = filename.replace(/^([a-zA-Z0-9\-_]+)[^a-zA-Z0-9\-_].*$/, '$1');
                                var deps = [];
                                var info = analyzer.getModuleInfo();
                                if (info) {
                                    moduleName = info.name;
                                    deps = info.dependencies;
                                }
                                var jsModule = project.ensureModule(moduleName);
                                jsModule.setFilename(fullname);
                                deps.forEach(function (dep) {
                                    jsModule.addDependency(dep);
                                });
                                analyzer.getMembers().forEach(function (moduleMember) {
                                    jsModule.addMember(moduleMember);
                                });
                            }.bind(this));
                        }
                    }
                }.bind(this));
            }, this));
        }.bind(this));
    },

    getErrorLog: function () {
        return this._errorLog;
    }
});
