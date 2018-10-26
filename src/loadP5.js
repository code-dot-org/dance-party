if ((typeof process !== 'undefined') && (process.release) && (process.release.name === 'node')) {
  const {JSDOM} = eval("require('jsdom')"); // eslint-disable-line no-eval
  global.window = new JSDOM().window;
  global.document = window.document;
  global.screen = window.screen;
  global.Image = window.Image;
}

const P5 = require('@code-dot-org/p5');
P5.disableFriendlyErrors = true;

require('@code-dot-org/p5.play/lib/p5.play');

module.exports = P5;
