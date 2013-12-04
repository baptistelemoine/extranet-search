#!/usr/bin/env node

var Prog = require('./Prog');
var program = require('commander');

program
.version('0.0.1');

program
.command('export')
.description('index document into elasticsearch')
.action(function(){
	var prog = new Prog();
});

program.parse(process.argv);

