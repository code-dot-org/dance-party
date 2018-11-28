module.exports = class DanceAPI {
  constructor(nativeAPI) {
    const sprites = [];

    return {
      setBackground: color => {
        nativeAPI.setBackground(color.toString());
      },
      // DEPRECATED
      // An old block may refer to this version of the command,
      // so we're keeping it around for backwards-compat.
      // @see https://github.com/code-dot-org/dance-party/issues/469
      setBackgroundEffect: (effect, palette) => {
        nativeAPI.setBackgroundEffect(effect.toString(), palette);
      },
      setBackgroundEffectWithPalette: (effect, palette) => {
        nativeAPI.setBackgroundEffect(effect.toString(), palette);
      },
      // DEPRECATED
      // An old block may refer to this version of the command,
      // so we're keeping it around for backwards-compat.
      // @see https://github.com/code-dot-org/dance-party/issues/469
      setForegroundEffect: effect => {
        nativeAPI.setForegroundEffect(effect.toString());
      },
      setForegroundEffectExtended: (effect) => {
        nativeAPI.setForegroundEffect(effect.toString());
      },
      makeNewDanceSprite: (costume, name, location) => {
        return Number(sprites.push(
          nativeAPI.makeNewDanceSprite(costume, name, location)) - 1);
      },
      makeNewDanceSpriteGroup: (n, costume, layout) => {
        nativeAPI.makeNewDanceSpriteGroup(n, costume, layout);
      },
      getCurrentDance: (spriteIndex) => {
        return nativeAPI.getCurrentDance(sprites[spriteIndex]);
      },
      changeMoveLR: (spriteIndex, move, dir) => {
        nativeAPI.changeMoveLR(sprites[spriteIndex], move, dir);
      },
      doMoveLR: (spriteIndex, move, dir) => {
        nativeAPI.doMoveLR(sprites[spriteIndex], move, dir);
      },
      changeMoveEachLR: (group, move, dir) => {
        nativeAPI.changeMoveEachLR(group, move, dir);
      },
      doMoveEachLR: (group, move, dir) => {
        nativeAPI.doMoveEachLR(group, move, dir);
      },
      layoutSprites: (group, format) => {
        nativeAPI.layoutSprites(group, format);
      },
      setTint: (spriteIndex, val) => {
        nativeAPI.setTint(sprites[spriteIndex], val);
      },
      setProp: (spriteIndex, property, val) => {
        nativeAPI.setProp(sprites[spriteIndex], property, val);
      },
      setPropEach: (group, property, val) => {
        nativeAPI.setPropEach(group, property, val);
      },
      setPropRandom: (spriteIndex, property) => {
        nativeAPI.setPropRandom(sprites[spriteIndex], property);
      },
      getProp: (spriteIndex, property, val) => {
        return nativeAPI.setProp(sprites[spriteIndex], property, val);
      },
      changePropBy: (spriteIndex, property, val) => {
        nativeAPI.changePropBy(sprites[spriteIndex], property, val);
      },
      jumpTo: (spriteIndex, location) => {
        nativeAPI.jumpTo(sprites[spriteIndex], location);
      },
      setDanceSpeed: (spriteIndex, speed) => {
        nativeAPI.setDanceSpeed(sprites[spriteIndex], speed);
      },
      getEnergy: range => {
        return Number(nativeAPI.getEnergy(range));
      },
      getTime: unit => {
        return Number(nativeAPI.getTime(unit));
      },
      startMapping: (spriteIndex, property, val) => {
        return nativeAPI.startMapping(sprites[spriteIndex], property, val);
      },
      stopMapping: (spriteIndex, property, val) => {
        return nativeAPI.stopMapping(sprites[spriteIndex], property, val);
      },
      changeColorBy: (input, method, amount) => {
        return nativeAPI.changeColorBy(input, method, amount);
      },
      mixColors: (color1, color2) => {
        return nativeAPI.mixColors(color1, color2);
      },
      randomColor: () => {
        return nativeAPI.randomColor();
      },
      getCurrentTime: () => {
        return nativeAPI.getCurrentTime();
      },
    };
  }
};
