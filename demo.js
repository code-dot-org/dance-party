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
    document.querySelector('#run').style.display = 'inline';
  },
  container: 'dance',
});

document.querySelector('#code').innerText = `makeNewDanceSprite("CAT", null, {x: 200, y: 200});

atTimestamp(2, "measures", function () {
  nativeAPI.setBackgroundEffect("disco");
});
`;

document.querySelector('#run').addEventListener('click', event => {
  if (event.target.innerText === "Reset") {
    event.target.innerText = "Run!";
    nativeAPI.reset();
  } else {
    event.target.innerText = "Reset";
    const {
      runUserSetup,
      runUserEvents,
      getCueList,
    } = injectInterpreted(nativeAPI, interpreted, document.querySelector('#code').value);

    // Setup event tracking.
    nativeAPI.addCues(getCueList());
    nativeAPI.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
    runUserSetup();

    nativeAPI.play(jazzy_beats);
  }
});
