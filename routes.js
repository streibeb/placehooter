var path = require('path');
var Promise = require("bluebird");
var fs = require('fs');
Promise.promisifyAll(fs);
var _ = require('lodash');
var im = require('imagemagick');
Promise.promisifyAll(im);

var GENERATED_DIR = path.join(__dirname, 'img');
var SOURCE_DIR = path.join(__dirname, 'img', 'src');

module.exports = function (app) {
    app.get('/:width', function(req, res) {
        var filename = req.params.width + "x" + req.params.width + ".jpg";
        var generatedPath = path.resolve(GENERATED_DIR, filename);

        if (fs.existsSync(generatedPath)) {
            res.sendFile(generatedPath);
        } else {
            fs.readdir(SOURCE_DIR, function(err, files) {
                if (err) return res.status(400);

                var file = _.sample(files);
                var sourcePath = path.resolve(SOURCE_DIR, file);
                im.resize({
                    srcPath: sourcePath,
                    dstPath: generatedPath,
                    width:   req.params.width,
                    height:   req.params.width
                }, function(err, stdout, stderr){
                    if (err) throw err;

                    im.identify(generatedPath, function(err, features){
                        if (err) throw err;
                        console.log(features);
                    });

                    res.sendFile(generatedPath);
                });


            });
        }
    });

    app.get('/:width/:height', function(req, res) {
        var width = req.params.width;
        var height = req.params.height;
        var filename = width + "x" + height + ".jpg";
        var generatedPath = path.resolve(GENERATED_DIR, filename);

        if (fs.existsSync(generatedPath)) {
            res.sendFile(generatedPath);
        } else {
            fs.readdir(SOURCE_DIR, function(err, files) {
                if (err) return res.status(400);

                files = _.filter(files, function(o) {
                    return o.endsWith('.jpg');
                });

                var file = _.sample(files);
                var sourcePath = path.resolve(SOURCE_DIR, file);
                var options = {
                    srcPath: sourcePath,
                    dstPath: generatedPath
                };

                if (width > height) {
                    options.width = width;
                } else {
                    options.height = height;
                }

                im.resize(options, function(err, stdout, stderr) {
                    if (err) throw err;

                    im.crop({
                        srcPath: generatedPath,
                        dstPath: generatedPath,
                        width: width,
                        height: height
                    }, function(err, stdout, stderr){
                        if (err) throw err;

                        res.sendFile(generatedPath);
                    });
                });
            });
        }
    });

    app.get('/', function(req, res) {
        res.sendFile(path.resolve(__dirname, '/index.html'));
    });
};