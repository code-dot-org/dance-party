const ASSET_BASE = "https://curriculum.code.org/images/sprites/dance_20181120/";

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
    // This function caches the animation data so multiple calls will not
    // result in multiple network requests. The animation data is presumed
    // to be fixed for the lifetime of the application.
    if (this.animationData_) {
      callback(this.animationData_);
      return;
    }
    this.p5_.loadJSON(`${this.assetBase_}characters.json`, (json) => {
      this.animationData_ = json;
      callback(this.animationData_);
    });
  }

  loadSpriteSheet(baseName, frameData) {
    return new Promise(resolve => {
      const spriteSheetUrl = `${this.assetBase_}${baseName}`;
      const resolveWithImageFromCache = () => {
        resolve(this.p5_.loadSpriteSheet(this.imageCache_[spriteSheetUrl], frameData));
      };
      if (this.imageCache_[spriteSheetUrl]) {
        resolveWithImageFromCache();
      } else {
        // Passing callback as the 3rd arg to loadSpriteSheet() indicates that we want
        // it to load the image as a Image (instead of a p5.Image), which avoids
        // a canvas creation. This makes it possible to run on mobile Safari in
        // iOS 12 with canvas memory limits.
        this.imageCache_[spriteSheetUrl] = this.p5_.loadImageElement(
          spriteSheetUrl,
          resolveWithImageFromCache
        );
      }
    });
  }
};
