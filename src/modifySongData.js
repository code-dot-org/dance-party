function clamp(min, max, val) {
  return Math.max(
    min,
    Math.min(max, val)
  );
}

function calculateMean(vals) {
  let sum = vals.reduce((sum, cur) => sum + cur, 0);
  return sum / vals.length;
}

/**
 * This method takes an input list of energy values, and outputs a new list. THe
 * methodology for figuring out the new list is to calculate the mean and standard
 * deviation of the input values (ignoring zeros). We then define a new range
 * consisting of some number of standard deviations in either direction from the
 * mean. Old values are then clamped to our new range, and normalized. Finally
 * we do some smoothing between frames, based on our smooth factor
 * @param {number[]} energy - A list of energy values for a single frequency band
 *   (i.e. bass, mid, high) with values ranging from 0, 255
 * @param {number} numDeviations - How many standard deviations in either direction
 *   from the mean we want to include in our new range
 * @param {number} smoothFactor - What percentage of previous frames to average
 *   into next frame (should be a number between 0 and 1
 */
function getFrequencyEnergy(energy, numDeviations=1.5, smoothFactor=0.7) {
  const nonZero = energy.filter(e => e > 0);
  const mean = calculateMean(nonZero);

  const stdDev = Math.sqrt(
    calculateMean(nonZero.map(x => Math.pow(mean - x, 2)))
  );

  const min = mean - stdDev * numDeviations;
  const max = mean + stdDev * numDeviations;

  const ret = energy.map(x => (clamp(min, max, x) - min) / (max - min) * 0xff);
  return smooth(ret, smoothFactor);
}

/**
 * Smooths out an array frame by frame. Each new frame consists of smoothFactor
 * percent of the previous frame and (1-smoothFactor) percent of the current frame
 * This method mutates the input rg
 * @param {number[]} rg
 * @param {number} smoothFactor
 */
function smooth(rg, smoothFactor) {
  for (let i = 1; i < rg.length; i++) {
    rg[i] = rg[i-1] * smoothFactor + rg[i] * (1 - smoothFactor);
  }
  return rg;
}

/**
 * This method takes our song data and modifies the energy values. In an ideal
 * world (and hopefully in the future) this happens as part of our pre-render
 * pipeline, but for now it's easier to do this at runtime than it is for us to
 * regenerate all of our .json files.
 */
function modifySongData(songData, numDeviations=1.5, smoothFactor=0.7) {
  const { analysis } = songData;
  if (!analysis) {
    return songData;
  }

  // One thing to note with the approach we've chosen: each song/energy band is
  // independently normalized around energy 128. This means even if a song is
  // very base heavy, the average bass and average treble will end up being the
  // same.
  const bass = getFrequencyEnergy(analysis.map(x => x.energy[0]), numDeviations, smoothFactor);
  const mid = getFrequencyEnergy(analysis.map(x => x.energy[1]), numDeviations, smoothFactor);
  const treble = getFrequencyEnergy(analysis.map(x => x.energy[2]), numDeviations, smoothFactor);

  // Create a new analysis that duplicates each frame, but replaces energy values
  // with out new ones
  const newAnalysis = analysis.map((currentFrame, i) => Object.assign({},
    currentFrame, { energy: [bass[i], mid[i], treble[i]] }));

  return Object.assign({}, songData, { analysis: newAnalysis });
}

module.exports = modifySongData;
