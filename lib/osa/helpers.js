const contextify = require('./contextify');

const getProjects = contextify((ctx) => {
  return ctx.getProjects();
});

module.exports.getProjects = getProjects;
