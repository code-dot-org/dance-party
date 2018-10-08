import p5 from 'p5';
import 'p5/lib/addons/p5.sound';
window.p5 = p5; // Needed for p5.play init.
require('@code-dot-org/p5.play/lib/p5.play');
import {createDanceAPI} from './DanceLabP5';
import initDance from './p5.dance';

console.log('hello dance');

const p5Inst = new window.p5();
initDance(p5Inst, createDanceAPI(p5Inst));

window.p5Inst = p5Inst;
