import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
window.p5 = p5; // Needed for p5.play init.
require('@code-dot-org/p5.play/lib/p5.play');
import initDance from './p5.dance';

console.log('hello dance');

const p5Inst = new window.p5();
window.nativeAPI = initDance(p5Inst, () => "hammer", ({callback}) => callback());

p5Inst.preload = nativeAPI.preload;
p5Inst.setup = nativeAPI.setup;
p5Inst.draw = nativeAPI.draw;

// Sample user code:
nativeAPI.setBackgroundEffect('disco');
