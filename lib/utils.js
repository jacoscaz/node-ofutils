
const makeWrapFn = (w) => {
  const regexp = new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g');
  return s => s.replace(regexp, '$1\n');
};

module.exports.makeWrapFn = makeWrapFn;

const limit = (str, len) => {
  return str.length > len ? str.slice(0, len - 3) + '...' : str;
};

module.exports.limit = limit;
