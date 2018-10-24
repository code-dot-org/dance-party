let context;

if (typeof global !== undefined) {
  context = global;

  global.window = {
    addEventListener: () => {
    },
  };

  global.document = {
    hasFocus: () => true,
    getElementsByTagName: () => ({}),
  };

  global.screen = {};
} else {
  context = window;
}

const P5 = require('p5');

// const P5 = Object.getPrototypeOf(p5).constructor;
if (P5.Renderer2D) {
  /**
   * Patch p5 tint to use fast compositing (see https://github.com/code-dot-org/p5_play/pull/42).
   */
  P5.Renderer2D.prototype._getTintedImageCanvas = function (img) {
    this._tintCanvas = this._tintCanvas || document.createElement('canvas');
    this._tintCanvas.width = img.canvas.width;
    this._tintCanvas.height = img.canvas.height;
    const tmpCtx = this._tintCanvas.getContext('2d');
    tmpCtx.fillStyle = 'hsl(' + this._pInst.hue(this._tint) + ', 100%, 50%)';
    tmpCtx.fillRect(0, 0, this._tintCanvas.width, this._tintCanvas.height);
    tmpCtx.globalCompositeOperation = 'destination-atop';
    tmpCtx.drawImage(img.canvas, 0, 0, this._tintCanvas.width, this._tintCanvas.height);
    tmpCtx.globalCompositeOperation = 'multiply';
    tmpCtx.drawImage(img.canvas, 0, 0, this._tintCanvas.width, this._tintCanvas.height);
    return this._tintCanvas;
  };
}
P5.disableFriendlyErrors = true;


context.define = function (name, dependencies, callback) {
  callback(P5);
};
context.define.amd = true;

require('@code-dot-org/p5.play/lib/p5.play');

module.exports = function () {
  return new Promise(resolve => {
    new P5(p5Inst => resolve(p5Inst));
  });
};
