const DanceParty = require('../../src/p5.dance');
const UnitTestResourceLoader = require('./UnitTestResourceLoader');

module.exports = {
  createDanceAPI: (props) => {
    return new Promise(resolve => {
      new DanceParty({
        playSound: (url, callback) => callback(),
        onInit: nativeAPI => resolve(nativeAPI),
        resourceLoader: new UnitTestResourceLoader(),
        deterministic: props.deterministic,
        ...props
      });
    });
  },
};
