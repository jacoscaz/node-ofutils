#!/usr/bin/env node

const assert = require('assert');
const program = require('commander');
const blessed = require('blessed');
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

const screen = blessed.screen({
  smartCSR: true,
  dockBorders: true,
});

screen.title = 'Time Spent Report';

const header = blessed.text({
  parent: screen,
  top: 0,
  left: 0,
  tags: true,
  width: '100%',
  height: 1,
  content: '',
  align: 'center',
  valign: 'middle',
  style: {
    bg: 'blue',
    fg: 'white',
    border: {
      fg: 'white',
    }
  }
});

const box = blessed.box({
  parent: screen,
  top: 1,
  left: 0,
  width: '100%',
  height: '100%-1',
  scrollable: true,
  alwaysScroll: true,
  style: {
    scrollbar: {
      bg: 'red',
      fg: 'blue'
    }
  },
});

const table = blessed.table({
  parent: box,
  width: '100%',
  noCellBorders: false,
  fillCellBorders: false,
  border: {
    type: 'line'
  },
  style: {
    border: {
      fg: 'white',
    },
    cell: {
      // bg: 'magenta',
    },
    header: {
      // bg: 'yellow',
      bold: true,
    }
  }
});

screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  return process.exit(0);
});

screen.key(['down'], (ch, key) => {
  box.scroll(1);
  box.parent.render();
});

screen.key(['up'], (ch, key) => {
  box.scroll(-1);
  box.parent.render();
});

screen.key(['pagedown'], (ch, key) => {
  box.scroll(1 * (box.height - 1));
  box.parent.render();
});

screen.key(['pageup'], (ch, key) => {
  box.scroll(-1 * (box.height - 1));
  box.parent.render();
});

table.focus();

screen.render();

const walkReport = (parent, fn, depth = 0) => {
  fn(parent, depth);
  parent.groups.forEach((child) => {
    walkReport(child, fn, depth + 1 );
  });
};

const formatters = {
  task: parent => parent.taskName,
  date: parent => parent.date,
  project: parent => parent.projectName,
};

const update = (report) => {
  header.setContent(`Time Spent Report (${report.total} hr)`);
  const rows = [];
  rows.push([...report.groupBy, 'hours']);
  const lastAtDepth = {};
  walkReport(report, (parent, depth) => {
    lastAtDepth[depth] = parent;
    if (depth > 0) {
      const row = new Array(report.groupBy.length + 1).fill('');
      for (let i = 1; i <= depth; i += 1) {
        row[i - 1] = formatters[report.groupBy[i - 1]](lastAtDepth[i]);
      }
      row[report.groupBy.length] = `${parent.total}`;
      rows.push(row);
    }
  });
  table.setRows(rows);
  screen.render();
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

generators[program.type](opts)
  .then((report) => {
    update(report);
  }).catch((err) => {
    screen.destroy();
    console.error(err);
  });
