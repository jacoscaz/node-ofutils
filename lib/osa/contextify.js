const wrap = require('./wrap');

const getWindow = (ctx) => {
  const application = Application('OmniFocus');
  const window = application.windows[0];
  return window;
};

const getDocument = (ctx) => {
  return ctx.getWindow().document();
};

const serializeTag = (ctx, tag) => {
  return tag.name();
};

const serializeTask = (ctx, task) => {
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

const getTasks = (ctx) => {
  const tasks = ctx.getDocument().flattenedTasks();
  return tasks.map(ctx.serializeTask);
};

const serializeProject = (ctx, project) => {
  return {
    id: project.id(),
    name: project.name(),
    tasks: project.flattenedTasks().map(ctx.serializeTask),
  };
};

const getProjects = (ctx) => {
  const projects = ctx.getDocument().flattenedProjects();
  return projects.map(ctx.serializeProject);
};

const getCtxSrc = `() => {
  const ctx = {};
  ctx.getWindow = eval(${getWindow.toString()}).bind(null, ctx);
  ctx.serializeTask = eval(${serializeTask.toString()}).bind(null, ctx);
  ctx.serializeTag = eval(${serializeTag.toString()}).bind(null, ctx);
  ctx.getTasks = eval(${getTasks.toString()}).bind(null, ctx);
  ctx.getProjects = eval(${getProjects.toString()}).bind(null, ctx);
  ctx.serializeProject = eval(${serializeProject.toString()}).bind(null, ctx);
  ctx.getDocument = eval(${getDocument.toString()}).bind(null, ctx);
  return ctx;
};`;

const contextify = (fn) => {
  return wrap((getCtxSrc, fnSrc, ...rest) => {
    const fn = eval(fnSrc);
    const getCtx = eval(getCtxSrc);
    const ctx = getCtx();
    return fn(ctx, ...rest);
  }).bind(null, getCtxSrc, fn.toString());
};

module.exports = contextify;
