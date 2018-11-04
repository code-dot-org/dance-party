const FRAMES_PER_ROW = 6;
const SOURCE_SIZE = 20;
const SOURCE_ROW_SIZE = FRAMES_PER_ROW * SOURCE_SIZE;
const CACHED_SIZE = 300;
const CACHED_ROW_SIZE = FRAMES_PER_ROW * CACHED_SIZE;
const LONG_MOVES = 12;
const EMPTY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

class Rasterizer {
  constructor(onStop) {
    this.onStop = onStop;
    this.cachedSvgImg = null;
    this.cache = {/*
      moveKey: CanvasElement (rasterized)
    */};
    this.moveQueue = [/*
      frameKey: `character_move_framenum`
    */];
    this.processQueue = this.processQueue.bind(this);
  }

  getMove(character, move) {
    const moveKey = `${character}_${move}`;
    if (!this.cache[moveKey]) {
      this.generateMove(character, move, moveKey);
    }
    return this.cache[moveKey];
  }

  generateMove(character, move, moveKey) {
    console.count('generateMove');
    // Synchronously generate an empty canvas for p5.play to use
    // Kick off asynchronous rasterize step
    const moveFrames = move < LONG_MOVES ? 24 : 12;
    // base64-encoded PNG transparent pixel
    this.cache[moveKey] = new Image();
    this.cache[moveKey].width = 6 * CACHED_SIZE;
    this.cache[moveKey].height = Math.ceil(moveFrames / 6) * CACHED_SIZE;
    this.cache[moveKey].src = EMPTY_PNG;

    this.moveQueue.push([moveKey, character, move, moveFrames]);
    if (this.moveQueue.length === 1) {
      this.cachedSvgImg = new Image();
      this.canvas = document.createElement('canvas');
      this.canvas.width = CACHED_SIZE * 6;
      this.canvas.height = CACHED_SIZE * 4;
      this.context = this.canvas.getContext('2d');
      setTimeout(this.processQueue, 0);
    }
  }

  processQueue() {
    if (this.moveQueue.length <= 0) {
      console.log('done');
      delete this.context;
      delete this.canvas;
      delete this.cachedSvgImg;
      if (typeof this.onStop === 'function') {
        this.onStop();
      }
      return;
    }

    this.rasterizeMove(this.moveQueue[0], () => {
      this.moveQueue.shift();
      setTimeout(this.processQueue, 0);
    });
  }

  rasterizeMove(moveData, callback) {
    const [moveKey, character, move, moveFrames] = moveData;
    // const moveName = window.nativeAPI.world.MOVE_NAMES[move].name;
    // const svgUrl = `assets/${character.toLowerCase()}.svg#${moveName}`;
    const svgUrl = `assets/${character.toLowerCase()}.svg`;

    const rasterize = () => {
      console.count('rasterize');
      this.context.clearRect(0, 0, CACHED_SIZE * 6, CACHED_SIZE * 4);
      this.context.drawImage(this.cachedSvgImg, 0, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, 0, CACHED_ROW_SIZE, CACHED_SIZE);
      this.context.drawImage(this.cachedSvgImg, SOURCE_ROW_SIZE, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, CACHED_SIZE, CACHED_ROW_SIZE, CACHED_SIZE);
      if (moveFrames > 12) {
        this.context.drawImage(this.cachedSvgImg, 2 * SOURCE_ROW_SIZE, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, 2 * CACHED_SIZE, CACHED_ROW_SIZE, CACHED_SIZE);
        this.context.drawImage(this.cachedSvgImg, 3 * SOURCE_ROW_SIZE, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, 3 * CACHED_SIZE, CACHED_ROW_SIZE, CACHED_SIZE);
      }
      this.cache[moveKey].src = this.canvas.toDataURL();
      callback();
    };

    const skip = () => {
      console.log(`Couldn't load '${svgUrl}'. Skipping...`);
      callback();
    };

    if (this.cachedSvgImg.src !== svgUrl) {
      this.cachedSvgImg.onload = rasterize;
      this.cachedSvgImg.onerror = skip;
      this.cachedSvgImg.src = svgUrl;
    } else {
      rasterize();
    }
  }
}

module.exports = Rasterizer;
