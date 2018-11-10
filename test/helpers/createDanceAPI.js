const DanceParty = require('../../src/p5.dance');

module.exports = {
  createDanceAPI: (props) => {
    return new Promise(resolve => {
      new DanceParty({
        moveNames: [],
        playSound: (url, callback) => callback(),
        onInit: nativeAPI => resolve(nativeAPI),
        ...props
      });
    });
  },
  createDanceAPIWithDefaultMoves: (props) => {
    return new Promise(resolve => {
      new DanceParty({
        playSound: (url, callback) => callback(),
        onInit: nativeAPI => resolve(nativeAPI),
        ...props
      });
    });
  },
};
