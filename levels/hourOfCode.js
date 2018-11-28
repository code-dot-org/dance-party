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
      if ((nativeAPI.getTime("measures") > 1) && (nativeAPI.getTime("measures") < 3)) {
        if (sprites.length > 0) {
          World.startingMove = sprites[0].current_move;
        } else {
          nativeAPI.fail("You have no dancers.");
        }
      } else if (nativeAPI.getTime("measures") > 7) {
        nativeAPI.pass();
      } else if (nativeAPI.getTime("measures") > 5.5) {
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
  hoc04: {
    solution: `
      var fancy_dancer;

      whenSetup(function () {
        fancy_dancer = makeNewDanceSprite("ROBOT", fancy_dancer, {x: 200, y: 200});
        setBackgroundEffectWithPalette("disco");
      });

      atTimestamp(4, "measures", function () {
        changeMoveLR(fancy_dancer, MOVES.Dab, -1);
      });
    `,
    validationCode: `
      if (nativeAPI.getTime("measures") > 7) {
        if (World.bg_effect == null) {
          nativeAPI.fail("You need to add a background effect.");
        }
      }
      if (nativeAPI.getTime("measures") > 10) {
        nativeAPI.pass();
      }
    `,
  },
  hoc07: {
    solution: `
      var backup_dancer1;
      var backup_dancer2;
      var lead_dancer;

      whenSetup(function () {
        setBackgroundEffectWithPalette("diamonds");
        backup_dancer1 = makeNewDanceSprite("CAT", backup_dancer1, {x: 300, y: 200});
        setProp(backup_dancer1, "scale", 50);
        backup_dancer2 = makeNewDanceSprite("ROBOT", backup_dancer2, {x: 100, y: 200});
        setProp(backup_dancer2, "scale", 50);
        lead_dancer = makeNewDanceSprite("MOOSE", lead_dancer, {x: 200, y: 200});
      });

      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, "next", -1);
      });

      atTimestamp(4, "measures", function () {
        changeMoveLR(backup_dancer1, MOVES.Fresh, -1);
        changeMoveLR(backup_dancer2, MOVES.Fresh, 1);
      });
    `,
    validationCode: `
      if (World.changedCount == undefined) {
        World.changedCount = 0;
      }
      if (nativeAPI.getTime("measures") > 6) {
        sprites.forEach(function(sprite) {
          if (sprite.scale != 1) {
            World.changedCount++;
          }
        });
        if (World.changedCount > 1) {
          nativeAPI.pass();
        } else {
          nativeAPI.fail("Use the \`set backup_dancer2 size\` block to make that dancer smaller.");
        }
      }
    `,
  },
  hoc09: {
    solution: `
      var left_shark;
      var right_pineapple;

      whenSetup(function () {
        setBackgroundEffectWithPalette("rainbow");
        left_shark = makeNewDanceSprite("MOOSE", left_shark, {x: 100, y: 200});
        right_pineapple = makeNewDanceSprite("ROBOT", right_pineapple, {x: 300, y: 200});
        startMapping(left_shark, "height", "bass");
        startMapping(right_pineapple, "scale", "bass");
      });

      everySeconds(2, "measures", function () {
        changeMoveLR(left_shark, "next", -1);
        changeMoveLR(right_pineapple, "next", 1);
      });
    `,
    validationCode: `
      if (World.following_count == undefined) {
        World.following_count = 0;
      }

      if (nativeAPI.getTime("measures") > 8) {
        sprites.forEach(function(sprite) {
          // If a sprite has more than one behavior, assume it's following music
          if (sprite.behaviors.length > 1) World.following_count++;
        });
        // We start with one sprite following by default, make sure the student has added another
        if (World.following_count > 1) {
          nativeAPI.pass();
        } else {
          nativeAPI.fail('Try adding the \`right_pineapple begins size following bass\` block to your program.');
        }
      }
    `,
  },
  hoc10: {
    solution: `
      var left_dancer;
      var right_dancer;

      whenSetup(function () {
        setBackgroundEffectWithPalette("splatter");
        left_dancer = makeNewDanceSprite("CAT", left_dancer, {x: 100, y: 200});
        right_dancer = makeNewDanceSprite("ROBOT", right_dancer, {x: 300, y: 200});
      });

      everySeconds(2, "measures", function () {
        changeMoveLR(left_dancer, "next", -1);
      });

      whenKey("up", function () {
        doMoveLR(right_dancer, MOVES.XArmsUp, -1);
      });
    `,
    validationCode: `
      if (World.validationStatus == undefined) {
        World.validationStatus = 3;
      } else if (events['this.p5_.keyWentDown']) {
        World.validationStatus = 0;
      }
       
      if (nativeAPI.getTime("measures") > 8) { 
        if (World.validationStatus > 0) {
          nativeAPI.fail("Make sure you add a \`when key\` event and press the key to test it.");
        } else {
          nativeAPI.pass();
        }
      }
    `,
  },
};
