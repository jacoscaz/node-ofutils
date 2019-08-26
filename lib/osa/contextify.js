
const wrap = require('./wrap');

const ctx = {};

ctx.getWindow = (ctx) => {
  const application = Application('OmniFocus');
  const window = application.windows[0];
  return window;
};

ctx.getDocument = (ctx) => {
  return ctx.getWindow().document();
};

ctx.serializeTag = (ctx, tag) => {
  return tag.name();
};

ctx.serializeTask = (ctx, task) => {
  return {
    name: task.name(),
    id: task.id(),
    note: task.note(),
    inInbox: task.inInbox(),
    flagged: task.flagged(),
    completed: task.completed(),
    deferDate: task.deferDate(),
    dueDate: task.dueDate(),
    tags: task.tags().map(ctx.serializeTag),
    completionDate: task.completionDate(),
  };
};

ctx.getTasks = (ctx) => {
  const tasks = ctx.getDocument().flattenedTasks();
  return tasks.map(ctx.serializeTask);
};

ctx.serializeProject = (ctx, project) => {
  return {
    id: project.id(),
    name: project.name(),
    tasks: project.flattenedTasks().map(ctx.serializeTask),
  };
};

ctx.getProjects = (ctx) => {
  const projects = ctx.getDocument().flattenedProjects();
  return projects.map(ctx.serializeProject);
};

const serializedGetCtx = `() => {
  const ctx = {};
  ${Object.keys(ctx).map(key => `ctx.${key} = eval(${ctx[key].toString()}).bind(null, ctx);`).join('\n  ')}
  return ctx;
};`;

const contextify = (fn) => {
  return wrap((serializedGetCtx, serializedFn, ...rest) => {
    const fn = eval(serializedFn);
    const getCtx = eval(serializedGetCtx);
    const ctx = getCtx();
    return fn(ctx, ...rest);
  }).bind(null, serializedGetCtx, fn.toString());
};

module.exports = contextify;
