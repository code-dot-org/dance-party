/**
 * This file is used by both our dev/demo process, and our tests (and thus must
 * run in both Node and Browser)
 */

const DanceAPI = require('../../src/api');

/**
 * Inject p5.dance.interpreted code directly (this is only acceptable because we
 * don't have untrusted user input in our dev env). Also attach all functionNames
 * to the global namespace so that they can be called from the console, making
 * for easier testing
 * @returns {Object} Object containing each of the functions listed in functionNames
 */
module.exports = function (api, interpretedCode, userCode='') {
  // This list is not exhaustive, and more can/should be added as needed
  const functionNames = [
    'atTimestamp',
    'everySeconds',
    'everySecondsRange',
    'everyVerseChorus',
    'runUserSetup',
    'runUserEvents',
    'getCueList',
  ];

  const globals = new DanceAPI(api);
  const code = interpretedCode + userCode + `return {${functionNames.map(s => `${s}:${s}`).join(',')}};`;

  const params = [];
  const args = [];
  for (let k of Object.keys(globals)) {
    params.push(k);
    args.push(globals[k]);
  }
  params.push(code);
  const ctor = function () {
    return Function.apply(this, params);
  };
  ctor.prototype = Function.prototype;
  return new ctor().apply(null, args);
};
