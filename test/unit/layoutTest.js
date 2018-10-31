const helpers = require('../helpers/createDanceAPI');
const test = require('tape');

const minX = 20;
const maxX = 400 - minX;
const minY = 35;
const maxY = 400 - 40;

async function runLayoutTest(t, fn) {
  const nativeAPI = await helpers.createDanceAPI();
  nativeAPI.play({
    bpm: 120,
  });
  nativeAPI.setAnimationSpriteSheet('CAT', 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet('ALIEN', 0, {}, () => {});
  nativeAPI.setAnimationSpriteSheet('DUCK', 0, {}, () => {});

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
});

test('circle changes radius/scale as we add more sprites', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(2, 'CAT', 'circle');
    nativeAPI.makeNewDanceSpriteGroup(10, 'ALIEN', 'circle');
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

test('border works with 5 sprites', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(5, 'CAT', 'border');

    const cats = nativeAPI.getGroupByName_('CAT');

    const minX = 20;
    const maxX = 400 - minX;
    const minY = 35;
    const maxY = 400 - 40;

    t.equal(cats.length, 5);

    // first four are at the corners
    t.equal(cats[0].x, minX);
    t.equal(cats[0].y, minY);

    t.equal(cats[1].x, maxX);
    t.equal(cats[1].y, minY);

    t.equal(cats[2].x, maxX);
    t.equal(cats[2].y, maxY);

    t.equal(cats[3].x, minX);
    t.equal(cats[3].y, maxY);

    t.equal(cats[4].x, (minX + maxX) / 2);
    t.equal(cats[4].y, minY);
  });
});

test('border works with > 10 sprites', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(11, 'CAT', 'border');

    const cats = nativeAPI.getGroupByName_('CAT');

    t.equal(cats.length, 11);

    // top row should contain first, second, and then 2 more
    [0, 1, 4, 5].forEach(i => t.equal(cats[i].y, minY));

    // right column contains second, third, and 2 others
    [1, 2, 6, 7].forEach(i => t.equal(cats[i].x, maxX));

    // bottom row contains third, fourth, and 2 others
    [2, 3, 8, 9].forEach(i => t.equal(cats[i].y, maxY));

    // left column contains fourth, first and 1 other
    [3, 0, 10].forEach(i => t.equal(cats[i].x, minX));
  });
});

test('sprites that are lower are in front of those that are higher', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(36, 'CAT', 'circle');

    const cats = nativeAPI.getGroupByName_('CAT');

    t.equal(cats.length, 36);

    for (let i = 1; i < cats.length; i++) {
      t.equal(cats[i].y > cats[i-1].y, cats[i].depth > cats[i-1].depth);
    }
  });
});

test('grid layout with square rootable count', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(4, 'CAT', 'grid');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 4);

    t.equal(cats[0].x, minX);
    t.equal(cats[0].y, minY);

    t.equal(cats[1].x, maxX);
    t.equal(cats[1].y, minY);

    t.equal(cats[2].x, minX);
    t.equal(cats[2].y, maxY);

    t.equal(cats[3].x, maxX);
    t.equal(cats[3].y, maxY);
  });
});

test('grid layout with non-square rootable count', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(5, 'CAT', 'grid');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 5);

    // size 5 means we're filling up a 3x3 grid, except that we don't end up
    // needing the 3rd row, and so we instead fill a 3x2 grid
    t.equal(cats[0].x, minX);
    t.equal(cats[0].y, minY);

    t.equal(cats[1].x, (minX + maxX) / 2);
    t.equal(cats[1].y, minY);

    t.equal(cats[2].x, maxX);
    t.equal(cats[2].y, minY);

    t.equal(cats[3].x, minX);
    t.equal(cats[3].y, maxY);

    t.equal(cats[4].x, (minX + maxX) / 2);
    t.equal(cats[4].y, maxY);
  });
});
