const SOURCE_SIZE = 20;
const CACHED_SIZE = 300;
const LONG_MOVES = 12;

class Rasterizer {
  constructor() {
    this.svgImgCache = {/*
      character: Image (svg)
    */};
    this.cache = {/*
      moveKey: CanvasElement (rasterized)
    */};
    this.moveQueue = [/*
      frameKey: `character_move_framenum`
    */];
  }

  processQueue() {
    if (this.moveQueue.length <= 0) {
      return;
    }

    console.log('Queue depth: ' + this.moveQueue.length);
    this.rasterizeMove(this.moveQueue[0], () => {
      this.moveQueue.shift();
      setTimeout(() => this.processQueue(), 66);
    });
  }

  getSvgImg(character) {
    return this.svgImgCache[character] = this.svgImgCache[character] || new Image();
  }

  rasterizeMove(moveKey, callback) {
    let [character, move] = moveKey.split('_');
    move = parseInt(move, 10);
    const moveFrames = move < LONG_MOVES ? 24 : 12;
    const svgImg = this.getSvgImg(character);
    const canvas = document.createElement('canvas');
    canvas.width = moveFrames * CACHED_SIZE;
    canvas.height = CACHED_SIZE;

    const rasterize = () => {
      console.timeStamp('Rasterizing ' + moveKey);
      canvas.getContext('2d').drawImage(svgImg, 0, move * SOURCE_SIZE, moveFrames * SOURCE_SIZE, SOURCE_SIZE, 0, 0, moveFrames * CACHED_SIZE, CACHED_SIZE);
      this.cache[moveKey] = canvas;
      callback();
    };

    if (imgLoaded(svgImg)) {
      rasterize();
    } else {
      svgImg.onload = rasterize;
      svgImg.src = `assets/${character}.svg`;
    }
  }

  getMove(character, move) {
    const moveKey = `${character}_${move}`;
    if (this.cache[moveKey]) {
      return this.cache[moveKey];
    }

    if (!this.moveQueue.includes(moveKey)) {
      this.moveQueue.push(moveKey);
      this.processQueue();
    }
    return null;
  }
}

const rasterizer = new Rasterizer();

class Move {
  constructor() {
    this.defaultWidth = 300;
    this.defaultHeight = 300;
  }

  drawPose(ctx, character, move, frame, centerX = 0, centerY = 0, scaleX = 1, scaleY = 1 /* TODO: , tint = null */) {
    const animation = rasterizer.getMove(character, move);

    if (!animation) {
      return;
    }

    ctx.drawImage(
      animation,
      CACHED_SIZE * frame,
      0,
      CACHED_SIZE,
      CACHED_SIZE,
      centerX - this.defaultWidth / 2,
      centerY - this.defaultHeight / 2,
      this.defaultWidth * scaleX,
      this.defaultHeight * scaleY,
    );
  }
}

function imgLoaded(imgElement) {
  return imgElement.complete && imgElement.naturalHeight !== 0;
}

const move = new Move();
module.exports = move.drawPose.bind(move);
