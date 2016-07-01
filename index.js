#!/usr/bin/env node
var argv = require('yargs').argv;
var files = [];
var walk = require('walk');
var fs = require('fs');
var direcory = process.cwd();

var walker = walk.walk(direcory, {
    followLinks: false
});

var existingKeys = {};
if (argv.existing) {
    var existingFile = argv.existing;
    if (existingFile.charAt(0) == '.') {
        existingFile = existingFile.substring(1);
        existingFile = direcory + existingFile;
    }

    existingKeys = require(existingFile);
}

walker.on('file', function (root, stat, next) {
    if (stat.name.indexOf('.js.map') > -1 || root.indexOf('.meteor') > -1) {

    } else if (stat.name.indexOf('.js') > -1 || stat.name.indexOf('.html') > -1) {
        files.push(root + '/' + stat.name);
    }

    next();
});

var strings = [];
var match = /i18next\.t\(['"]([^'"]*)['"]\)/g;
if (argv.regex) {
    match = new RegExp(argv.regex, 'g');
}


var cleanStrings = [];

walker.on('end', function () {
    files.forEach(function (file) {
        var contents = fs.readFileSync(file, 'utf-8');
        var found = contents.match(match);
        if (found) {
            found.forEach(function (text) {
                var clean = text.slice(11, text.length - 2);

                if (cleanStrings.indexOf(clean) == -1 && !existingKeys[clean]) {
                    cleanStrings.push(clean);
                }
            });
        }
    });

    var translationJson = {};

    cleanStrings.forEach(function (text) {
        translationJson[text] = text;
    });

    console.log(JSON.stringify(translationJson));
});
