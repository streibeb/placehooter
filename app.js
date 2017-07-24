require('dotenv').config();

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(expressValidator({}));

require('./routes')(app);

var server = app.listen(process.env.PORT, function() {
    console.log('Server listening on %d', server.address().port);
});
