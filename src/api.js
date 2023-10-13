module.exports = class DanceAPI {
  constructor(nativeAPI) {
    const sprites = [];

    const lookupSprite = spriteName =>
      sprites.find(sprite => sprite.name === spriteName);

    const enforceUniqueName = name => {
      sprites.forEach(sprite => {
        if (sprite.name === name) {
          sprite.name = undefined;
        }
      });
    };

    return {
      setBackground: color => {
        nativeAPI.setBackground(color.toString());
      },
      // DEPRECATED
      // An old block may refer to this version of the command,
      // so we're keeping it around for backwards-compat.
      // @see https://github.com/code-dot-org/dance-party/issues/469
      setBackgroundEffect: (effect, palette = 'default') => {
        nativeAPI.setBackgroundEffect(effect.toString(), palette.toString());
      },
      setBackgroundEffectWithPalette: (effect, palette = 'default') => {
        nativeAPI.setBackgroundEffect(effect.toString(), palette.toString());
      },
      setBackgroundEffectWithPaletteAI: (effect, palette = 'default') => {
        nativeAPI.setBackgroundEffect(effect.toString(), palette.toString());
      },
      // DEPRECATED
      // An old block may refer to this version of the command,
      // so we're keeping it around for backwards-compat.
      // @see https://github.com/code-dot-org/dance-party/issues/469
      setForegroundEffect: effect => {
        nativeAPI.setForegroundEffect(effect.toString());
      },
      setForegroundEffectExtended: effect => {
        nativeAPI.setForegroundEffect(effect.toString());
      },
      makeAnonymousDanceSprite: (costume, location) => {
        sprites.push(nativeAPI.makeNewDanceSprite(costume, null, location));
      },
      makeNewDanceSprite: (costume, name, location) => {
        enforceUniqueName(name);
        sprites.push(nativeAPI.makeNewDanceSprite(costume, name, location));
      },
      makeNewDanceSpriteGroup: (n, costume, layout) => {
        nativeAPI.makeNewDanceSpriteGroup(n, costume, layout);
      },
      getCurrentDance: spriteName => {
        return nativeAPI.getCurrentDance(lookupSprite(spriteName));
      },
      changeMoveLR: (spriteName, move, dir) => {
        nativeAPI.changeMoveLR(lookupSprite(spriteName), move, dir);
      },
      doMoveLR: (spriteName, move, dir) => {
        nativeAPI.doMoveLR(lookupSprite(spriteName), move, dir);
      },
      changeMoveEachLR: (group, move, dir) => {
        nativeAPI.changeMoveEachLR(group, move, dir);
      },
      doMoveEachLR: (group, move, dir) => {
        nativeAPI.doMoveEachLR(group, move, dir);
      },
      alternateMoves: (group, n, move1, move2) => {
        nativeAPI.alternateMoves(group, n, move1, move2);
      },
      layoutSprites: (group, format) => {
        nativeAPI.layoutSprites(group, format);
      },
      setTint: (spriteName, val) => {
        nativeAPI.setTint(lookupSprite(spriteName), val);
      },
      setTintInline: (spriteName, val) => {
        nativeAPI.setTint(lookupSprite(spriteName), val);
      },
      setTintEach: (group, val) => {
        nativeAPI.setTintEach(group, val);
      },
      setTintEachInline: (group, val) => {
        nativeAPI.setTintEach(group, val);
      },
      setVisible: (spriteName, val) => {
        nativeAPI.setVisible(lookupSprite(spriteName), val);
      },
      setVisibleEach: (group, val) => {
        nativeAPI.setVisibleEach(group, val);
      },
      setProp: (spriteName, property, val) => {
        nativeAPI.setProp(lookupSprite(spriteName), property, val);
      },
      setPropEach: (group, property, val) => {
        nativeAPI.setPropEach(group, property, val);
      },
      setPropRandom: (spriteName, property) => {
        nativeAPI.setPropRandom(lookupSprite(spriteName), property);
      },
      setPropRandomEach: (group, property) => {
        nativeAPI.setPropRandomEach(group, property);
      },
      getProp: (spriteName, property, val) => {
        return nativeAPI.setProp(lookupSprite(spriteName), property, val);
      },
      changePropBy: (spriteName, property, val) => {
        nativeAPI.changePropBy(lookupSprite(spriteName), property, val);
      },
      jumpTo: (spriteName, location) => {
        nativeAPI.jumpTo(lookupSprite(spriteName), location);
      },
      jumpToEach: (group, location) => {
        nativeAPI.jumpToEach(group, location);
      },
      setDanceSpeed: (spriteName, speed) => {
        nativeAPI.setDanceSpeed(lookupSprite(spriteName), speed);
      },
      setDanceSpeedEach: (group, speed) => {
        nativeAPI.setDanceSpeedEach(group, speed);
      },
      getEnergy: range => {
        return Number(nativeAPI.getEnergy(range));
      },
      getTime: unit => {
        return Number(nativeAPI.getTime(unit));
      },
      startMapping: (spriteName, property, val) => {
        return nativeAPI.startMapping(lookupSprite(spriteName), property, val);
      },
      startMappingEach: (group, property, val) => {
        return nativeAPI.startMappingEach(group, property, val);
      },
      stopMapping: (spriteName, property, val) => {
        return nativeAPI.stopMapping(lookupSprite(spriteName), property, val);
      },
      stopMappingEach: (group, property, val) => {
        return nativeAPI.stopMappingEach(group, property, val);
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
      changePropEachBy: (group, property, val) => {
        return nativeAPI.changePropEachBy(group, property, val);
      },
      ai: params => {
        nativeAPI.ai(params);
      },
      aiText: value => {
        nativeAPI.aiText(value);
      },
    };
  }
};
