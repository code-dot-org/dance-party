const DanceParty = require('../../src/p5.dance');
const Levels = require('../../levels/hourOfCode');
const loadP5 = require('../../src/loadP5');

const levels = Object.assign({}, Levels);

module.exports = (levelName, onPuzzleComplete) => {
  return loadP5().then(p5Inst => {
    const nativeAPI = new DanceParty(p5Inst, {
      getSelectedSong: () => 'hammer',
      playSound: callback => callback(),
      onPuzzleComplete,
    });
    nativeAPI.reset();
    nativeAPI.play();
    console.log(levels[levelName].solution);
    console.log(p5Inst.frameCount);
    setTimeout(() => {
      console.log(p5Inst.frameCount);
      onPuzzleComplete();
    }, 5000);
    console.log(p5Inst.frameCount);
  });
};
