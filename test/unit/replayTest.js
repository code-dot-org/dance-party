const test = require('tape');
const replayLog = require('../../src/replay');

class mockP5 {
  constructor() {
    this.allSprites = [];
  }

  createDanceSprite() {
    this.allSprites.push({
      getAnimationLabel: () => {},
      mirrorX: () => {},
      isDancer: true
    });
  }

  // Some effects (ex. quads) create sprites which are not dancers
  createEffectsSprite() {
    this.allSprites.push({});
  }
}

test('Dance sprites are added to replay log', t => {
  const p5Inst = new mockP5();

  replayLog.logFrame({p5: p5Inst});
  t.equal(replayLog.getLog().length, 1);
  t.equal(replayLog.getLog()[0].sprites.length, 0);

  p5Inst.createDanceSprite();
  replayLog.logFrame({p5: p5Inst});
  t.equal(replayLog.getLog().length, 2);
  t.equal(replayLog.getLog()[1].sprites.length, 1);

  p5Inst.createDanceSprite();
  replayLog.logFrame({p5: p5Inst});
  t.equal(replayLog.getLog().length, 3);
  t.equal(replayLog.getLog()[2].sprites.length, 2);

  replayLog.reset();
  t.end();
});

test('Effects sprites are not added to replay log', t => {
  const p5Inst = new mockP5();

  replayLog.logFrame({p5: p5Inst});
  t.equal(replayLog.getLog().length, 1);
  t.equal(replayLog.getLog()[0].sprites.length, 0);
  
  p5Inst.createEffectsSprite();
  replayLog.logFrame({p5: p5Inst});
  t.equal(replayLog.getLog().length, 2);
  t.equal(replayLog.getLog()[1].sprites.length, 0);
  
  replayLog.reset();
  t.end();
})
