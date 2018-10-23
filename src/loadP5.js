let context;

if (typeof global !== undefined) {
  context = global;

  global.window = {
    addEventListener: () => {
    },
  };

  global.document = {
    hasFocus: () => true,
    getElementsByTagName: () => ({}),
  };

  global.screen = {};
} else {
  context = window;
}

const P5 = require('p5');

context.define = function (_, _, callback) {
  callback(P5);
};
context.define.amd = true;

require('@code-dot-org/p5.play/lib/p5.play');

module.exports = function () {
  return new Promise(resolve => {
    new P5(p5Inst => resolve(p5Inst));
  });
};
