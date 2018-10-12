import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
window.p5 = p5; // Needed for p5.play init.
require('@code-dot-org/p5.play/lib/p5.play');
import DanceParty from './p5.dance';

console.log('hello dance');

new window.p5(p5Inst => {
  const nativeAPI = window.nativeAPI = new DanceParty(p5Inst, () => "hammer", () => {});
  nativeAPI.loadSongMetadata_ = () => {};

  p5Inst.preload = nativeAPI.preload.bind(nativeAPI);
  p5Inst.setup = () => {
    nativeAPI.setup();

    // Sample user code:
    nativeAPI.setBackgroundEffect('disco');
    nativeAPI.makeNewDanceSprite("CAT", null, {x: 200, y: 200});
  };
  p5Inst.draw = nativeAPI.draw.bind(nativeAPI);
});
