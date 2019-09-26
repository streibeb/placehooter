require('dotenv').config();

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var rateLimit = require('express-rate-limit');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(expressValidator({
    customValidators: {
       gte: function(param, num) {
           return param >= num;
       },
       gt: function(param, num) {
           return param > num;
       },
       lte: function(param, num) {
           return param <= num;
       },
       lt: function(param, num) {
           return param < num;
       },
    }
   }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50
  });
app.use(limiter);

require('./routes')(app);

var server = app.listen(process.env.PORT, function() {
    console.log('Server listening on %d', server.address().port);
});
