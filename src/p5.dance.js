/* eslint-disable no-unused-vars, curly, eqeqeq, babel/semi, semi, no-undef */
/* global p5, Dance, validationProps */
const P5 = require('./loadP5');
const Effects = require('./Effects');
const replayLog = require('./replay');
const constants = require('./constants');
const modifySongData = require('./modifySongData');
const ResourceLoader = require('./ResourceLoader');

function Behavior(func, id, extraArgs) {
  if (!extraArgs) {
    extraArgs = [];
  }
  this.func = func;
  this.id = id;
  this.extraArgs = extraArgs;
}

const WATCHED_KEYS = [
  'up', 'left', 'down', 'right', 'space', 'enter',
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ...'0123456789'.split('')
];
const WATCHED_RANGES = [0, 1, 2];

const SIZE = constants.SIZE;
const FRAMES = constants.FRAMES;

// NOTE: min and max are inclusive
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = class DanceParty {
  constructor({
    onHandleEvents,
    onInit,
    onPuzzleComplete,
    playSound,
    recordReplayLog,
    showMeasureLabel = true,
    container,
    spriteConfig,
    i18n = {
      measure: () => "Measure:",
    },
    // For testing: Can provide a custom resource loader class
    // to load fixtures and/or isolate us entirely from network activity
    resourceLoader = new ResourceLoader()
  }) {
    this.onHandleEvents = onHandleEvents;
    this.onInit = onInit;
    this.showMeasureLabel = showMeasureLabel;
    this.i18n = i18n;
    this.resourceLoader_ = resourceLoader;

    const containerElement = document.getElementById(container);
    this.rtl = containerElement && window.getComputedStyle(containerElement).direction === "rtl";

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
    this.performanceData_ = {
      // Time from the start of document load to the init() callback
      initTime: null,
      // Time play() was last called
      lastPlayCall: null,
      // Time between last play() call and last time the song actually started playing
      lastPlayDelay: null,
      // Number of frame rate samples taken since last run
      frameRateSamples: 0,
      // Maximum frame rate recorded since last run
      frameRateMax: -Infinity,
      // Minimum frame rate recorded since last run
      frameRateMin: Infinity,
      // Average frame rate recorded since last run
      frameRateMean: 0
    };

    this.world.SPRITE_NAMES = constants.SPRITE_NAMES;
    this.world.MOVE_NAMES = constants.MOVE_NAMES;

    if (spriteConfig) {
      spriteConfig(this.world);
    }

    // Initialize animations object with empty arrays for each character
    this.animations = {};
    this.world.SPRITE_NAMES.forEach(costume=> {
      this.animations[costume] = [];
    });

    // Sort after spriteConfig function has executed to ensure that
    // rest moves are at the beginning and shortBurst moves are all at the end

    // We can't use Array.sort() : see https://stackoverflow.com/q/3026281
    const restMoves = this.world.MOVE_NAMES.filter(move => move.rest);
    const nonRestingFullLengthMoves = this.world.MOVE_NAMES.filter(move => !move.rest && !move.shortBurst);
    const shortBurstMoves = this.world.MOVE_NAMES.filter(move => move.shortBurst);
    this.world.MOVE_NAMES = [
      ...restMoves,
      ...nonRestingFullLengthMoves,
      ...shortBurstMoves,
    ];
    this.world.restMoveCount = restMoves.length;
    this.world.fullLengthMoveCount = restMoves.length + nonRestingFullLengthMoves.length;

    this.songStartTime_ = 0;

    new P5(p5Inst => {
      this.p5_ = p5Inst;
      this.resourceLoader_.initWithP5(p5Inst);
      this.sprites_ = p5Inst.createGroup();
      p5Inst.setup = () => this.setup();
      p5Inst.draw = () => this.draw();
      //Allows the sprite width and height to be set independently
      this.p5_._fixedSpriteAnimationFrameSizes = true;
    }, container);
  }

  teardown() {
    this.p5_.remove();
  }

  /**
   * Make sure the requested costume-move animations are loaded and ready to use.
   *
   * This should always be called before play().
   *
   * @param {Array.<string>} costumeNames to load - if omitted, all costumes
   *   will be loaded.
   * @returns {Promise} resolved when the requested costumes are loaded and
   *   ready to use.
   */
  async ensureSpritesAreLoaded(costumeNames = this.world.SPRITE_NAMES) {
    this.allSpritesLoaded = false;
    const animationData = await this.resourceLoader_.getAnimationData();
    await Promise.all(costumeNames.map((costume) => {
      const costumeData = animationData[costume.toLowerCase()];
      return this.loadCostumeAnimations(costume, costumeData);
    }));
    this.allSpritesLoaded = true;
  }

  async loadCostumeAnimations(costume, costumeData) {
    if (this.animations[costume].length === this.world.MOVE_NAMES.length) {
      // Already loaded, nothing to do:
      return;
    }

    await Promise.all(this.world.MOVE_NAMES.map(({name: moveName, mirror}, moveIndex) => {
      const moveData = costumeData[moveName.toLowerCase()];
      return this.loadMoveAnimation(
        costume,
        Object.assign({moveName, moveIndex, mirror}, moveData)
      );
    }));
  }

  async loadMoveAnimation(costume, {moveName, moveIndex, spritesheet, frames, mirror}) {
    const spriteSheet = await this.resourceLoader_.loadSpriteSheet(spritesheet, frames);
    const animation = this.p5_.loadAnimation(spriteSheet);
    this.setAnimationSpriteSheet(
      costume,
      moveIndex,
      spriteSheet,
      mirror,
      animation
    );
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
      getAvailableSpriteNames: () => (
        Object.entries(this.animations)
          .filter(keyval => keyval[1].length > 0)
          .map(keyval => keyval[0])
      ),
      getPerformanceData: () => Object.assign({}, this.performanceData_),
    };
  }

  pass() {
    this.onPuzzleComplete_(true);
  }

  fail(message) {
    this.onPuzzleComplete_(false, message);
  }

  /**
   * @param {Object} timestamps
   * @param {number[]} timestamps.measures
   * @param {number[]} timestamps.seconds
   */
  addCues(timestamps) {
    // Sort cues
    const numSort = (a,b) => a - b;

    this.world.cues.measures = timestamps.measures.sort(numSort);
    this.world.cues.seconds = timestamps.seconds.sort(numSort);
  }

  reset() {
    this.allSpritesLoaded = false;
    this.songStartTime_ = 0;
    this.analysisPosition_ = 0;
    while (this.p5_.allSprites.length > 0) {
      this.p5_.allSprites[0].remove();
    }
    this.p5_.noLoop();

    this.world.background_color = null;
    this.world.fg_effect = null;
    this.world.bg_effect = null;
  }

  setAnimationSpriteSheet(sprite, moveIndex, spritesheet, mirror, animation){
    this.animations[sprite][moveIndex] = {
      spritesheet: spritesheet,
      mirror,
      animation: animation || 'missing',
    };
  }

  setup() {
    this.bgEffects_ = new Effects(this.p5_, 1);
    this.fgEffects_ = new Effects(this.p5_, 0.8);

    this.performanceData_.initTime = timeSinceLoad();
    this.onInit && this.onInit(this);
  }

  getBackgroundEffect() {
    return this.bgEffects_[this.world.bg_effect || 'none'];
  }

  getForegroundEffect() {
    if (this.world.fg_effect && this.world.fg_effect !== null && this.world.fg_effect !== 'none') {
      return this.fgEffects_[this.world.fg_effect];
    }
  }

  play(songData, callback) {
    if (!this.allSpritesLoaded) {
      throw new Error('play() called before ensureSpritesAreLoaded() has completed!');
    }

    this.resetPerformanceDataForRun_();
    if (this.recordReplayLog_) {
      replayLog.reset();
    }
    this.songMetadata_ = modifySongData(songData);
    this.analysisPosition_ = 0;
    this.playSound_(this.songMetadata_.file, playSuccess => {
      this.songStartTime_ = new Date();
      this.performanceData_.lastPlayDelay = timeSinceLoad() - this.performanceData_.lastPlayCall;
      callback && callback(playSuccess);
    }, () => {
      this.reset();
    });
    this.p5_.loop();
  }

  setBackground(color) {
    // Clear background effect so it doesn't cover up background color.
    this.world.bg_effect = null;
    this.world.background_color = color;
  }

  setBackgroundEffect(effect, palette = 'default') {
    if (constants.RANDOM_EFFECT_KEY === effect) {
      effect = this.bgEffects_.randomBackgroundEffect();
    }
    if (constants.RANDOM_EFFECT_KEY === palette) {
      palette = this.bgEffects_.randomBackgroundPalette();
    }
    this.world.bg_effect = effect;
    this.bgEffects_.currentPalette = palette;

    if (this.bgEffects_[effect].init) {
      this.bgEffects_[effect].init();
    }
  }

  setForegroundEffect(effect) {
    if (constants.RANDOM_EFFECT_KEY === effect) {
      effect = this.fgEffects_.randomForegroundEffect();
    }
    this.world.fg_effect = effect;

    if (this.fgEffects_[effect].init) {
      this.fgEffects_[effect].init();
    }
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
    this.getGroupByName_(costume).add(sprite);

    sprite.mirroring = 1;
    sprite.looping_move = 0;
    sprite.looping_frame = 0;
    sprite.current_move = 0;
    sprite.previous_move = 0; // I don't think this is used?

    for (var i = 0; i < this.animations[costume].length; i++) {
      sprite.addAnimation("anim" + i, this.animations[costume][i].animation);
    }
    sprite.animation.stop();
    this.sprites_.add(sprite);
    sprite.speed = 10;
    sprite.sinceLastFrame = 0;
    sprite.dance_speed = 1;
    sprite.previous_speed = 1;
    sprite.behaviors = [];

    // Add behavior to control animation
    const updateSpriteFrame = () => {
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
          if (this.animations[sprite.style][sprite.current_move].mirror) {
            sprite.mirroring *= -1;
          }
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
    };

    this.addBehavior_(sprite, new Behavior(updateSpriteFrame, 'updateSpriteFrame'));

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
      this.adjustSpriteDepth_(sprite);
    };
    sprite.setScale = function (scale) {
      sprite.scale = scale;
      this.adjustSpriteDepth_(sprite);
    };

    this.adjustSpriteDepth_(sprite);

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

  /**
   * Returns a next/prev/rand move
   * @param {string} requestedChange - 'prev'/'next'/'rand' move request
   * @param {number} currentMove - value representing current move of sprite
   * @param {boolean} doMoveMode - is this coming from a doMove request
   */
  getNewChangedMove(requestedChange, currentMove, doMoveMode) {
    // Number of valid full length moves
    const { fullLengthMoveCount, restMoveCount } = this.world;
    const firstNonRestingMoveIndex = restMoveCount;
    // The "rest" moves are assumed to always be at the beginning
    const nonRestingFullLengthMoveCount = fullLengthMoveCount - restMoveCount;
    const selectableMoves = doMoveMode ? this.world.MOVE_NAMES.length : nonRestingFullLengthMoveCount;
    if (selectableMoves <= 1) {
      throw new Error("next/prev/rand requires that we have 2 or more selectable moves");
    }
    let move = currentMove;
    if (requestedChange === "next" && !doMoveMode) {
      move = currentMove + 1;
      if (move >= fullLengthMoveCount) {
        move = firstNonRestingMoveIndex;
      }
    } else if (requestedChange === "prev" && !doMoveMode) {
      move = currentMove - 1;
      if (move < firstNonRestingMoveIndex) {
        move = fullLengthMoveCount - 1;
      }
    } else if (requestedChange === "rand" && !doMoveMode) {
      // Make sure random switches to a new move from the full length non resting options
      while (move === currentMove) {
        move = randomInt(this.world.restMoveCount, this.world.fullLengthMoveCount - 1);
      }
    } else if (requestedChange === "rand" && doMoveMode) {
      // Make sure random switches to a new move
      while (move === currentMove) {
        move = randomInt(0, this.world.MOVE_NAMES.length - 1);
      }
    } else {
      throw new Error(`Unexpected requestedChange value: ${requestedChange}`);
    }
    return move;
  }

  changeMoveLR(sprite, move, dir) {
    if (!this.spriteExists_(sprite)) {
      return;
    }
    // Number of valid full length moves
    const { fullLengthMoveCount } = this.world;
    if (typeof move === 'number') {
      if (move < 0 || move >= fullLengthMoveCount) {
        throw new Error("Not moving to a valid full length move index!");
      }
    } else {
      move = this.getNewChangedMove(move, sprite.current_move, false);
    }
    sprite.mirroring = dir;
    sprite.mirrorX(dir);
    sprite.changeAnimation("anim" + move);
    if (sprite.animation.looping) {
      sprite.looping_frame = 0;
    }
    sprite.animation.looping = true;
    sprite.current_move = move;
  }

  doMoveLR(sprite, move, dir) {
    if (!this.spriteExists_(sprite)) {
      return;
    }
    if (typeof move === 'number') {
      if (move < 0 || move >= this.world.MOVE_NAMES.length) {
        throw new Error(`Invalid move index: ${move}`);
      }
    } else {
      move = this.getNewChangedMove(move, sprite.current_move, true);
    }
    // Short burst moves start in the middle of the animation so sometimes
    // they don't appear to line up with the requested direction.
    // We've custom-authored which ones should be flipped in this case.
    if (this.world.MOVE_NAMES[move].burstReversed) {
      dir = -dir;
    }
    sprite.mirrorX(dir);
    sprite.changeAnimation("anim" + move);
    sprite.animation.looping = false;
    // For non-shortBurst, we jump to the middle of the animation
    const frameNum = this.world.MOVE_NAMES[move].shortBurst ? 0 : (FRAMES / 2);
    sprite.animation.changeFrame(frameNum);
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
    if (group === "all") {
      return this.p5_.allSprites;
    }

    if (!this.sprites_by_type_.hasOwnProperty(group)) {
      this.sprites_by_type_[group] = this.p5_.createGroup();
    }
    return this.sprites_by_type_[group];
  }

  changeMoveEachLR(group, move, dir) {
    group = this.getGroupByName_(group);
    if ((move === "rand") && (group.length>0)) {
      move = this.getNewChangedMove(move, group[0].current_move, false);
    }
    group.forEach(sprite => {
      this.changeMoveLR(sprite, move, dir);
    });
  }

  doMoveEachLR(group, move, dir) {
    group = this.getGroupByName_(group);
    if ((move === "rand") && (group.length>0)) {
      move = this.getNewChangedMove(move, group[0].current_move, true);
    }
    group.forEach(sprite => {
      this.doMoveLR(sprite, move, dir);
    });
  }

  /**
   * Given a group with an abitrary number of sprites, arrange them in a particular
   * layout. This is likely to change some or all of position/rotation/scale for
   * the sprites in the group.
   */
  layoutSprites(group, format) {
    group = this.getGroupByName_(group);

    // Begin by resizing the entire group.
    group.forEach(sprite => this.setProp(sprite, 'scale', 30));

    const count = group.length;
    const minX = 20;
    const maxX = 400 - minX;
    const minY = 35;
    const maxY = 400 - 40;
    const radiansToDegrees = 180 / Math.PI;
    const maxCircleRadius = 165;

    if (format === "circle") {
      // Adjust radius of circle and size of the sprite according to number of
      // sprites in our group.
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
          Math.PI / 2,  // below
          -Math.PI,     // left
          0             // right
        ][i % 4];
        const ringRadius = this.p5_.lerp(0, maxRadius, ring / numRings);

        sprite.x = 200 + ringRadius * Math.cos(angle);
        sprite.y = 200 + ringRadius * Math.sin(angle);
        sprite.rotation = 0;
      });
    } else if (format === 'x') {
      const pct = this.p5_.constrain(count / 10, 0, 1);
      // We can have a bigger radius here since we're going to the corners.
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
      // Create a grid where the width is the square root of the count, rounded up,
      // and the height is the number of rows needed to fill in count cells.
      // For our last row, we might have empty cells in our grid (but the row
      // structure will be the same).
      const numCols = Math.ceil(Math.sqrt(count));
      const numRows = Math.ceil(count / numCols);
      group.forEach((sprite, i) => {
        const row = Math.floor(i / numCols);
        const col = i % numCols;
        // || 0 so that we recover from div 0.
        sprite.x = this.p5_.lerp(minX, maxX, col / (numCols - 1) || 0);
        sprite.y = this.p5_.lerp(minY, maxY, row / (numRows - 1) || 0);
        sprite.rotation = 0;
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
        sprite.rotation = 0;
      });
    } else if (format === "row") {
      for (let i=0; i<count; i++) {
        const sprite = group[i];
        sprite.x = (i+1) * (400 / (count + 1));
        sprite.y = 200;
        sprite.rotation = 0;
      }
    } else if (format === "column") {
      for (let i=0; i<count; i++) {
        const sprite = group[i];
        sprite.x = 200;
        sprite.y = (i+1) * (400 / (count + 1));
        sprite.rotation = 0;
      }
    } else if (format === "border") {
      // First fill the four corners.
      // Then split remainder into 4 groups. Distribute group one along the top,
      // group 2 along the right, etc.
      if (count > 0) {
        group[0].x = minX;
        group[0].y = minY;
        group[0].rotation = 0;
      }
      if (count > 1) {
        group[1].x = maxX;
        group[1].y = minY;
        group[1].rotation = 0;
      }
      if (count > 2) {
        group[2].x = maxX;
        group[2].y = maxY;
        group[2].rotation = 0;
      }
      if (count > 3) {
        group[3].x = minX;
        group[3].y = maxY;
        group[3].rotation = 0;
      }
      if (count > 4) {
        const topCount = Math.ceil((count - 4 - 0) / 4);
        const rightCount = Math.ceil((count - 4 - 1) / 4);
        const bottomCount = Math.ceil((count - 4 - 2) / 4);
        const leftCount = Math.ceil((count - 4 - 3) / 4);

        for (let i = 0; i < topCount; i++) {
          const sprite = group[4 + i];
          // We want to include the corners in our total count so that the first
          // inner sprite is > 0 and the last inner sprite is < 1 when we lerp.
          sprite.x = this.p5_.lerp(minX, maxX, (i + 1) / (topCount + 1));
          sprite.y = minY
          sprite.rotation = 0;
        }

        for (let i = 0; i < rightCount; i++) {
          const sprite = group[4 + topCount + i];
          sprite.x = maxX;
          sprite.y = this.p5_.lerp(minY, maxY, (i + 1) / (rightCount + 1));
          sprite.rotation = 0;
        }

        for (let i = 0; i < bottomCount; i++) {
          const sprite = group[4 + topCount + rightCount + i];
          sprite.x = this.p5_.lerp(minX, maxX, (i + 1) / (bottomCount + 1));
          sprite.y = maxY;
          sprite.rotation = 0;
        }

        for (let i = 0; i < leftCount; i++) {
          const sprite = group[4 + topCount + rightCount + bottomCount + i];
          sprite.x = minX;
          sprite.y = this.p5_.lerp(minY, maxY, (i + 1) / (leftCount + 1));
          sprite.rotation = 0;
        }
      }
    } else if (format === "random") {
      group.forEach(function (sprite) {
        sprite.x = randomInt(minX, maxX);
        sprite.y = randomInt(minY, maxY);
        sprite.rotation = 0;
      });
    } else {
      throw new Error('Unexpected format: ' + format);
    }

    // We want sprites that are lower in the canvas to show up on top of those
    // that are higher.
    // We also add a fractional component based on x to avoid z-fighting (except
    // in cases where we have identical x and y).
    group.forEach(sprite => {
      this.adjustSpriteDepth_(sprite);
    });
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
      this.adjustSpriteDepth_(sprite);
    } else if (property === "width" || property === "height") {
      sprite[property] = SIZE * (val / 100);
    } else if (property === "y") {
      sprite.y = this.world.height - val;
      this.adjustSpriteDepth_(sprite);
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
      this.adjustSpriteDepth_(sprite);
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
    this.adjustSpriteDepth_(sprite);
  }

  setDanceSpeed(sprite, speed) {
    if (!this.spriteExists_(sprite)) return;
    sprite.dance_speed = speed;
  }

  setDanceSpeedEach(group, val) {
    this.setPropEach(group, "dance_speed", val);
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

  adjustSpriteDepth_(sprite) {
    if (!this.spriteExists_(sprite)) {
      return;
    }

    // Bias scale heavily (especially since it largely hovers around 1.0) but use
    // Y coordinate as the first tie-breaker and X coordinate as the second.
    // (Both X and Y range from 0-399 pixels.)
    sprite.depth =
      10000 * sprite.scale +
      100 * sprite.y / 400 +
      1 * sprite.x / 400;
  }

  // Behaviors

  /**
   * @param {Sprite} sprite
   * @param {Behavior} behavior
   */
  addBehavior_(sprite, behavior) {
    if (!this.spriteExists_(sprite) || behavior === undefined) {
      return;
    }

    if (sprite.behaviors.find(b => b.id === behavior.id)) {
      return;
    }
    sprite.behaviors.push(behavior);
  }

  /**
   * @param {Sprite} sprite
   * @param {string} behaviorId
   */
  removeBehavior_(sprite, behaviorId) {
    if (!this.spriteExists_(sprite)) {
      return;
    }

    const index = sprite.behaviors.findIndex(b => b.id === behaviorId);
    if (index === -1) {
      return;
    }
    sprite.behaviors.splice(index, 1);
  }

  /**
   * @param {Sprite} sprite
   * @param {string} property
   * @param {string} range
   */
  startMapping(sprite, property, range) {
    if (!sprite) {
      return;
    }

    // id's should be the same as long as the property/range are the same. they
    // need not be unique across sprites
    const id = [property, range].join('-');

    // Grab the initial value so that changes can be relative
    const initialValue = sprite[property];
    const behavior = new Behavior(sprite => {
      let energy = this.getEnergy(range);
      if (property === "x" || property === "y") {
        energy = Math.round(this.p5_.map(energy, 0, 255, initialValue - 100, initialValue + 100));
      } else if (property === "scale" || property === "width" || property === "height") {
        energy = this.p5_.map(energy, 0, 255, initialValue * 0.5, initialValue * 1.5);
      } else if (property === "rotation") {
        energy = Math.round(this.p5_.map(energy, 0, 255, initialValue - 60, initialValue + 60));
      } else if (property === "tint") {
        energy = Math.round(this.p5_.map(energy, 0, 255, 0, 360));
        energy = "hsb(" + energy + ",100%,100%)";
      }
      sprite[property] = energy;
      this.adjustSpriteDepth_(sprite);
    }, id, [property, range]);
    this.addBehavior_(sprite, behavior);
  }

  stopMapping(sprite, property, range) {
    const id = [property, range].join('-');
    this.removeBehavior_(sprite, id);
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

  /**
   * @return {Object} TODO: describe
   */
  updateEvents_() {
    const { analysis } = this.songMetadata_ || {};

    // Will potentially set the following:
    // this.p5_.keyWentDown
    // Dance.fft.isPeak
    // cue-seconds
    // cue-measures
    const events = {};
    this.peakThisFrame_ = false;

    for (let key of WATCHED_KEYS) {
      if (this.p5_.keyWentDown(key)) {
        events['this.p5_.keyWentDown'] = events['this.p5_.keyWentDown'] || {}
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
          events['Dance.fft.isPeak'] = events['Dance.fft.isPeak'] || {}
          events['Dance.fft.isPeak'][range] = true;
          this.peakThisFrame_ = true;
        }
      }
      this.analysisPosition_++;
    }

    while (this.world.cues.seconds.length > 0 && this.world.cues.seconds[0] < this.getCurrentTime()) {
      events['cue-seconds'] = events['cue-seconds'] || {}
      events['cue-seconds'][this.world.cues.seconds.splice(0, 1)] = true;
    }

    while (this.world.cues.measures.length > 0 && this.world.cues.measures[0] < this.getCurrentMeasure()) {
      events['cue-measures'] = events['cue-measures'] || {};
      events['cue-measures'][this.world.cues.measures.splice(0, 1)] = true;
    }

    return events;
  }

  resetPerformanceDataForRun_() {
    this.performanceData_.lastPlayCall = timeSinceLoad();
    this.performanceData_.lastPlayDelay = null;
    this.performanceData_.frameRateSamples = 0;
    this.performanceData_.frameRateMax = -Infinity;
    this.performanceData_.frameRateMin = Infinity;
    this.performanceData_.frameRateMean = 0;
  }

  sampleFrameRate_() {
    // Sampling rate: Every 15 frames, roughly twice per second.
    if (this.p5_.frameCount % 15 !== 0) {
      return;
    }

    const frameRate = this.p5_.frameRate();
    this.performanceData_.frameRateMax = Math.max(this.performanceData_.frameRateMax, frameRate);
    this.performanceData_.frameRateMin = Math.min(this.performanceData_.frameRateMin, frameRate);
    this.performanceData_.frameRateMean =
      (frameRate + this.performanceData_.frameRateSamples * this.performanceData_.frameRateMean) /
      (this.performanceData_.frameRateSamples + 1);
    this.performanceData_.frameRateSamples++;
  }

  registerValidation(callback) {
    this.world.validationCallback = callback;
  }

  draw() {
    const { bpm, artist, title } = this.songMetadata_ || {};

    const context = {
      isPeak: this.peakThisFrame_,
      centroid: this.centroid_,
      backgroundColor: this.world.background_color,
      bpm,
      artist,
      title,
    };

    this.p5_.background('#fff'); // Clear the canvas.
    this.getBackgroundEffect().draw(context);

    if (!this.allSpritesLoaded) {
      return;
    }

    const events = this.updateEvents_();
    this.sampleFrameRate_();

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
      replayLog.logFrame({
        bg: this.world.bg_effect,
        context,
        fg: this.world.fg_effect,
        p5: this.p5_,
        palette: this.bgEffects_.currentPalette,
      });
    }

    if (this.getForegroundEffect()) {
      this.p5_.push();
      this.p5_.blendMode(this.fgEffects_.blend);
      this.getForegroundEffect().draw(context);
      this.p5_.pop();
    }

    this.world.validationCallback(this.world, this, this.sprites_, events);
    if (this.showMeasureLabel && this.getCurrentMeasure() >= 1) {
      const text = `${this.i18n.measure()} ${Math.floor(Math.max(0, this.getCurrentMeasure()))}`;

      // Calculate text width.
      this.p5_.textStyle(this.p5_.BOLD);
      this.p5_.textSize(20);
      const textWidth = this.p5_.textWidth(text);

      // Background rectangle.
      this.p5_.noStroke();
      this.p5_.fill("rgba(255,255,255,.8)");
      if (this.rtl) {
        this.p5_.rect(399 - 13 - textWidth, 4, textWidth + 10, 28);
      } else {
        this.p5_.rect(4, 4, this.p5_.textWidth(text) + 10, 28);
      }

      // The text.
      this.p5_.fill("#333");
      if (this.rtl) {
        this.p5_.text(text, 399 - 9, 25);
      } else {
        this.p5_.text(text, 9, 25);
      }
    }

    if (Object.keys(events).length && this.onHandleEvents) {
      this.onHandleEvents(events);
    }
  }
};

function queryParam(key) {
  const pair = window.location.search
    .slice(1)
    .split('&')
    .map(pair => pair.split('='))
    .find(pair => decodeURIComponent(pair[0]) === key);
  if (pair) {
    return decodeURIComponent(pair[1]);
  }
  return undefined;
}

function timeSinceLoad() {
  if (typeof performance !== 'undefined') {
    return performance.now()
  } else if (typeof process !== 'undefined') {
    return process.hrtime();
  }
  return 0;
}
