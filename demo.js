import DanceParty from './src/p5.dance';
import jazzy_beats from './metadata/jazzy_beats';
import interpreted from 'raw-loader!./src/p5.dance.interpreted.js';
import injectInterpreted from './test/helpers/injectInterpreted';

const nativeAPI = window.nativeAPI = new DanceParty({
  onPuzzleComplete: () => {},
  playSound: (url, callback, onEnded) => setTimeout(() => {
    callback && callback();
  }, 0),
  onInit: () => {
    const {
      runUserSetup,
      runUserEvents,
      getCueList,
      atTimestamp
    } = injectInterpreted(nativeAPI, interpreted);

    // Sample user code:
    nativeAPI.setBackgroundEffect('disco');
    nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
    atTimestamp(2, "measures", function () {
      nativeAPI.setBackgroundEffect('diamonds');
    });


    // setup event tracking
    // Worth noting that any calls that setup event tracking (such as atTimestamp)
    // must happen before this point
    nativeAPI.addCues(getCueList());
    nativeAPI.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
    runUserSetup();


    nativeAPI.play(jazzy_beats);
  },
});
