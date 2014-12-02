function Changes (opts) {
  if (!opts) { opts = {}; }

  this._rev = 0;
  this._items = [];
  this._maxLength = opts.maxLength || 20;
}

/*

  Push a change onto the feed

*/
Changes.prototype.push = function (item) {
  this._items.push(item);

  // drop the tail item when it gets too long
  if (this._items.length > this._maxLength) {
    this._items.shift();
  }

  this._rev += 1;
  return this._rev;
};

/*

  Get the revision id of the last change

*/
Changes.prototype.getHeadRev = function () {
  return this._rev;
};

/*

  Get a list of changes since the given revision id

*/
Changes.prototype.getSince = function (rev) {
  //> if the history we're asking for hasn't happened yet, throw an error
  if (rev > this._rev) {
    throw new Error('history too far forward');
  }

  var size = this._rev - rev;

  //> if the history we're asking for has been erased, throw an error
  if (size > this._items.length) {
    throw new Error('history too far behind');
  }

  return this._items.slice(this._items.length - size);
};

module.exports = Changes;
