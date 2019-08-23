#!/usr/bin/env node

const program = require('commander');

program
  .version('0.0.1-alpha.9')
  .command('report <report_type>', 'generate reports');

program.parse(process.argv);
