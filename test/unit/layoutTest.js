const helpers = require('../helpers/createDanceAPI');
const test = require('tape');

async function runLayoutTest(t, fn) {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet('CAT', 0, {}, () => {});
  fn(nativeAPI);
  t.end();

  nativeAPI.reset();
}

test('circle layout works with 1 sprite', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(1, 'CAT', 'circle');

    // one cat, facing upwards
    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 1);
    t.equal(cats[0].x, 200);
    t.equal(cats[0].rotation, 0);
  });
});

test('circle layout works with 2 sprites', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(2, 'CAT', 'circle');

    // one cat, facing upwards
    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 2);
    t.equal(cats[0].x, 200);
    t.equal(cats[0].rotation, 0);

    t.equal(cats[1].x, 200);
    t.equal(cats[1].rotation, 180);

    // fairly weak test that they just have different y values
    t.notEqual(cats[0].y, cats[1].y);
  });

  test('circle changes radius/scale as we add more sprites', async t => {
    await runLayoutTest(t, nativeAPI => {
      nativeAPI.makeNewDanceSpriteGroup(2, 'CAT', 'circle');
      nativeAPI.setAnimationSpriteSheet('ALIEN', 0, {}, () => {});
      nativeAPI.makeNewDanceSpriteGroup(10, 'ALIEN', 'circle');
      nativeAPI.setAnimationSpriteSheet('DUCK', 0, {}, () => {});
      nativeAPI.makeNewDanceSpriteGroup(20, 'DUCK', 'circle');

      // one cat, facing upwards
      const cats = nativeAPI.getGroupByName_('CAT');
      const aliens = nativeAPI.getGroupByName_('ALIEN');
      const ducks = nativeAPI.getGroupByName_('DUCK');

      // fewer cats, so they should be bigger
      t.ok(cats[0].scale > aliens[0].scale);
      t.ok(cats[0].scale > ducks[0].scale);

      // we should stop getting bigger after count 10
      t.equal(aliens[0].scale, ducks[0].scale);

      // radius should be smaller when we have fewer (so y should be bigger)
      t.ok(cats[0].y > aliens[0].y);
      t.ok(cats[0].y > ducks[0].y);

      // again, this should be unaffected after count 10
      t.equal(aliens[0].y, ducks[0].y);
    });
  });
});
