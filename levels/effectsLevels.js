module.exports = {
  changeBackgroundAtTimestamp: {
    solutions:
      `
      var lead_dancer;

      whenSetup(function () {
        setBackgroundEffectWithPalette("color_cycle");
      });

      atTimestamp(4, "measures", function () {
        setBackgroundEffectWithPalette("text");
      });
    `,
    validationCode: `

      if (nativeAPI.getTime("measures") > 1 && nativeAPI.getTime("measures") < 3) {
        if (World.bg_effect == null) {
          nativeAPI.fail("You need to add a background effect.");
        } else if (nativeAPI.getBackgroundEffect().color == null) {
          nativeAPI.fail("You need to set the background to color_cycle");
        }
      }

      if (nativeAPI.getTime("measures") > 6) {
        if (World.bg_effect == null) {
          nativeAPI.fail("You need to add a background effect.");
        } else if (nativeAPI.getBackgroundEffect().texts == null) {
          nativeAPI.fail("You need to set the background to text");
        }
      }

      if (nativeAPI.getTime("measures") > 7) {
        nativeAPI.pass();
      }
    `,
  },
};
