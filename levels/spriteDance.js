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
        setProp(lead_dancer, "scale", 50);	
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
      if (nativeAPI.getTime("measures") === 5) {	
        let cats = nativeAPI.getGroupByName_('CAT');	
        for(let i = 0; i < cats.length; i++){	
          if(cats[i].current_move !== 1){	
            nativeAPI.fail("Cat sprite not dancing 1.");	
          }	
        }	
      }	
      if (nativeAPI.getTime("measures") > 8 && nativeAPI.getTime("measures") < 9) {	
        let cats = nativeAPI.getGroupByName_('CAT');	
        for(let i = 0; i < cats.length; i++){	
          if(cats[i].current_move !== 3){	
            nativeAPI.fail("Cat sprite not dancing 3.");	
          }	
        }	
      }	
      if (nativeAPI.getTime("measures") > 1 && nativeAPI.getTime("measures") < 2) {	
        let cats = nativeAPI.getGroupByName_('CAT');	
        for(let i = 0; i < cats.length; i++){	
          if(nativeAPI.getProp(cats[i], "scale") === 50) {	
            nativeAPI.fail("Cat sprite event happened too early.");	
          }	
        }	
      }	
       if (nativeAPI.getTime("measures") > 9) {	
        nativeAPI.pass();	
      }	
    `,
  },
};