#!/usr/bin/env node

const package = require('../package.json');
const program = require('commander');

program
  .version(package.version)
  .command('report <report_type>', 'generate reports')
;

program.parse(process.argv);
