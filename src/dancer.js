module.exports = class Dancer {
  constructor() {
    this.defaultWidth = 300;
    this.defaultHeight = 300;

    this.frames = [];
    let img = new Image();
    let reference = document.createElement('canvas');
    let referenceCtx = reference.getContext('2d');
    img.onload = () => {
      reference.width = reference.height = 7200;
      referenceCtx.drawImage(img, 0, 0, 480, 480, 0, 0, 7200, 7200);
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        for (let i = 0; i < 12; i++) {
          for (let j = 0; j < 24; j++) {
            canvas.width = canvas.height = 300;
            ctx.drawImage(reference, j * 300, i * 300, 300, 300, 0, 0, 300, 300);
            // canvas.toBlob(blob => {
            //   console.log("converted " + j);
            //   this.frames[j] = blob;
            // });
            createImageBitmap(canvas).then(bm => this.frames[j] = bm);
          }
        }
      img = null;
      referenceCtx = null;
      reference = null;
      ctx = null;
      canvas = null;
    };
    img.src = 'cat.min.svg';
  }

  drawPose(ctx, n, centerX, centerY, scaleX = 1, scaleY = 1, tint = null) {
    ctx.drawImage(
      this.frames[n],
      centerX - this.defaultWidth / 2,
      centerY - this.defaultHeight / 2,
      this.defaultWidth * scaleX,
      this.defaultHeight * scaleY
    );
  }
};
