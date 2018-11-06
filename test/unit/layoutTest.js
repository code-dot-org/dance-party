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

test('sprites that are further right have a higher depth', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(2, 'CAT', 'row');

    const cats = nativeAPI.getGroupByName_('CAT');

    t.equal(cats.length, 2);

    t.equal(cats[0].y, cats[1].y);
    t.ok(cats[0].depth < cats[1].depth);
  });
});

test('grid layout with perfect square count', async t => {
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

test('grid layout without perfect square count', async t => {
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

test('grid layout of size 2', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(2, 'CAT', 'grid');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 2);

    t.equal(cats[0].x, minX);
    t.equal(cats[0].y, minY);

    t.equal(cats[1].x, maxX);
    t.equal(cats[1].y, minY);
  });
});

test('inner layout with perfect square count', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(4, 'CAT', 'inner');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 4);

    t.equal(cats[0].y, cats[1].y);
    t.equal(cats[2].y, cats[3].y);
    t.equal(cats[0].x, cats[2].x);
    t.equal(cats[1].x, cats[3].x);

    t.ok(cats[0].x < cats[1].x);
    t.ok(cats[0].y < cats[2].y);
  });
});

test('inner layout without perfect square count', async t => {
  await runLayoutTest(t, nativeAPI => {
    // this should result in a 3x3 square
    nativeAPI.makeNewDanceSpriteGroup(8, 'CAT', 'inner');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 8);

    // width is equal to height
    const width = cats[2].x - cats[0].x;
    const height = cats[6].y - cats[0].y;
    t.equal(width, height);

    // last row is still left aligned
    t.equal(cats[6].x, cats[0].x);
  });
});

test('inner square gets bigger with count, but not after 10', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(4, 'CAT', 'inner');

    // ends up on a 4x4 grid
    nativeAPI.makeNewDanceSpriteGroup(10, 'ALIEN', 'inner');

    // ends up on a 6x6 grid
    nativeAPI.makeNewDanceSpriteGroup(30, 'DUCK', 'inner');

    const cats = nativeAPI.getGroupByName_('CAT');
    const aliens = nativeAPI.getGroupByName_('ALIEN');
    const ducks = nativeAPI.getGroupByName_('DUCK');

    // cats smaller than aliens
    t.ok((cats[1].x - cats[0].x) < (aliens[3].x - aliens[0].x));

    // aliens same size as ducks
    t.equal(aliens[3].x - aliens[0].x, ducks[5].x - ducks[0].x);
  });
});

test('plus layout with count of 4', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(4, 'CAT', 'plus');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 4);

    // first and second cats are aligned along x
    t.equal(cats[0].x, cats[1].x);
    t.ok(cats[0].y < cats[1].y);

    // third and fourth are aligned along y
    t.equal(cats[2].y, cats[3].y);
    t.ok(cats[2].x < cats[3].x);

    const width = cats[3].x - cats[2].x;
    const height = cats[1].y - cats[0].y;
    t.equal(width, height);
  });
});

test('plus layout with count not divisible by 4', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(6, 'CAT', 'plus');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 6);

    // first, second, fifth and sixth  are aligned along x
    t.equal(cats[0].x, cats[1].x);
    t.equal(cats[0].x, cats[4].x);
    t.equal(cats[0].x, cats[5].x);
    t.ok(cats[4].y < cats[0].y);
    t.ok(cats[0].y < cats[1].y);
    t.ok(cats[1].y < cats[5].y);

    // third and fourth are aligned along y
    t.equal(cats[2].y, cats[3].y);
    t.ok(cats[2].x < cats[3].x);

  });
});

test('x layout with count of 4', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(4, 'CAT', 'x');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 4);

    // JS math tries hard, and at least gets close
    const essentiallyEqual = (a, b) => t.ok(Math.abs(a - b) < 0.0001);

    // first and second reflect along a line with slope 1 going through (200, 200)
    t.equal(200 - cats[0].x, cats[1].x - 200);
    t.equal(200 - cats[0].y, cats[1].y - 200);

    // same is true of third and fourth
    essentiallyEqual(200 - cats[2].x, cats[3].x - 200);
    essentiallyEqual(200 - cats[2].y, cats[3].y - 200);

    // first and third have same y
    t.equal(cats[0].y, cats[2].y);
  });
});


test('x layout with count not divisible by 4', async t => {
  await runLayoutTest(t, nativeAPI => {
    nativeAPI.makeNewDanceSpriteGroup(7, 'CAT', 'x');

    const cats = nativeAPI.getGroupByName_('CAT');
    t.equal(cats.length, 7);

    // JS math tries hard, and at least gets close
    const essentiallyEqual = (a, b) => t.ok(Math.abs(a - b) < 0.0001);

    // first and second reflect along a line with slope 1 going through (200, 200)
    t.equal(200 - cats[0].x, cats[1].x - 200);
    t.equal(200 - cats[0].y, cats[1].y - 200);

    // same is true of third and fourth
    essentiallyEqual(200 - cats[2].x, cats[3].x - 200);
    essentiallyEqual(200 - cats[2].y, cats[3].y - 200);

    // and fifth and six
    essentiallyEqual(200 - cats[4].x, cats[5].x - 200);
    essentiallyEqual(200 - cats[4].y, cats[5].y - 200);

    // fifth is to the left and above the first
    t.ok(cats[4].x < cats[0].x);
    t.ok(cats[4].y < cats[0].y);

    // sixth is to the right and below the second
    t.ok(cats[5].x > cats[1].x);
    t.ok(cats[5].y > cats[1].y);

    // seventh is to the right and above third
    t.ok(cats[6].x > cats[2].x);
    t.ok(cats[6].y < cats[2].y);
  });
});
