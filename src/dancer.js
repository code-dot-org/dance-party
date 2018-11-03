const SOURCE_SIZE = 20;
const CACHED_SIZE = 300;
const LONG_MOVES = 12;
const MAX_FRAMES_PER_MOVE = 24;

class Rasterizer {
  constructor() {
    this.svgImgCache = {/*
      character: Image
    */};
    this.cache = {/*
      moveKey: ImageData
    */};
    this.moveQueue = [/*
      frameKey: `character_move_framenum`
    */];
    this.frameQueue = [/*
      frameKey: `character_move_framenum`
    */];
  }

  startQueue() {
    // Setup memory
    this.reference = document.createElement('canvas');
    this.reference.width = MAX_FRAMES_PER_MOVE * CACHED_SIZE;
    this.reference.height = CACHED_SIZE;
    this.referenceCtx = this.reference.getContext('2d');
    this.processQueue();
  }

  processQueue() {
    if (this.moveQueue.length <= 0) {
      // Cleanup memory
      this.referenceCtx = null;
      this.reference = null;
      return;
    }

    this.rasterizeMove(this.moveQueue[0], () => {
      this.moveQueue.shift();
      this.processQueue();
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

    const rasterize = () => {
      // Clear reference canvas and draw the relevant part of the SVG onto it
      this.referenceCtx.clearRect(0, 0, moveFrames * CACHED_SIZE, CACHED_SIZE);
      this.referenceCtx.drawImage(svgImg, 0, move * SOURCE_SIZE, moveFrames * SOURCE_SIZE, SOURCE_SIZE, 0, 0, moveFrames * CACHED_SIZE, CACHED_SIZE);
      this.cache[moveKey] = this.referenceCtx.getImageData(0, 0, moveFrames * CACHED_SIZE, CACHED_SIZE);
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
      this.startQueue();
    }
    return null;
  }
}

const rasterizer = new Rasterizer();

class Move {
  constructor() {
    this.defaultWidth = 300;
    this.defaultHeight = 300;
    if (!Move.blitCanvas) {
      Move.blitCanvas = document.createElement('canvas');
      Move.blitCanvas.width = Move.blitCanvas.height = CACHED_SIZE;
      Move.blitCtx = Move.blitCanvas.getContext('2d');
    }
  }

  drawPose(ctx, character, move, frame, centerX = 0, centerY = 0, scaleX = 1, scaleY = 1 /* TODO: , tint = null */) {
    const animation = rasterizer.getMove(character, move);

    if (!animation) {
      return;
    }

    Move.blitCtx.putImageData(animation, -CACHED_SIZE * frame, 0, CACHED_SIZE * frame, 0, CACHED_SIZE, CACHED_SIZE);
    ctx.drawImage(
      Move.blitCanvas,
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
