const test = require('tape-async');
const modifySongData = require('../../src/modifySongData');
const songData = require('../../metadata/jazzy_beats.json');

test('can successfully modify song data', t => {
  const modified = modifySongData(songData, 1.5, 0.7);
  // make sure we've returned a new object
  t.ok(modified !== songData);

  // pick an arbitrary frame (just needs to be one with non-zero energy)
  const frame = 1000;

  // this is a pretty weak test. just make sure that we're giving different energy values
  t.notEqual(songData.analysis[frame].energy[0], modified.analysis[frame].energy[0]);

  // again pretty weak, but make sure that modifying our params gives us different
  // energy values
  const modifiedSmoothing = modifySongData(songData, 1.5, 0.5);
  const modifiedDeviations = modifySongData(songData, 2, 0.7);

  t.notEqual(modified.analysis[frame].energy[0], modifiedSmoothing.analysis[frame].energy[0]);
  t.notEqual(modified.analysis[frame].energy[0], modifiedDeviations.analysis[frame].energy[0]);

  t.end();
});
