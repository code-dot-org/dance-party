const ASSET_BASE = "https://curriculum.code.org/images/sprites/dance_grouped/";

/**
 * The resource loader class abstracts network-dependent operations, allowing
 * us to provide custom behavior in tests - loading local fixtures in integration tests,
 * or isolating from the network entirely in unit tests.
 * @type {module.ResourceLoader}
 */
module.exports = class ResourceLoader {
  constructor(assetBase = ASSET_BASE) {
    this.p5_ = null;
    this.assetBase_ = assetBase;
    this.imageCache_ = {};
  }

  initWithP5(p5) {
    this.p5_ = p5;
  }

  getAnimationData(callback) {
    this.p5_.loadJSON(`${this.assetBase_}characters.json`, callback);
  }

  loadSpriteSheet(baseName, frameData) {
    // Passing true as the 3rd arg to loadSpriteSheet() indicates that we want
    // it to load the image as a Image (instead of a p5.Image), which avoids
    // a canvas creation. This makes it possible to run on mobile Safari in
    // iOS 12 with canvas memory limits.
    const spriteSheetUrl = `${this.assetBase_}${baseName}`;
    if (!this.imageCache_[spriteSheetUrl]) {
      this.imageCache_[spriteSheetUrl] = this.p5_.loadImageElement(spriteSheetUrl);
    }
    return this.p5_.loadSpriteSheet(this.imageCache_[spriteSheetUrl], frameData);
  }
};
