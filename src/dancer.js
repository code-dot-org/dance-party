const SOURCE_SIZE = 20;
const CACHED_SIZE = 300;

class Rasterizer {
  constructor() {
    this.svgImgCache = {/*
      character: Image
    */};
    this.cache = {/*
      dancerName_frameNum: ImageData
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
    this.referenceCtx = this.reference.getContext('2d');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    setTimeout(this.processQueue.bind(this), 0);
  }

  processQueue() {
    if (this.moveQueue.length <= 0) {
      // Cleanup memory
      this.referenceCtx = null;
      this.reference = null;
      this.ctx = null;
      this.canvas = null;
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
    const [character, move] = frameKey.split('_');
    const svgImg = this.getSvgImg(character);

    const rasterize = () => {
      if (this.frameQueue.length === 0) {
        for (let i = 0; j < 24; j++) {
          this.frameKey.push(this.frameKey(character, move, i));
        }

        // Clear reference canvas and draw the relevant part of the SVG onto it
        this.reference.width = 24 * CACHED_SIZE;
        this.reference.height = CACHED_SIZE;
        this.referenceCtx.drawImage(svgImg, 0, move * SOURCE_SIZE, 24 * SOURCE_SIZE, SOURCE_SIZE, 0, 0, 24 * CACHED_SIZE, CACHED_SIZE);
      }

      // Pull from the frame queue and render the next frame.
      const nextFrameKey = this.frameQueue.shift();
      const [_c, _m, frame] = nextFrameKey.split('_')[2];
      // clear canvas
      this.canvas.width = this.canvas.height = CACHED_SIZE;
      this.ctx.drawImage(this.reference, frame * CACHED_SIZE, 0, CACHED_SIZE, CACHED_SIZE, 0, 0, CACHED_SIZE, CACHED_SIZE);
      this.cache[nextFrameKey] = this.ctx.getImageData(0, 0, CACHED_SIZE, CACHED_SIZE);

      if (this.frameQueue.length > 0) {
        setTimeout(rasterize, 0);
      } else {
        callback();
      }
    };

    if (imgLoaded(svgImg)) {
      rasterize();
    } else {
      svgImg.onload = rasterize;
      svgImg.src = `assets/${character}.svg`;
    }
  }

  frameKey(character, move, frame) {
    return `${character}_${move}_${frame}`;
  }

  getFrame(character, move, frame) {
    const frameKey = this.frameKey(character, move, frame);
    if (this.cache[frameKey]) {
      return this.cache[frameKey];
    }

    const moveKey = `${character}_${move}`;
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

  drawPose(ctx, character, move, n, centerX = 0, centerY = 0, scaleX = 1, scaleY = 1 /* TODO: , tint = null */) {
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

function imgLoaded(imgElement) {
  return imgElement.complete && imgElement.naturalHeight !== 0;
}

const move = new Move();
module.exports = move.drawPose.bind(move);
