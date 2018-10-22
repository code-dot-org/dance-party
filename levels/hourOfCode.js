module.exports = {
  hoc01: {
    solution: `
      var my_first_dancer;

      whenSetup(function () {
        my_first_dancer = makeNewDanceSprite("CAT", my_first_dancer, {x: 200, y: 200});
      });
    `,
    validationCode: `
      //after 1 measure, make sure there is a sprite. if not, fail immediately
      if (nativeAPI.getTime("measures") > 1) {
        if (sprites.length === 0) {
          nativeAPI.fail("You need to make a dancer.");
        }
      }

      if (nativeAPI.getTime("measures") > 5) {
        nativeAPI.pass();
      }
    `,
  }
};
