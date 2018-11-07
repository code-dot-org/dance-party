import DanceParty from './src/p5.dance';
import jazzy_beats from './metadata/jazzy_beats';

const nativeAPI = window.nativeAPI = new DanceParty({
  onPuzzleComplete: () => {},
  playSound: (url, callback, onEnded) => setTimeout(() => {
    callback && callback();
  }, 0),
  onInit: () => {
    // Sample user code:
    nativeAPI.setBackgroundEffect('disco');
    nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    nativeAPI.play(jazzy_beats);
  },
});
