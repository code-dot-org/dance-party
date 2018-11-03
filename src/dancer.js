const SOURCE_SIZE = 20;
const CACHED_SIZE = 300;
class Rasterizer {
  constructor() {
    this.cache = {/*
      dancerName_frameNum: ImageData
    */};
    this.moveQueue = [/*
      frameKey: `character_move_framenum`
    */];
  }

  startQueue() {
    // Setup memory
    this.img = new Image();
    this.reference = document.createElement('canvas');
    this.referenceCtx = this.reference.getContext('2d');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    setTimeout(this.processQueue.bind(this), 0);
  }

  processQueue() {
    if (this.moveQueue.length <= 0) {
      // Cleanup memory
      this.img = null;
      this.referenceCtx = null;
      this.reference = null;
      this.ctx = null;
      this.canvas = null;
      return;
    }

    this.rasterizeItem(this.moveQueue[0], () => {
      this.moveQueue.shift();
      this.processQueue();
    });
  }

  rasterizeItem(frameKey, callback) {
    const [character, move] = frameKey.split('_');
    this.img.onload = () => {
      this.reference.width = 24 * CACHED_SIZE;
      this.reference.height = CACHED_SIZE;
      this.referenceCtx.drawImage(this.img, 0, move * SOURCE_SIZE, 24 * SOURCE_SIZE, SOURCE_SIZE, 0, 0, 24 * CACHED_SIZE, CACHED_SIZE);
      for (let j = 0; j < 24; j++) {
        this.canvas.width = this.canvas.height = CACHED_SIZE;
        this.ctx.drawImage(this.reference, j * CACHED_SIZE, 0, CACHED_SIZE, CACHED_SIZE, 0, 0, CACHED_SIZE, CACHED_SIZE);
        this.cache[this.frameKey(character, move, j)] = this.ctx.getImageData(0, 0, CACHED_SIZE, CACHED_SIZE);
      }
      callback();
    };
    this.img.src = `assets/${character}.svg`;
  }

  frameKey(character, move, frame) {
    return `${character}_${move}_${frame}`;
  }

  getFrame(character, move, frame) {
    const frameKey = this.frameKey(character, move, frame);
    if (this.cache[frameKey]) {
      return this.cache[frameKey];
    }

    if (!this.moveQueue.some(key => key.startsWith(`${character}_${move}_`))) {
      this.moveQueue.push(frameKey);
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

  drawPose(ctx, character, move, n, centerX = 0, centerY = 0, scaleX = 1, scaleY = 1, tint = null) {
    const frame = rasterizer.getFrame(character, move, n);

    if (!frame) {
      return;
    }

    Move.blitCtx.putImageData(frame, 0, 0);
    ctx.drawImage(
      Move.blitCanvas,
      centerX - this.defaultWidth / 2,
      centerY - this.defaultHeight / 2,
      this.defaultWidth * scaleX,
      this.defaultHeight * scaleY,
    );
  }
}

const move = new Move();
module.exports = move.drawPose.bind(move);
