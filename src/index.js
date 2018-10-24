import loadP5 from './loadP5';
import DanceParty from './p5.dance';
import jazzy_beats from '../metadata/jazzy_beats';

loadP5().then(p5Inst => {
  const nativeAPI = window.nativeAPI = new DanceParty(p5Inst, {
    onPuzzleComplete: () => {},
    playSound: ({callback}) => setTimeout(() => {callback && callback();}, 0),
  });

  p5Inst.preload = nativeAPI.preload.bind(nativeAPI);
  p5Inst.setup = () => {
    nativeAPI.setup();

    // Sample user code:
    nativeAPI.setBackgroundEffect('disco');
    nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    nativeAPI.setSongMetadata(jazzy_beats);
    nativeAPI.play();
  };
  p5Inst.draw = nativeAPI.draw.bind(nativeAPI);
});
