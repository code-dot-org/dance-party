const {SPRITE_NAMES, MOVE_NAMES} = require('../../src/constants');

module.exports = class UnitTestResourceLoader {
  constructor(spriteNames = SPRITE_NAMES, moveNames = MOVE_NAMES) {
    this.p5_ = null;
    this.spriteNames_ = spriteNames;
    this.moveNames_ = moveNames;
  }

  initWithP5(p5) {
    this.p5_ = p5;
  }

  getAnimationData(callback) {
    const data = {};
    for (let costume of this.spriteNames_) {
      costume = costume.toLowerCase();
      data[costume] = {};
      for (let move of this.moveNames_) {
        move = move.name.toLowerCase();
        data[costume][move] = {};
      }
    }
    callback(data);
  }

  loadSpriteSheet(baseName, frameData) {
    return this.p5_.loadSpriteSheet(new Image(), frameData, true);
  }
};
