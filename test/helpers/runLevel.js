const DanceParty = require('../../src/p5.dance');
const Levels = require('../../levels/hourOfCode');

global.window = {
  addEventListener: () => {},
};
global.document = {
  hasFocus: () => true,
  getElementsByTagName: () => ({}),
};
global.screen = {};
const P5 = require('p5');
global.define = function (_, _, callback) {
  callback(P5);
};
global.define.amd = true;

require('@code-dot-org/p5.play/lib/p5.play');

const levels = Object.assign({}, Levels);

module.exports = (levelName, onPuzzleComplete) => {
  const p5Inst = new P5();
  const nativeAPI = new DanceParty(p5Inst, {
    getSelectedSong: () => 'hammer',
    playSound: callback => callback(),
    onPuzzleComplete,
  });
  nativeAPI.reset();
  console.log(levels[levelName].solution);
  onPuzzleComplete();
};
