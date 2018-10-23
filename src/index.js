import loadP5 from './loadP5';
import DanceParty from './p5.dance';
import macklemore90 from '../metadata/macklemore90.json';
import hammer from '../metadata/hammer.json';
import peas from '../metadata/peas.json';

loadP5().then(p5Inst => {
  const nativeAPI = window.nativeAPI = new DanceParty(p5Inst, {
    getSelectedSong: () => "hammer",
    onPuzzleComplete: () => {},
    playSound: ({callback}) => setTimeout(() => {callback && callback();}, 0),
  });
  nativeAPI.loadSongMetadata_ = () => {};

  p5Inst.preload = nativeAPI.preload.bind(nativeAPI);
  p5Inst.setup = () => {
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
