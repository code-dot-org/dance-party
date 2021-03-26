const test = require('tape');
const modifySongData = require('../../src/modifySongData');
const songData = require('../../metadata/jazzy_beats.json');

function songDataWithCustomOpts(energyCustomization) {
  return Object.assign({}, songData, { energyCustomization });
}

test('can successfully modify song data', t => {
  const modified = modifySongData(songData);
  // make sure we've returned a new object
  t.ok(modified !== songData);
  t.equal(songData.analysis.length, modified.analysis.length);

  // pick an arbitrary frame (just needs to be one with non-zero energy)
  const frame = 1000;

  // this is a pretty weak test. just make sure that we're giving different energy values
  t.notEqual(songData.analysis[frame].energy[0], modified.analysis[frame].energy[0]);

  // again pretty weak, but make sure that modifying our params gives us different
  // energy values
  const modifiedSmoothing = modifySongData(songDataWithCustomOpts({
    numDeviations: 1.5,
    smoothFactor: 0.5,
  }));
  const modifiedDeviations = modifySongData(songDataWithCustomOpts({
    numDeviations: 2,
    smoothFactor: 0.7,
  }));

  t.notEqual(modified.analysis[frame].energy[0], modifiedSmoothing.analysis[frame].energy[0]);
  t.notEqual(modified.analysis[frame].energy[0], modifiedDeviations.analysis[frame].energy[0]);

  t.end();
});

test('can specify representativeMeasureRange', t => {
  const modified = modifySongData(songDataWithCustomOpts({
    // default options
    numDeviations: 1.5,
    smoothFactor: 0.5,
    representativeMeasureRange: [5, 12]
  }));
  const modifiedRepresentativeRange = modifySongData(songDataWithCustomOpts({
    numDeviations: 1.5,
    smoothFactor: 0.5,
    representativeMeasureRange: [0, 100]
  }));

  // pick an arbitrary frame (just needs to be one with non-zero energy)
  const frame = 1000;

  // changing our representativeMeasureRange should change energy levels
  t.notEqual(modified.analysis[frame].energy[0], modifiedRepresentativeRange.analysis[frame].energy[0]);
  t.end();
});
