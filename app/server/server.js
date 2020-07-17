var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/users', usersRouter);

// serve client
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = app;
