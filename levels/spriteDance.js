module.exports = {
  collisionEveryNMeasure: {
    solutions: [
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
      
      everySeconds(4, "measures", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
    `,
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(4, "measures", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
      
      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
    `,
    ],
    validationCode: `
      if (nativeAPI.getTime("measures") === 4) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 1){
            nativeAPI.fail("Cat sprite not dancing 1."); 
          }
        }
      }
      if (nativeAPI.getTime("measures") > 7 && nativeAPI.getTime("measures") < 8) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 3){
            nativeAPI.fail("Cat sprite not dancing 3.");
          }
        }
      }
      
      if (nativeAPI.getTime("measures") > 8) {
        nativeAPI.pass();
      }
    `,
  },
  collisionEveryNMeasureDifferentDancers: {
    solution: `
      var dancer1, dancer2;

      whenSetup(function () {
        dancer1 = makeNewDanceSprite("CAT", null, {x: 100, y: 200});
        dancer2 = makeNewDanceSprite("MOOSE", null, {x: 300, y: 200});
      });

      everySeconds(2, "measures", function () {
        changeMoveLR(dancer1, 4, -1);
      });

      everySeconds(4, "measures", function () {
        changeMoveLR(dancer2, 4, -1);
      });
    `,
    validationCode: `
      if (nativeAPI.getTime("measures") > 4) {
        const all = nativeAPI.getGroupByName_('all');
        for (let i = 0; i < all.length; i++){
          if (all[i].current_move !== 4) {
            nativeAPI.fail("Sprite not dancing move 4.");
          }
        }
      }

      if (nativeAPI.getTime("measures") > 5) {
        nativeAPI.pass();
      }
    `,
  },
  collisionEveryNSeconds: {
    solutions: [
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(3, "seconds", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
      
      everySeconds(6, "seconds", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
    `,
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(6, "seconds", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
      
      everySeconds(3, "seconds", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
    `,
    ],
    validationCode: `
      if (nativeAPI.getTime("seconds") > 7 && nativeAPI.getTime("seconds") < 9) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 1){
            nativeAPI.fail("Cat sprite not dancing 1."); 
          }
        }
      }
      if (nativeAPI.getTime("seconds") > 4 && nativeAPI.getTime("seconds") < 6) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 3){
            nativeAPI.fail("Cat sprite not dancing 3."); 
          }
        }
      }
      
      if (nativeAPI.getTime("seconds") > 9) {
        nativeAPI.pass();
      }
    `,
  },
  collisionEveryNMeasureAndTimestamp: {
    solutions: [
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
      
      atTimestamp(2, "measures", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
    `,
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      atTimestamp(2, "measures", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
      
      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });     
    `,
    ],
    validationCode: `
      if (nativeAPI.getTime("measures") >= 3 && nativeAPI.getTime("measures") < 4) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 1){
            nativeAPI.fail("Cat sprite not dancing 1."); 
          }
        }
      }
      if (nativeAPI.getTime("measures") >= 5 && nativeAPI.getTime("measures") < 6) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 3){
            nativeAPI.fail("Cat sprite not dancing 3."); 
          }
        }
      }
      
      if (nativeAPI.getTime("measures") > 6) {
        nativeAPI.pass();
      }
    `,
  },
};
