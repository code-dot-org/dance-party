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

  async getAnimationData() {
    // This function caches the animation data so multiple calls will not
    // result in multiple network requests. The animation data is presumed
    // to be fixed for the lifetime of the application.
    if (!this.animationData_) {
      this.animationData_ = await new Promise((resolve, reject) => {
        this.p5_.loadJSON(`${this.assetBase_}characters.json`, resolve, reject);
      });
    }
    return this.animationData_;
  }

  /**
   * @param {string} baseName
   * @param {object} frameData
   * @returns {Promise<SpriteSheet>}
   */
  async loadSpriteSheet(baseName, frameData) {
    const spriteSheetUrl = `${this.assetBase_}${baseName}`;
    if (!this.imageCache_[spriteSheetUrl]) {
      this.imageCache_[spriteSheetUrl] = await this.loadImageElement(spriteSheetUrl);
    }
    return this.p5_.loadSpriteSheet(this.imageCache_[spriteSheetUrl], frameData);
  }

  /**
   * Wrap p5.loadImageElement so we return a Promise
   * @param {string} url
   * @returns {Promise<Image>}
   */
  loadImageElement(url) {
    return new Promise((resolve, reject) => {
      this.p5_.loadImageElement(url, resolve, reject);
    });
  }
};
