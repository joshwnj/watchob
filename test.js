var tape = require('tape');

var Watchob = require('./index');

tape('example usage', function (t) {
  t.plan(10);

  var rev;
  var state;
  var data = { foo: 'bar' };
  var w = new Watchob(data);

  // make sure we can't accidentally edit the internal state from an outside reference
  data.foo = 'something else';
  t.equal(w.get('foo'), 'bar', 'Init state is passed by copy');

  rev = w.getHeadRev();
  w.patch('set', 'foo', 123);
  t.equal(w.get('foo'), 123, 'Patch changes internal state');
  t.notEqual(rev, w.getHeadRev(), 'Patch changes the head rev');

  w.getPatchesSince(rev, function (err, patches) {
    t.deepEqual(
      patches,
      [
        { head: rev, op: ['set', 'foo', 123] }
      ],
      'Can get new patches immediately');
  });

  w.getPatchesSince(rev+99, function (err) {
    t.ok(err, 'Get an error if rev is outside of the valid range');
  });

  w.getPatchesSince(w.getHeadRev(), function (err, patches) {
    t.equal(patches.length, 1, 'Notified of the next patch');
    t.equal(patches[0].op[0], 'del', 'Patch contains what we expect');
  });

  w.patch('del', 'foo');
  t.deepEqual(w.getState(), {}, 'State is empty after deleting all items');

  t.throws(
    w.patchAtRev.bind(w, 'set', 'name', 'josh', 9999),
    null,
    'Patch is rejected if the rev doesn\'t match');

  w.patchAtRev('set', 'name', 'josh', w.getHeadRev());
  t.equal(w.get('name'), 'josh', 'Patch is accepted if the rev matches');
});
