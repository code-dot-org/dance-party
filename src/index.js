import p5 from 'p5';
window.p5 = p5; // Needed for p5.play init.
require('@code-dot-org/p5.play/lib/p5.play');
import DanceParty from './p5.dance';
import macklemore90 from '../metadata/macklemore90.json';
import hammer from '../metadata/hammer.json';
import peas from '../metadata/peas.json';
import jazzy_beats from '../metadata/jazzy_beats.json';

new window.p5(p5Inst => {
  const nativeAPI = window.nativeAPI = new DanceParty(p5Inst, {
    getSelectedSong: () => "jazzy_beats",
    onPuzzleComplete: () => {},
    playSound: ({callback}) => setTimeout(() => {callback && callback();}, 0),
  });
  nativeAPI.loadSongMetadata_ = () => {};

  p5Inst.preload = nativeAPI.preload.bind(nativeAPI);
  p5Inst.setup = () => {
    nativeAPI.setMetadata_('jazzy_beats', jazzy_beats);
    nativeAPI.setMetadata_('macklemore90', macklemore90);
    nativeAPI.setMetadata_('hammer', hammer);
    nativeAPI.setMetadata_('peas', peas);
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
