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
global.define = function (_, _, callback) {
  callback(window.p5);
};
global.define.amd = true;

window.p5 = require('p5'); // Needed for p5.play init.
require('@code-dot-org/p5.play/lib/p5.play');

const levels = Object.assign({}, Levels);

module.exports = (levelName, onPuzzleComplete) => {
  const p5Inst = new window.p5();
  const nativeAPI = new DanceParty(p5Inst, {
    getSelectedSong: () => 'hammer',
    playSound: callback => callback(),
    onPuzzleComplete,
  });
  nativeAPI.reset();
  console.log(levels[levelName].solution);
  onPuzzleComplete();
};
