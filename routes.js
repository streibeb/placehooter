var path = require('path');
var Promise = require("bluebird");
var fs = require('fs');
Promise.promisifyAll(fs);
var _ = require('lodash');
var im = require('imagemagick');
Promise.promisifyAll(im);

var GENERATED_DIR = path.join(__dirname, 'img');
var SOURCE_DIR = path.join(__dirname, 'img', 'src');

function generateImage(width, height, generatedPath, next) {
    fs.readdir(SOURCE_DIR, function(err, files) {
        if (err) return res.status(400);

        files = _.filter(files, function(o) {
            return o.endsWith('.jpg');
        });

        var file = _.sample(files);
        var sourcePath = path.resolve(SOURCE_DIR, file);
        var options = {
            srcPath: sourcePath,
            dstPath: generatedPath,
            quality: 85,
            format: 'jpg',
            sharpening: 0.5
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

                next();
            });
        });
    });
}

module.exports = function (app) {
    app.get('/:width', function(req, res) {
        req.checkParams('width', 'Must be an integer less than 5000').notEmpty().isInt().lte(5000);

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.status(400).send(result.array());
                return;
            }

            var width = req.params.width;
            var filename = width + "x" + width + ".jpg";
            var generatedPath = path.resolve(GENERATED_DIR, filename);

            if (fs.existsSync(generatedPath)) {
                res.sendFile(generatedPath);
            } else {
                generateImage(width, width, generatedPath, function() {
                    res.sendFile(generatedPath);
                });
            }
        });
    });

    app.get('/:width/:height', function(req, res) {
        req.checkParams('width', 'Must be an integer less than 5000').notEmpty().isInt().lte(5000);
        req.checkParams('height', 'Must be an integer less than 5000').notEmpty().isInt().lte(5000);

        req.getValidationResult().then(function(result) {
            if (!result.isEmpty()) {
                res.status(400).send(result.array());
                return;
            }

            var width = req.params.width;
            var height = req.params.height;
            var filename = width + "x" + height + ".jpg";
            var generatedPath = path.resolve(GENERATED_DIR, filename);

            if (fs.existsSync(generatedPath)) {
                res.sendFile(generatedPath);
            } else {
                generateImage(width, height, generatedPath, function () {
                    res.sendFile(generatedPath);
                });
            }
        });
    });

    app.get('/', function(req, res) {
        res.sendFile(path.resolve(__dirname, '/index.html'));
    });
};