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
  },
  hoc02: {
    solution: `
      var new_dancer;

      whenSetup(function () {
        new_dancer = makeNewDanceSprite("MOOSE", new_dancer, {x: 200, y: 200});
      });

      atTimestamp(4, "measures", function () {
        changeMoveLR(new_dancer, MOVES.Floss, -1);
      });
    `,
    validationCode: `
      if ((nativeAPI.getTime("measures") < 3) && (nativeAPI.getTime("measures")>0)) {
        if (sprites.length > 0) {
          World.startingMove = sprites[0].current_move;
        } else {
          nativeAPI.fail("You have no dancers.");
        }
      } else if (nativeAPI.getTime("measures") > 7) {
        nativeAPI.pass();
      } else if (nativeAPI.getTime("measures") > 4.5) {
        if (sprites.length > 0) {
          if (sprites[0].current_move === World.startingMove) {
            nativeAPI.fail("Your dancer wasn't doing a new move after the fourth measure.");
          }
        } else {
          World.validationStatus = 3;
          nativeAPI.fail("You have no dancers.");
        }
      }
    `,
  },
};
