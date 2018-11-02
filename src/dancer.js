
module.exports = class Dancer {
  constructor(type = 'cat') {
    this.clapHigh = new Move(type, 0);
  }

  drawPose(...args) {
    this.clapHigh.drawPose(...args);
  }
};

class Rasterizer {
  constructor() {
    this.cache = {/*
      dancerName_frameNum: ImageData
    */};
    this.queue = [/*
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
    if (this.queue.length <= 0) {
      // Cleanup memory
      this.img = null;
      this.referenceCtx = null;
      this.reference = null;
      this.ctx = null;
      this.canvas = null;
      return;
    }

    this.rasterizeItem(this.queue[0], () => {
      this.queue.shift();
      this.processQueue();
    });
  }

  rasterizeItem(frameKey, callback) {
    const [character, move] = frameKey.split('_');
    this.img.onload = () => {
      this.reference.width = 7200;
      this.reference.height = 300;
      this.referenceCtx.drawImage(this.img, 0, move * 20, 480, 20, 0, 0, 7200, 300);
      for (let j = 0; j < 24; j++) {
        this.canvas.width = this.canvas.height = 300;
        this.ctx.drawImage(this.reference, j * 300, 0, 300, 300, 0, 0, 300, 300);
        this.cache[this.frameKey(character, move, j)] = this.ctx.getImageData(0, 0, 300, 300);
      }
      callback();
    };
    this.img.src = 'cat.min.svg'; //`assets/${character}.svg`;
  }

  frameKey(character, move, frame) {
    return `${character}_${move}_${frame}`;
  }

  getFrame(character, move, frame) {
    const frameKey = this.frameKey(character, move, frame);
    if (this.cache[frameKey]) {
      return this.cache[frameKey];
    }

    if (!this.queue.some(key => key.startsWith(`${character}_${move}_`))) {
      this.queue.push(frameKey);
      this.startQueue();
    }
    return null;
  }
}

const rasterizer = new Rasterizer();

class Move {
  constructor(character, move) {
    this.defaultWidth = 300;
    this.defaultHeight = 300;
    this.character = character;
    this.move = move;
    if (!Move.blitCanvas) {
      Move.blitCanvas = document.createElement('canvas');
      Move.blitCanvas.width = Move.blitCanvas.height = 300;
      Move.blitCtx = Move.blitCanvas.getContext('2d');
    }
  }

  drawPose(ctx, n, centerX, centerY, scaleX = 1, scaleY = 1, tint = null) {
    const frame = rasterizer.getFrame(this.character, this.move, n);

    if (!frame) {
      return;
    }

    Move.blitCtx.putImageData(frame, 0, 0);
    ctx.drawImage(
      Move.blitCanvas,
      centerX - this.defaultWidth / 2,
      centerY - this.defaultHeight / 2
    );
  }
}
