#!/usr/bin/env node

var Prog = require('./Prog');
var program = require('commander');

/*program
.version('0.0.1');

program
.command('export')
.description('index document into elasticsearch')
.option('-r', '--reset', 'reset index')
.action(function(){
	var prog = new Prog(program.reset);
});

program.parse(process.argv);*/

program
  .version('0.0.1')
  .option('-r, --reset', 'Reset index')
  .parse(process.argv);

if(program.reset) new Prog({'reset':program.reset});
else new Prog();