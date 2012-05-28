#!/usr/bin/env node

var express = require('express'),
  argv = require('optimist').argv,
  path = require('path'),
  port = argv._[0] || 8000;

var server = express.createServer();
server.use(express.static(path.join(__dirname, '.', 'public')));
console.log('Express server listening on port ' + port);
server.listen(port);
