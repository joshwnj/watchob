var applyPatch = require('./apply-patch');
var Changes = require('./changes');

function clone (ob) {
  return JSON.parse(JSON.stringify(ob));
}

function Watchob (state) {
  //> store a copy
  this._state = state ? clone(state) : {};

  this._keyRevs = {};

  this._changes = new Changes({
    maxLength: 10
  });

  this._watchers = [];
}

Watchob.prototype.getState = function () {
  return clone(this._state);
};

Watchob.prototype.get = function (key) {
  return this._state[key];
};

Watchob.prototype.getHeadRev = function () {
  return this._changes.getHeadRev();
};

Watchob.prototype._createPatch = function (type, key, args) {
  return {
    head: this.getHeadRev(),
    op: [type, key, args]
  };
};

Watchob.prototype.patch = function (type, key, args) {
  var patch = this._createPatch(type, key, args);

  applyPatch.apply(this._state, patch.op);

  //> remember the last rev to affect this key
  this._keyRevs[key] = patch.head;

  var headRev = this._changes.push(patch);

  //> notify of the change
  var self = this;
  if (this._watchers.length) {
    process.nextTick(function () {
      var notify = function (w) { w(null, [patch]); };
      self._watchers.forEach(notify);
      self._watchers = [];
    }, this);
  }

  return headRev;
};

Watchob.prototype.patchAtRev = function (type, key, args, rev) {
  //> only allow the patch if the provided rev matches the head rev
  if (rev !== this.getHeadRev()) {
    throw new Error('rev id mismatch');
  }

  return this.patch(type, key, args);
};

Watchob.prototype.patchKeyAtRev = function (type, key, args, rev) {
  //> only allow the patch if the provided rev matches the key rev
  if (rev !== this._keyRevs[key]) {
    throw new Error('rev id mismatch');
  }

  return this.patch(type, key, args);
};

Watchob.prototype.getPatchesSince = function (rev, cb) {
  if (rev === undefined) {
    throw new Error('rev id is required');
  }

  var patches;
  try {
    patches = this._changes.getSince(rev);
  }
  catch (e) {
    return cb(e);
  }

  //> if there are existing patches we send them back immediately
  if (patches && patches.length > 0) {
    return cb(null, patches);
  }

  //> otherwise we hang on to the callback for when the next patch is made
  this._watchers.push(cb);
};

module.exports = Watchob;
