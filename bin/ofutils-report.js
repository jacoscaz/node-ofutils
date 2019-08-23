#!/usr/bin/env node

const Table = require('tty-table');
const assert = require('assert');
const program = require('commander');
const utils = require('../lib/utils');
const timeSpentReport = require('../lib/reports/timeSpent');

// ============================================================================
//                                ARGUMENT PARSING
// ============================================================================

const supportedReportTypes = {
  'time-spent': 1,
};

const parseTypeOption = (str) => {
  assert(
    supportedReportTypes[str],
    `Unsupported report type ${str}`,
  );
  return str;
};

const supportedGroupByCriteria = {
  task: 1,
  date: 1,
  project: 1,
  worklog: 1,
};

const parseGroupByOption = (str) => {
  const criteria = str.split(',');
  criteria.forEach((criterion) => {
    assert(
      supportedGroupByCriteria[criterion],
      `Unsupported group criterion ${criterion}`,
    );
  });
  return criteria;
};

const supportedSortDirections = {
  asc: 1,
  desc: 1,
};

const parseSortOption = (str) => {
  const directions = str.split(',');
  directions.forEach((direction) => {
    assert(
      supportedSortDirections[direction],
      `Unsupported sort direction ${direction}`,
    );
  });
  return directions;
};

const parseDateOption = (str) => {
  assert(str.match(/^\d{4}-\d{2}-\d{2}$/), 'Invalid date');
  return str;
};

const toDateDefault = new Date().toISOString().split('T')[0];
const fromDateDefault = toDateDefault.slice(0, -2) + '01';

program
  .option('-t, --type <type>', 'report type', 'time-spent')
  .option('-g, --group-by <criteria>', 'grouping criteria', 'date,project,task')
  .option('-s, --sort <directions>', 'sorting directions', 'desc,asc,asc')
  .option('-f, --from <date>', 'from date', parseDateOption, fromDateDefault)
  .option('-t, --to <date>', 'to date', parseDateOption, toDateDefault)
;

program.parse(process.argv);

program.type = parseTypeOption(program.type);
program.sort = parseSortOption(program.sort);
program.groupBy = parseGroupByOption(program.groupBy);

// ============================================================================
//                              REPORT FORMATTING
// ============================================================================


const walkReport = (parent, fn, depth = 0) => {
  fn(parent, depth);
  parent.groups.forEach((child) => {
    walkReport(child, fn, depth + 1 );
  });
};

const formatters = {
  date: parent => parent.date,
  project: parent => parent.projectName,
  task: parent => parent.taskName,
  worklog: parent => parent.description || '',
};

const columnWidths = {
  date: 12,
  hours: 5,
  project: 20,
  task: null,
  worklog: null,
};

const columnAligns = {
  date: 'center',
  hours: 'center',
  project: 'left',
  task: 'left',
  worklog: 'left',
};

const render = (report) => {

  const header = [...report.groupBy, 'hours'].map((criterion) => {
    return {
      value: criterion,
      color: 'white',
      width: columnWidths[criterion] || 'auto',
      align: columnAligns[criterion] || 'left',
    };
  });

  const footer = new Array(header.length).fill('');
  footer[footer.length - 2] = 'TOTAL';
  footer[footer.length - 1] = report.total;

  const rows = [];
  const lastAtDepth = {};
  walkReport(report, (parent, depth) => {
    lastAtDepth[depth] = parent;
    if (depth > 0) {
      const row = new Array(report.groupBy.length + 1).fill(' ');
      for (let i = 1; i <= depth; i += 1) {
        row[i - 1] = formatters[report.groupBy[i - 1]](lastAtDepth[i]);
      }
      row[report.groupBy.length] = `${parent.total}`;
      rows.push(row);
    }
  });

  const table = new Table(header, rows, footer, {
    borderStyle: 1,
    borderColor: "blue",
    paddingBottom: 0,
    headerAlign: "center",
    align: "center",
    color: "white",
  });

  console.log(table.render());

};

// ============================================================================
//                              REPORT GENERATION
// ============================================================================

const generators = {
  'time-spent': timeSpentReport.generate,
};

const opts = {
  to: program.to,
  from: program.from,
  sort: program.sort,
  groupBy: program.groupBy,
};

generators[program.type](opts).then((report) => {
  render(report);
});
