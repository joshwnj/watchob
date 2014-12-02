module.exports = function applyPatch (type, key, val) {
  var state = this;

  switch (type) {
  case 'set':
    state[key] = val;
    break;

  case 'del':
    delete state[key];
    break;

  default:
    throw new Error('Unknown patch type');
  }
};
