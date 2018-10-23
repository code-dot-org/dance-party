import loadP5 from './loadP5';
import DanceParty from './p5.dance';
import jazzy_beats from "../metadata/jazzy_beats";

loadP5().then(p5Inst => {
  const nativeAPI = window.nativeAPI = new DanceParty(p5Inst, {
    songMetadata: jazzy_beats,
    onSongPlay: () => {console.log("Start Play")},
    onSongComplete: () => {console.log("Stop Requested")},
    onPuzzleComplete: () => {}});

  p5Inst.preload = nativeAPI.preload.bind(nativeAPI);
  p5Inst.setup = () => {
    nativeAPI.addCues({
      seconds: [],
      measures: [],
      peaks: []
    });
    nativeAPI.setup();

    // Sample user code:
    nativeAPI.setBackgroundEffect('disco');
    nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});

    nativeAPI.songStartTime_ = nativeAPI.play();
  };
  p5Inst.draw = nativeAPI.draw.bind(nativeAPI);
});
