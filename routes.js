var path = require('path');
var Promise = require("bluebird");
var fs = require('fs');
Promise.promisifyAll(fs);
var _ = require('lodash');

var generated_dir = path.join(__dirname, 'public', 'img');
var source_dir = path.join(__dirname, 'public', 'img', 'src');

module.exports = function (app) {
    app.get('/:width', function(req, res) {
        console.log(req.params.width);
    });

    app.get('/:width/:height', function(req, res) {
        fs.readdir(generated_dir, function(err, files) {
            if (err) return res.status(400);

            var filename = req.params.width + "x" + req.params.height + ".jpg";
            console.log(filename);

            var file = _.find(files, filename);
            if (file) {
                console.log('File exists');
                res.sendFile(path.join(generated_dir, file));
            } else {
                fs.readdir(source_dir, function(err, files) {
                    if (err) return res.status(400);

                    var file = _.sample(files);
                    res.sendFile(path.join(source_dir, file));
                });
            }
        });
    });

    app.get('/', function(req, res) {
        res.sendFile(path.resolve(__dirname, '/index.html'));
    });
};