import 'babel-polyfill';
import DanceParty from './src/p5.dance';
import jazzy_beats from './metadata/jazzy_beats';
import interpreted from 'raw-loader!./src/p5.dance.interpreted.js';
import injectInterpreted from './test/helpers/injectInterpreted';

const textareaCode = document.querySelector('#code');
const buttonRun = document.querySelector('#run');

const nativeAPI = window.nativeAPI = new DanceParty({
  onPuzzleComplete: () => {},
  playSound: (url, callback, onEnded) => setTimeout(() => {
    callback && callback();
  }, 0),
  onInit: () => {
    document.querySelector('#run').style.display = 'inline';
    runCode();
  },
  container: 'dance',
});

function runCode() {
  const {
    runUserSetup,
    runUserEvents,
    getCueList,
  } = injectInterpreted(nativeAPI, interpreted, textareaCode.value);

  // Setup event tracking.
  nativeAPI.addCues(getCueList());
  nativeAPI.onHandleEvents = currentFrameEvents => runUserEvents(currentFrameEvents);
  runUserSetup();

  nativeAPI.play(jazzy_beats);
}

textareaCode.value = textareaCode.value || `makeNewDanceSprite("CAT", null, {x: 200, y: 200});

atTimestamp(2, "measures", function () {
  setBackgroundEffect("disco");
});
`;

document.querySelector('#run').addEventListener('click', () => {
  if (buttonRun.innerText === "Reset") {
    buttonRun.innerText = "Run!";
    nativeAPI.reset();
  } else {
    buttonRun.innerText = "Reset";
    runCode();
  }
});
