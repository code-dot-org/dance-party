const SOURCE_SIZE = 20;
const CACHED_SIZE = 300;
const LONG_MOVES = 12;
const EMPTY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const LONG_MOVE_FRAMES = [];
for (let frame = 0; frame < 24; frame++) {
  let row = Math.floor(frame / 6);
  let col = frame % 6;
  LONG_MOVE_FRAMES.push({
    name: frame,
    frame: {x: col * CACHED_SIZE / 2, y: row * CACHED_SIZE, w: CACHED_SIZE / 2, h: CACHED_SIZE},
    sourceSize: {h: CACHED_SIZE, w: CACHED_SIZE, x: 0, y: 0},
    spriteSourceSize: {h: CACHED_SIZE, w: CACHED_SIZE / 2, x: CACHED_SIZE / 4, y: 0}
  });
}

class SpritesheetBuilder {
  constructor(p5) {
    this.p5 = p5;

    this.cachedSvgImg = null;
    this.cache = {/*
      moveKey: Image (with png dataURI)
    */};
    this.moveQueue = [/*
      frameKey: `character_move_framenum`
    */];
    this.processQueue = this.processQueue.bind(this);
  }

  getSpriteSheet(character, moveIndex) {
    const spriteImage = this.getMove(character, moveIndex);
    return new this.p5.SpriteSheet(spriteImage, LONG_MOVE_FRAMES);
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
    this.cache[moveKey].width = 6 * CACHED_SIZE / 2;
    this.cache[moveKey].height = Math.ceil(moveFrames / 6) * CACHED_SIZE;
    this.cache[moveKey].src = EMPTY_PNG;

    this.moveQueue.push([moveKey, character, move, moveFrames]);
    if (this.moveQueue.length === 1) {
      this.startQueue();
    }
  }

  startQueue() {
    this.p5._incrementPreload();
    this.onStop = () => this.p5._decrementPreload();

    this.cachedSvgImg = new Image();
    this.canvas = document.createElement('canvas');
    this.canvas.width = CACHED_SIZE * 6 / 2;
    this.canvas.height = CACHED_SIZE * 4;
    this.context = this.canvas.getContext('2d');
    setTimeout(this.processQueue, 0);
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
      for (let frame = 0; frame < moveFrames; frame++) {
        let row = Math.floor(frame / 6);
        let col = frame % 6;
        this.context.drawImage(this.cachedSvgImg,
          (frame + 0.25) * SOURCE_SIZE, move * SOURCE_SIZE, SOURCE_SIZE / 2, SOURCE_SIZE,
          col * CACHED_SIZE / 2, row * CACHED_SIZE, CACHED_SIZE / 2, CACHED_SIZE
        );
      }
      // this.context.drawImage(this.cachedSvgImg, 0, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, 0, CACHED_ROW_SIZE, CACHED_SIZE);
      // this.context.drawImage(this.cachedSvgImg, SOURCE_ROW_SIZE, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, CACHED_SIZE, CACHED_ROW_SIZE, CACHED_SIZE);
      // if (moveFrames > 12) {
      //   this.context.drawImage(this.cachedSvgImg, 2 * SOURCE_ROW_SIZE, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, 2 * CACHED_SIZE, CACHED_ROW_SIZE, CACHED_SIZE);
      //   this.context.drawImage(this.cachedSvgImg, 3 * SOURCE_ROW_SIZE, move * SOURCE_SIZE, SOURCE_ROW_SIZE, SOURCE_SIZE, 0, 3 * CACHED_SIZE, CACHED_ROW_SIZE, CACHED_SIZE);
      // }
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

module.exports = SpritesheetBuilder;
