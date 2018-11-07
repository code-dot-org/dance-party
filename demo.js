import DanceParty from './src/p5.dance';
import jazzy_beats from './metadata/jazzy_beats';
const DanceAPI = require('./src/api');
const interpreted = require('raw-loader!./src/p5.dance.interpreted.js');

/**
 * Inject p5.dance.interpreted code directly (this is only acceptable because we
 * don't have untrusted user input in our dev env). Also attach all functionNames
 * to the global namespace so that they can be called from the console, making
 * for easier testing
 */
function injectInterpreted(api) {
  // This list is not exhaustive, and more can/should be added as needed
  const functionNames = [
    'atTimestamp',
    'everySeconds',
    'everySecondsRange',
    'everyVerseChorus',
    'runUserSetup',
    'runUserEvents',
    'getCueList',
  ];

  const globals = new DanceAPI(api);
  const code = interpreted + `return {${functionNames.join(',')}};`;

  const params = [];
  const args = [];
  for (let k of Object.keys(globals)) {
    params.push(k);
    args.push(globals[k]);
  }
  params.push(code);
  const ctor = function () {
    return Function.apply(this, params);
  };
  ctor.prototype = Function.prototype;
  const result = new ctor().apply(null, args);

  // inject onto window
  functionNames.forEach(name => window[name] = result[name]);

  return result;
}

const nativeAPI = window.nativeAPI = new DanceParty({
  onPuzzleComplete: () => {},
  playSound: (url, callback, onEnded) => setTimeout(() => {
    callback && callback();
  }, 0),
  onInit: () => {
    const { runUserSetup, runUserEvents, getCueList } = injectInterpreted(nativeAPI);;

    // setup event tracking
    nativeAPI.addCues(getCueList());
    nativeAPI.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
    runUserSetup();

    // Sample user code:
    nativeAPI.setBackgroundEffect('disco');
    nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    nativeAPI.play(jazzy_beats);
  },
});
