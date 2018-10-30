module.exports = {
  collisionEveryNMeasure: {
    solutions: [
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(1, "measures", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
      
      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
    `,
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(2, "measures", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
      
      everySeconds(1, "measures", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
    `,
    ],
    validationCode: `
      if (nativeAPI.getTime("measures") === 2) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 1){
            nativeAPI.fail("Cat sprite not dancing 1."); 
          }
        }
      }
      if (nativeAPI.getTime("measures") === 3) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 3){
            nativeAPI.fail("Cat sprite not dancing 3."); 
          }
        }
      }
      
      if (nativeAPI.getTime("measures") > 7) {
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
      
      everySeconds(2, "seconds", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
      
      everySeconds(5, "seconds", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
    `,
      `
      var lead_dancer;

      whenSetup(function () {
        lead_dancer = makeNewDanceSprite("CAT", lead_dancer, {x: 200, y: 200});
      });
      
      everySeconds(5, "seconds", function () {
        changeMoveLR(lead_dancer, 1, -1);
      });
      
      everySeconds(2, "seconds", function () {
        changeMoveLR(lead_dancer, 3, -1);
      });
    `,
    ],
    validationCode: `
      if (nativeAPI.getTime("seconds") === 5) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 1){
            nativeAPI.fail("Cat sprite not dancing 1."); 
          }
        }
      }
      if (nativeAPI.getTime("seconds") === 2) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 3){
            nativeAPI.fail("Cat sprite not dancing 3."); 
          }
        }
      }
      
      if (nativeAPI.getTime("seconds") > 7) {
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
      if (nativeAPI.getTime("measures") === 2) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 1){
            nativeAPI.fail("Cat sprite not dancing 1."); 
          }
        }
      }
      if (nativeAPI.getTime("measures") === 4) {
        let cats = nativeAPI.getGroupByName_('CAT');
        for(let i = 0; i < cats.length; i++){
          if(cats[i].current_move !== 3){
            nativeAPI.fail("Cat sprite not dancing 3."); 
          }
        }
      }
      
      if (nativeAPI.getTime("measures") > 5) {
        nativeAPI.pass();
      }
    `,
  },
};
