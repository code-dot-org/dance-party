/* eslint-disable no-unused-vars, curly, eqeqeq, babel/semi, semi, no-undef */
/* global p5, Dance, validationProps */
const P5 = require('./loadP5');
const Effects = require('./Effects');
const replayLog = require('./replay');

function Behavior(func, extraArgs) {
  if (!extraArgs) {
    extraArgs = [];
  }
  this.func = func;
  this.extraArgs = extraArgs;
}

const WATCHED_KEYS = [
  'up', 'left', 'down', 'right', 'space', 'enter',
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ...'0123456789'.split('')
];
const WATCHED_RANGES = [0, 1, 2];

const img_base = "https://curriculum.code.org/images/sprites/spritesheet_tp/";
const SIZE = 300;
const ANIMATIONS = {};
const FRAMES = 24;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class DanceParty {
  constructor({
    onHandleEvents,
    onInit,
    onPuzzleComplete,
    playSound,
    moveNames,
    recordReplayLog,
    showMeasureLabel = true,
    container,
    spriteConfig,
  }) {
    this.onHandleEvents = onHandleEvents;
    this.onInit = onInit;
    this.showMeasureLabel = showMeasureLabel;

    this.currentFrameEvents = {
      'this.p5_.keyWentDown': {},
      'Dance.fft.isPeak': {},
      'cue-seconds': {},
      'cue-measures': {},
    };

    this.world = {
      height: 400,
      cues: {
        seconds: [],
        measures: [],
        peaks: []
      },
      validationCallback: () => {},
    };

    this.onPuzzleComplete_ = onPuzzleComplete;
    this.playSound_ = playSound;
    this.recordReplayLog_ = recordReplayLog;

    this.world.bg_effect = null;
    this.world.fg_effect = null;

    this.peakThisFrame_ = false;
    this.energy_ = 0;
    this.centroid_ = 0;

    this.sprites_by_type_ = {};

    this.world.SPRITE_NAMES = ["ALIEN", "BEAR", "CAT", "DOG", "DUCK", "FROG", "MOOSE", "PINEAPPLE", "ROBOT", "SHARK", "UNICORN"];

    this.world.MOVE_NAMES = moveNames || [
      {name: "Rest", mirror: true},
      {name: "ClapHigh", mirror: true},
      {name: "Clown", mirror: false},
      {name: "Dab", mirror: true},
      {name: "DoubleJam", mirror: false},
      {name: "Drop", mirror: true},
      {name: "Floss", mirror: true},
      {name: "Fresh", mirror: true},
      {name: "Kick", mirror: true},
      {name: "Roll", mirror: true},
      {name: "ThisOrThat", mirror: false},
      {name: "Thriller", mirror: true},
      {name: "XArmsSide", mirror: false},
      {name: "XArmsUp", mirror: false},
      {name: "XJump", mirror: false},
      {name: "XClapSide", mirror: false},
      {name: "XHeadHips", mirror: false},
      {name: "XHighKick", mirror: false},
    ];

    if (spriteConfig) {
      spriteConfig(this.world);
    }

    this.songStartTime_ = 0;

    new P5(p5Inst => {
      this.p5_ = p5Inst;
      this.sprites_ = p5Inst.createGroup();
      p5Inst.preload = () => this.preload();
      p5Inst.setup = () => this.setup();
      p5Inst.draw = () => this.draw();
    }, container);
  }

  onKeyDown(keyCode) {
    this.p5_._onkeydown({ which: keyCode });
  }

  onKeyUp(keyCode) {
    this.p5_._onkeyup({ which: keyCode });
  }

  getReplayLog() {
    if (this.recordReplayLog_) {
      return replayLog.getLog();
    } else {
      return [];
    }
  }

  getTestInterface() {
    return {
      getSprites: () => this.p5_ && this.p5_.allSprites,
      getSongUrl: () => this.songMetadata_ && this.songMetadata_.file,
      getSongStartedTime: () => this.songStartTime_,
    };
  }

  pass() {
    this.onPuzzleComplete_(true);
  }

  fail(message) {
    this.onPuzzleComplete_(false, message);
  }

  addCues(timestamps) {
    // Sort cues
    const numSort = (a,b) => a - b;

    this.world.cues.measures = timestamps.measures.sort(numSort);
    this.world.cues.seconds = timestamps.seconds.sort(numSort);
  }

  reset() {
    this.songStartTime_ = 0;
    this.analysisPosition_ = 0;
    while (this.p5_.allSprites.length > 0) {
      this.p5_.allSprites[0].remove();
    }
    this.p5_.noLoop();
    this.currentFrameEvents.any = false;

    this.world.fg_effect = null;
    this.world.bg_effect = null;
  }

  preload() {
    // Load spritesheet JSON files
    this.world.SPRITE_NAMES.forEach(this_sprite => {
      ANIMATIONS[this_sprite] = [];
      this.world.MOVE_NAMES.forEach(({ name, mirror }, moveIndex) => {
        const baseUrl = `${img_base}${this_sprite}_${name}`;
        this.p5_.loadJSON(`${baseUrl}.json`, jsonData => {
          // Passing true as the 3rd arg to loadSpriteSheet() indicates that we want
          // it to load the image as a Image (instead of a p5.Image), which avoids
          // a canvas creation. This makes it possible to run on mobile Safari in
          // iOS 12 with canvas memory limits.
          this.setAnimationSpriteSheet(this_sprite, moveIndex,
            this.p5_.loadSpriteSheet(`${baseUrl}.png`, jsonData.frames, true), mirror)
        });
      });
    });
  }

  setAnimationSpriteSheet(sprite, moveIndex, spritesheet, mirror){
    if (!ANIMATIONS[sprite]) {
      ANIMATIONS[sprite] = [];
    }
    ANIMATIONS[sprite][moveIndex] = {
      spritesheet: spritesheet,
      mirror,
      animation: 'missing',
    };
  }

  setup() {
    this.bgEffects_ = new Effects(this.p5_, 1);
    this.fgEffects_ = new Effects(this.p5_, 0.8);

    // Create animations from spritesheets
    for (let i = 0; i < this.world.SPRITE_NAMES.length; i++) {
      let this_sprite = this.world.SPRITE_NAMES[i];
      for (let j = 0; j < ANIMATIONS[this_sprite].length; j++) {
        ANIMATIONS[this_sprite][j].animation = this.p5_.loadAnimation(ANIMATIONS[this_sprite][j].spritesheet);
      }
    }

    this.onInit && this.onInit(this);
  }

  play(songData, callback) {
    if (this.recordReplayLog_) {
      replayLog.reset();
    }
    this.songMetadata_ = songData;
    this.analysisPosition_ = 0;
    this.playSound_({url: this.songMetadata_.file, callback: () => {
      this.songStartTime_ = new Date();
      callback && callback();
    }});
    this.p5_.loop();
  }

  setBackground(color) {
    // Clear background effect so it doesn't cover up background color.
    this.world.bg_effect = this.bgEffects_.none;
    this.world.background_color = color;
  }

  setBackgroundEffect(effect) {
    this.world.bg_effect = this.bgEffects_[effect];
  }

  setForegroundEffect(effect) {
    this.world.fg_effect = this.fgEffects_[effect];
  }

//
// Block Functions
//

  makeNewDanceSprite(costume, _, location) {

    // Default to first dancer if selected a dancer that doesn't exist
    // to account for low-bandwidth mode limited character set
    if (this.world.SPRITE_NAMES.indexOf(costume) < 0) {
      costume = this.world.SPRITE_NAMES[0];
    }

    if (!location) {
      location = {
        x: 200,
        y: 200
      };
    }

    var sprite = this.p5_.createSprite(location.x, location.y);

    sprite.style = costume;
    if (!this.sprites_by_type_.hasOwnProperty(costume)) {
      this.sprites_by_type_[costume] = this.p5_.createGroup();
    }
    this.sprites_by_type_[costume].add(sprite);

    sprite.mirroring = 1;
    sprite.looping_move = 0;
    sprite.looping_frame = 0;
    sprite.current_move = 0;
    sprite.previous_move = 0;

    for (var i = 0; i < ANIMATIONS[costume].length; i++) {
      sprite.addAnimation("anim" + i, ANIMATIONS[costume][i].animation);
    }
    sprite.animation.stop();
    this.sprites_.add(sprite);
    sprite.speed = 10;
    sprite.sinceLastFrame = 0;
    sprite.dance_speed = 1;
    sprite.previous_speed = 1;
    sprite.behaviors = [];

    // Add behavior to control animation
    this.addBehavior_(sprite, () => {
      var delta = Math.min(100, 1 / (this.p5_.frameRate() + 0.01) * 1000);
      sprite.sinceLastFrame += delta;
      var msPerBeat = 60 * 1000 / (this.songMetadata_.bpm * (sprite.dance_speed / 2));
      var msPerFrame = msPerBeat / FRAMES;
      while (sprite.sinceLastFrame > msPerFrame) {
        sprite.sinceLastFrame -= msPerFrame;
        sprite.looping_frame++;
        if (sprite.animation.looping) {
          sprite.animation.changeFrame(sprite.looping_frame % sprite.animation.images.length);
        } else {
          sprite.animation.nextFrame();
        }

        if (sprite.looping_frame % FRAMES === 0) {
          if (ANIMATIONS[sprite.style][sprite.current_move].mirror) sprite.mirroring *= -1;
          if (sprite.animation.looping) {
            sprite.mirrorX(sprite.mirroring);
          }
        }

        var currentFrame = sprite.animation.getFrame();
        if (currentFrame === sprite.animation.getLastFrame() && !sprite.animation.looping) {
          //changeMoveLR(sprite, sprite.current_move, sprite.mirroring);
          sprite.changeAnimation("anim" + sprite.current_move);
          sprite.animation.changeFrame(sprite.looping_frame % sprite.animation.images.length);
          sprite.mirrorX(sprite.mirroring);
          sprite.animation.looping = true;
        }
      }
    });

    sprite.setTint = function (color) {
      sprite.tint = color;
    };
    sprite.removeTint = function () {
      sprite.tint = null;
    };

    sprite.setPosition = function (position) {
      if (position === "random") {
        sprite.x = randomInt(50, 350);
        sprite.y = randomInt(50, 350);
      } else {
        sprite.x = position.x;
        sprite.y = position.y;
      }
    };
    sprite.setScale = function (scale) {
      sprite.scale = scale;
    };
    return sprite;
  }

  makeNewDanceSpriteGroup(n, costume, layout) {
    var tempGroup = this.p5_.createGroup();
    for (var i=0; i<n; i++) {
      tempGroup.add(this.makeNewDanceSprite(costume));
    }
    this.layoutSprites(tempGroup, layout);
  }

// Dance Moves

  changeMoveLR(sprite, move, dir) {
    if (!this.spriteExists_(sprite)) return;
    if (move === "next") {
      move = 1 + (sprite.current_move % (ANIMATIONS[sprite.style].length - 1));
    } else if (move === "prev") {
      //Javascript doesn't handle negative modulos as expected, so manually resetting the loop
      move = sprite.current_move - 1;
      if (move <= 0) {
        move = ANIMATIONS[sprite.style].length - 1;
      }
    } else if (move === "rand") {
      // Make sure random switches to a new move
      move = sprite.current_move;
      while (move === sprite.current_move) {
        move = randomInt(0, ANIMATIONS[sprite.style].length - 1);
      }
    }
    sprite.mirroring = dir;
    sprite.mirrorX(dir);
    sprite.changeAnimation("anim" + move);
    if (sprite.animation.looping) sprite.looping_frame = 0;
    sprite.animation.looping = true;
    sprite.current_move = move;
  }

  doMoveLR(sprite, move, dir) {
    if (!this.spriteExists_(sprite)) return;
    if (move === "next") {
      move = (sprite.current_move + 1) % ANIMATIONS[sprite.style].length;
    } else if (move === "prev") {
      move = (sprite.current_move - 1) % ANIMATIONS[sprite.style].length;
    } else if (move === "rand") {
      move = sprite.current_move;
      while (move === sprite.current_move) {
        move = randomInt(0, ANIMATIONS[sprite.style].length - 1);
      }
    }
    sprite.mirrorX(dir);
    sprite.changeAnimation("anim" + move);
    sprite.animation.looping = false;
    sprite.animation.changeFrame(FRAMES / 2);
  }

  getCurrentDance(sprite) {
    if (this.spriteExists_(sprite)) {
      return sprite.current_move;
    }
  }

// Group Blocks

  getGroupByName_(group) {
    if (typeof(group) === "object") {
      return group;
    }
    if (group !== "all") {
      if (!this.sprites_by_type_.hasOwnProperty(group)) {
        console.log("There is no group of " + group);
        return;
      }
      return this.sprites_by_type_[group];
    }
    return this.p5_.allSprites;
  }

  changeMoveEachLR(group, move, dir) {
    group = this.getGroupByName_(group);
    group.forEach(sprite => {
      this.changeMoveLR(sprite, move, dir);
    });
  }

  doMoveEachLR(group, move, dir) {
    group = this.getGroupByName_(group);
    group.forEach(sprite => { this.doMoveLR(sprite, move, dir);});
  }

  /**
   * Given a group with an abitrary number of sprites, arrange them in a particular
   * layout. This is likely to change some or all of position/rotation/scale for
   * the sprites in the group
   */
  layoutSprites(group, format) {
    group = this.getGroupByName_(group);

    // begin by resizing the entire group
    group.forEach(sprite => this.setProp(sprite, 'scale', 30));

    const count = group.length;
    const minX = 20;
    const maxX = 400 - minX;
    const minY = 35;
    const maxY = 400 - 40;
    const radiansToDegrees = 180 / Math.PI;
    const maxCircleRadius = 165;

    if (format === "circle") {
      // adjust radius of circle and size of the sprite according to number of
      // sprites in our group
      const pct = this.p5_.constrain(count / 10, 0, 1);
      const radius = this.p5_.lerp(50, maxCircleRadius, pct);
      const scale = this.p5_.lerp(0.8, 0.3, pct * pct);
      const startAngle = -Math.PI / 2;
      const deltaAngle = 2 * Math.PI / count;

      group.forEach((sprite, i) => {
        const angle = deltaAngle * i + startAngle;
        sprite.x = 200 + radius * Math.cos(angle);
        sprite.y = 200 + radius * Math.sin(angle);
        sprite.rotation = (angle - startAngle) * radiansToDegrees;
        sprite.scale = scale;
      });
    } else if (format === 'plus') {
      const pct = this.p5_.constrain(count / 10, 0, 1);
      const maxRadius = this.p5_.lerp(50, maxCircleRadius, pct);
      const numRings = Math.ceil(count / 4);
      group.forEach((sprite, i) => {
        const ring = Math.floor(i / 4) + 1;
        const angle = [
          -Math.PI / 2, // above
          Math.PI / 2, // below
          -Math.PI, // left
          0 // right
        ][i % 4];
        const ringRadius = this.p5_.lerp(0, maxRadius, ring / numRings);

        sprite.x = 200 + ringRadius * Math.cos(angle);
        sprite.y = 200 + ringRadius * Math.sin(angle);
      });
    } else if (format === 'x') {
      const pct = this.p5_.constrain(count / 10, 0, 1);
      // we can have a bigger radius here since we're going to the corners
      const maxRadius = this.p5_.lerp(0, Math.sqrt(2 * maxCircleRadius * maxCircleRadius), pct);
      const numRings = Math.ceil(count / 4);
      group.forEach((sprite, i) => {
        const ring = Math.floor(i / 4) + 1;
        const angle = [
          -Math.PI / 4 + -Math.PI / 2,
          -Math.PI / 4 + Math.PI / 2,
          -Math.PI / 4 + 0,
          -Math.PI / 4 + -Math.PI,
        ][i % 4];
        const ringRadius = this.p5_.lerp(0, maxRadius, ring / numRings);

        sprite.x = 200 + ringRadius * Math.cos(angle);
        sprite.y = 200 + ringRadius * Math.sin(angle);
        sprite.rotation = (angle + Math.PI / 2) * radiansToDegrees;
      });
    } else if (format === "grid") {
      // Create a grid where the width is the  square root of the count, rounded up
      // and the height is the number of rows needed to fill in count cells
      // For our last row, we might have empty cells in our grid (but the row
      // structure will be the same)
      const numCols = Math.ceil(Math.sqrt(count));
      const numRows = Math.ceil(count / numCols);
      group.forEach((sprite, i) => {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        // || 0 so that we recover from div 0
        sprite.x = this.p5_.lerp(minX, maxX, col / (numCols - 1) || 0);
        sprite.y = this.p5_.lerp(minY, maxY, row / (numRows - 1) || 0);
      });
    } else if (format === "inner") {
      const pct = this.p5_.constrain(count / 10, 0, 1);
      const radius = this.p5_.lerp(0, 100, pct);
      const size = Math.ceil(Math.sqrt(count));
      group.forEach((sprite, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        sprite.x = this.p5_.lerp(200 - radius, 200 + radius, col / (size - 1));
        sprite.y = this.p5_.lerp(200 - radius, 200 + radius, row / (size - 1));
      });
    } else if (format === "row") {
      for (let i=0; i<count; i++) {
        const sprite = group[i];
        sprite.x = (i+1) * (400 / (count + 1));
        sprite.y = 200;
      }
    } else if (format === "column") {
      for (let i=0; i<count; i++) {
        const sprite = group[i];
        sprite.x = 200;
        sprite.y = (i+1) * (400 / (count + 1));
      }
    } else if (format === "border") {
      // first fill the four corners
      // then split remainder into 4 groups. distribute group one along the top,
      // group 2 along the right, etc.
      if (count > 0) {
        group[0].x = minX;
        group[0].y = minY;
      }
      if (count > 1) {
        group[1].x = maxX;
        group[1].y = minY;
      }
      if (count > 2) {
        group[2].x = maxX;
        group[2].y = maxY;
      }
      if (count > 3) {
        group[3].x = minX;
        group[3].y = maxY;
      }
      if (count > 4) {
        const topCount = Math.ceil((count - 4 - 0) / 4);
        const rightCount = Math.ceil((count - 4 - 1) / 4);
        const bottomCount = Math.ceil((count - 4 - 2) / 4);
        const leftCount = Math.ceil((count - 4 - 3) / 4);

        for (let i = 0; i < topCount; i++) {
          const sprite = group[4 + i];
          // we want to include the corners in our total count so that the first
          // inner sprite is > 0 and the last inner sprite is < 1 when we lerp
          sprite.x = this.p5_.lerp(minX, maxX, (i + 1) / (topCount + 1));
          sprite.y = minY
        }

        for (let i = 0; i < rightCount; i++) {
          const sprite = group[4 + topCount + i];
          sprite.x = maxX;
          sprite.y = this.p5_.lerp(minY, maxY, (i + 1) / (rightCount + 1));
        }

        for (let i = 0; i < bottomCount; i++) {
          const sprite = group[4 + topCount + rightCount + i];
          sprite.x = this.p5_.lerp(minX, maxX, (i + 1) / (bottomCount + 1));
          sprite.y = maxY;
        }

        for (let i = 0; i < leftCount; i++) {
          const sprite = group[4 + topCount + rightCount + bottomCount + i];
          sprite.x = minX;
          sprite.y = this.p5_.lerp(minY, maxY, (i + 1) / (leftCount + 1));
        }
      }
    } else if (format === "random") {
      group.forEach(function (sprite) {
        sprite.x = randomInt(minX, maxX);
        sprite.y = randomInt(minY, maxY);
      });
    } else {
      throw new Error('Unexpected format: ' + format);
    }

    // we want sprites that are lower in the canvas to show up on top of those
    // that are higher
    // we also add a fractional component based on x to avoid z-fighting (except
    // in cases where we have identical x and y)
    group.forEach(sprite => sprite.depth = sprite.y + sprite.x / 400);
  }

// Properties

  setTint(sprite, val) {
    this.setProp(sprite, "tint", val);
  }

  setVisible(sprite, val) {
    this.setProp(sprite, "visible", val);
  }

  setProp(sprite, property, val) {
    if (!this.spriteExists_(sprite) || val === undefined) return;

    if (property === "scale") {
      sprite.scale = val / 100;
    } else if (property === "width" || property === "height") {
      sprite[property] = SIZE * (val / 100);
    } else if (property === "y") {
      sprite.y = this.world.height - val;
    } else if (property === "costume") {
      sprite.setAnimation(val);
    } else if (property === "tint" && typeof (val) === "number") {
      sprite.tint = "hsb(" + (Math.round(val) % 360) + ", 100%, 100%)";
    } else {
      sprite[property] = val;
    }
  }

  setPropRandom(sprite, property) {
    if (!this.spriteExists_(sprite)) return;

    if (property === "scale") {
      sprite.scale = randomInt(0,100)/100;
    } else if (property === "width" || property === "height") {
      sprite[property] = SIZE * (randomInt(0,100)/100);
    } else if (property === "y" || property === "x"){
      sprite[property] = randomInt(50, 350);
    } else if (property === "rotation"){
      sprite[property] = randomInt(0, 359);
    } else if (property === "tint") {
      sprite.tint = "hsb(" + (randomInt(0, 359)) + ", 100%, 100%)";
    }
  }

  getProp(sprite, property) {
    if (!this.spriteExists_(sprite)) return;

    if (property === "scale") {
      return sprite.scale * 100;
    } else if (property === "width" || property === "height") {
      return (sprite[property] / SIZE) * 100;
    } else if (property === "y") {
      return this.world.height - sprite.y;
    } else if (property === "costume") {
      return sprite.getAnimationLabel();
    } else if (property === "tint") {
      return this.p5_.color(sprite.tint || 0)._getHue();
    } else {
      return sprite[property];
    }
  }

  changePropBy(sprite,  property, val) {
    this.setProp(sprite, property, this.getProp(sprite, property) + val);
  }

  setTintEach(group, val) {
    this.setPropEach(group, "tint", val);
  }

  setVisibleEach(group, val) {
    this.setPropEach(group, "visible", val);
  }

  setPropEach(group, property, val) {
    group = this.getGroupByName_(group);
    group.forEach(function (sprite){
      this.setProp(sprite, property, val);
    }, this);
  }

  jumpTo(sprite, location) {
    if (!this.spriteExists_(sprite)) return;
    sprite.x = location.x;
    sprite.y = location.y;
  }

  setDanceSpeed(sprite, speed) {
    if (!this.spriteExists_(sprite)) return;
    sprite.dance_speed = speed;
  }

// Music Helpers

  getEnergy(range) {
    switch (range) {
      case 'bass':
        return this.energy_[0];
      case 'mid':
        return this.energy_[1];
      case 'treble':
        return this.energy_[2];
    }
  }

  getCurrentTime() {
    return this.songStartTime_ > 0 ? (new Date() - this.songStartTime_) / 1000 : 0;
  }

  getCurrentMeasure() {
    return this.songStartTime_ > 0 ?
        this.songMetadata_.bpm * ((this.getCurrentTime() - this.songMetadata_.delay) / 240) + 1 : 0;
  }

  getTime(unit) {
    if (unit === "measures") {
      return this.getCurrentMeasure();
    } else {
      return this.getCurrentTime();
    }
  }

// Behaviors

  addBehavior_(sprite, behavior) {
    if (!this.spriteExists_(sprite) || behavior === undefined) return;

    behavior = this.normalizeBehavior_(behavior);

    if (this.findBehavior_(sprite, behavior) !== -1) {
      return;
    }
    sprite.behaviors.push(behavior);
  }

  removeBehavior_(sprite, behavior) {
    if (!this.spriteExists_(sprite) || behavior === undefined) return;

    behavior = this.normalizeBehavior_(behavior);

    var index = this.findBehavior_(sprite, behavior);
    if (index === -1) {
      return;
    }
    sprite.behaviors.splice(index, 1);
  }

  normalizeBehavior_(behavior) {
    if (typeof behavior === 'function') {
      return new Behavior(behavior);
    }
    return behavior;
  }

  findBehavior_(sprite, behavior) {
    for (let i = 0; i < sprite.behaviors.length; i++) {
      const myBehavior = sprite.behaviors[i];
      if (this.behaviorsEqual_(behavior, myBehavior)) {
        return i;
      }
    }
    return -1;
  }

  behaviorsEqual_(behavior1, behavior2) {
    if (behavior1.func.name && behavior2.func.name) {
      // These are legacy behaviors, check for equality based only on the name.
      return behavior1.func.name === behavior2.func.name;
    }
    if (behavior1.func !== behavior2.func) {
      return false;
    }
    if (behavior2.extraArgs.length !== behavior1.extraArgs.length) {
      return false;
    }
    let extraArgsEqual = true;
    for (let j = 0; j < behavior1.extraArgs.length; j++) {
      if (behavior2.extraArgs[j] !== behavior1.extraArgs[j]) {
        extraArgsEqual = false;
        break;
      }
    }
    return extraArgsEqual;
  }

  startMapping(sprite, property, range) {
    var behavior = new Behavior(sprite => {
      var energy = this.getEnergy(range);
      if (property === "x") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 50, 350));
      } else if (property === "y") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 350, 50));
      } else if (property === "scale") {
        energy = this.p5_.map(energy, 0, 255, 0.5, 1.5);
      } else if (property === "width" || property === "height") {
        energy = this.p5_.map(energy, 0, 255, 50, 150);
      } else if (property === "rotation" || property === "direction") {
        energy = Math.round(this.p5_.map(energy, 0, 255, -180, 180));
      } else if (property === "tint") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 0, 360));
        energy = "hsb(" + energy + ",100%,100%)";
      }
      sprite[property] = energy;
    }, [property, range]);
    //behavior.func.name = "mapping" + property + range;
    this.addBehavior_(sprite, behavior);
  }

  stopMapping(sprite, property, range) {
    var behavior = new Behavior(sprite => {
      var energy = this.getEnergy(range);
      if (property === "x") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 50, 350));
      } else if (property === "y") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 350, 50));
      } else if (property === "scale") {
        energy = this.p5_.map(energy, 0, 255, 0.5, 1.5);
      } else if (property === "width" || property === "height") {
        energy = this.p5_.map(energy, 0, 255, 50, 159);
      } else if (property === "rotation" || property === "direction") {
        energy = Math.round(this.p5_.map(energy, 0, 255, -180, 180));
      } else if (property === "tint") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 0, 360));
        energy = "hsb(" + energy + ",100%,100%)";
      }
      sprite[property] = energy;
    }, [property, range]);
    //behavior.func.name = "mapping" + property + range;
    this.removeBehavior_(sprite, behavior);
  }

  changeColorBy(input, method, amount) {
    this.p5_.push();
    this.p5_.colorMode(this.p5_.HSB, 100);
    const c = this.p5_.color(input);
    const hsb = {
      hue: c._getHue(),
      saturation: c._getSaturation(),
      brightness: c._getBrightness()
    };
    hsb[method] = Math.round((hsb[method] + amount) % 100);
    const new_c = this.p5_.color(hsb.hue, hsb.saturation, hsb.brightness);
    this.p5_.pop();
    return new_c.toString('#rrggbb');
  }

  mixColors(color1, color2) {
    return this.p5_.lerpColor(this.p5_.color(color1), this.p5_.color(color2), 0.5).toString('#rrggbb');
  }

  randomColor() {
    return this.p5_.color('hsb(' + randomInt(0, 359) + ', 100%, 100%)').toString('#rrggbb');
  }

  spriteExists_(sprite) {
    return this.p5_.allSprites.indexOf(sprite) > -1;
  }

  updateEvents_() {
    const events = this.currentFrameEvents;
    const { analysis } = this.songMetadata_ || {};
    events.any = false;
    events['this.p5_.keyWentDown'] = {};
    events['Dance.fft.isPeak'] = {};
    events['cue-seconds'] = {};
    events['cue-measures'] = {};
    this.peakThisFrame_ = false;

    for (let key of WATCHED_KEYS) {
      if (this.p5_.keyWentDown(key)) {
        events.any = true;
        events['this.p5_.keyWentDown'][key] = true;
      }
    }

    const { length } = analysis || [];
    while (this.analysisPosition_ < length && analysis[this.analysisPosition_].time < this.getCurrentTime()) {
      const { centroid, energy, beats } = analysis[this.analysisPosition_];
      this.centroid_ = centroid;
      this.energy_ = energy;
      for (let range of WATCHED_RANGES) {
        if (beats[range]) {
          events.any = true;
          events['Dance.fft.isPeak'][range] = true;
          this.peakThisFrame_ = true;
        }
      }
      this.analysisPosition_++;
    }

    while (this.world.cues.seconds.length > 0 && this.world.cues.seconds[0] < this.getCurrentTime()) {
      events.any = true;
      events['cue-seconds'][this.world.cues.seconds.splice(0, 1)] = true;
    }

    while (this.world.cues.measures.length > 0 && this.world.cues.measures[0] < this.getCurrentMeasure()) {
      events.any = true;
      events['cue-measures'][this.world.cues.measures.splice(0, 1)] = true;
    }
  }

  registerValidation(callback) {
    this.world.validationCallback = callback;
  }

  draw() {
    this.updateEvents_();

    const context = {
      isPeak: this.peakThisFrame_,
      centroid: this.centroid_,
      backgroundColor: this.world.background_color,
      bpm: this.songMetadata_ && this.songMetadata_.bpm,
    };

    this.p5_.background(this.world.background_color || "white");
    if (this.world.bg_effect && this.world.fg_effect !== this.fgEffects_.none) {
      this.world.bg_effect.draw(context);
    }

    if (this.p5_.frameCount > 2) {
      // Perform sprite behaviors
      this.sprites_.forEach(function (sprite) {
        sprite.behaviors.forEach(function (behavior) {
          behavior.func.apply(null, [sprite].concat(behavior.extraArgs));
        });
      });
    }

    this.p5_.drawSprites();
    if (this.recordReplayLog_) {
      replayLog.logSprites(this.p5_);
    }

    if (this.world.fg_effect && this.world.fg_effect !== this.fgEffects_.none) {
      this.p5_.push();
      this.p5_.blendMode(this.fgEffects_.blend);
      this.world.fg_effect.draw(context);
      this.p5_.pop();
    }

    this.p5_.fill("black");
    this.p5_.textStyle(this.p5_.BOLD);
    this.p5_.textAlign(this.p5_.TOP, this.p5_.LEFT);
    this.p5_.textSize(20);

    this.world.validationCallback(this.world, this, this.sprites_);
    if (this.showMeasureLabel) {
      this.p5_.text("Measure: " + (Math.floor(this.getCurrentMeasure())), 10, 20);
    }

    if (this.currentFrameEvents.any && this.onHandleEvents) {
      this.onHandleEvents(this.currentFrameEvents);
    }
  }
};
