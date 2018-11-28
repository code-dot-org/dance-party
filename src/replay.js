const DEBUG = false;
const FRAME_LIMIT = 30 * 10; // 10 seconds @ 30 fps
const SPRITE_LIMIT = 25;

const log = [];
if (DEBUG) {
  window.log = log;
}

module.exports = {
  logFrame: ({bg, context, fg, p5, palette}) => {
    if (log.length >= FRAME_LIMIT) {
      return;
    }

    const frame = {bg, fg, context, palette};

    const spritesToLog = p5.allSprites.slice(0, SPRITE_LIMIT);
    frame.sprites = spritesToLog.map((sprite) => ({
      animationFrame: sprite.animation && sprite.animation.getFrame(),
      animationLabel: sprite.getAnimationLabel(),
      height: sprite.height,
      mirrorX: sprite.mirrorX(),
      rotation: sprite.rotation,
      scale: sprite.scale,
      style: sprite.style,
      tint: sprite.tint === undefined ? undefined : p5.hue(p5.color(sprite.tint || 0)),
      visible: sprite.visible,
      width: sprite.width,
      x: sprite.x,
      y: sprite.y,
    }));

    log.push(frame);
  },

  getLog: () => {
    return log;
  },

  reset: () => {
    log.length = 0;
  },
};
