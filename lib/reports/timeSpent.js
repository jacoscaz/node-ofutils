const osaHelpers = require('../osa/helpers');

const timeSpentRegexp = /^\s*spent\s*(\d{4}-\d{2}-\d{2})\s*(\d+)([hmd])\s*$/;

const getHoursFromQtyAndUnit = (qty, unit) => {
  let hours;
  switch (unit) {
    case 'd':
      hours = qty * 8;
      break;
    case 'm':
      hours = qty / 60;
      break;
    case 'h':
      hours = qty;
      break;
    default:
      throw new Error(`Unsupported unit ${unit}`);
  }
  return hours;
};

const dateSorterFactory = (direction = 'asc') => {
  return direction === 'asc'
    ? (a, b) => a.date < b.date ? -1 : 1
    : (a, b) => a.date < b.date ? 1 : -1
  ;
};

const taskSorterFactory = (direction = 'asc') => {
  return direction === 'asc'
    ? (a, b) => a.name < b.name ? -1 : 1
    : (a, b) => a.name < b.name ? 1 : -1
  ;
};

const projectSorterFactory = (direction = 'asc') => {
  return direction === 'asc'
    ? (a, b) => a.name < b.name ? -1 : 1
    : (a, b) => a.name < b.name ? 1 : -1
  ;
};

const sorterFactories = {
  date: dateSorterFactory,
  task: taskSorterFactory,
  project: projectSorterFactory,
  null: () => () => -1,
};

const getTimeSpentReport = (projects, opts) => {

  const report = {
    ...opts,
    groups: {},
    total: 0,
  };

  projects.forEach((project) => {
    project.tasks.forEach((task) => {
      if (!task.note) return;
      task.note.split(/\r?\n/).forEach((line) => {
        const match = line.match(timeSpentRegexp);
        if (!match) return;
        const [, date, qty, unit] = match;
        if (opts.from && new Date(date) < new Date(opts.from)) return;
        if (opts.to && new Date(date) > new Date(opts.to)) return;
        const hours = getHoursFromQtyAndUnit(parseInt(qty), unit);
        report.total += hours;
        let currentGroups = report.groups;
        opts.groupBy.forEach((criteria) => {
          switch (criteria) {
            case 'date':
              if (!currentGroups[date]) {
                currentGroups[date] = {
                  date,
                  total: 0,
                  groups: {},
                };
              }
              currentGroups[date].total += hours;
              currentGroups = currentGroups[date].groups;
              break;
            case 'project':
              if (!currentGroups[project.id]) {
                currentGroups[project.id] = {
                  projectId: project.id,
                  projectName: project.name,
                  total: 0,
                  groups: {},
                };
              }
              currentGroups[project.id].total += hours;
              currentGroups = currentGroups[project.id].groups;
              break;
            case 'task':
              if (!currentGroups[task.id]) {
                currentGroups[task.id] = {
                  taskId: task.id,
                  taskName: task.name,
                  total: 0,
                  groups: {},
                };
              }
              currentGroups[task.id].total += hours;
              currentGroups = currentGroups[task.id].groups;
              break;
            default:
              throw new Error(`Unsupported groupBy criteria ${criteria}`);
          }
        });

      });
    });
  });

  let currentParents = [report];

  [...opts.groupBy, 'null'].forEach((criteria, ci) => {
    const nextParents = [];
    currentParents.forEach((parent) => {
      parent.groups = Object.values(parent.groups)
        .sort(sorterFactories[criteria](opts.sort[ci] || 'asc'));
      nextParents.push(...parent.groups);
    });
    currentParents = nextParents;
  });

  return report;
};


module.exports.generate = async (opts) => {
  const projects = await osaHelpers.getProjects();
  const report = getTimeSpentReport(projects, opts);
  return report;
};




