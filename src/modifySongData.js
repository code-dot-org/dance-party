/**
 * This is derived from DanceParty.getCurrentMeasure, but don't want to explicitly
 * depend on DanceParty so that this could be easily moved to a preRender step in
 * the future.
 * @param {Object} songMetadata
 * @param {Number} time - Time provided in seconds
 */
function getMeasureForTime(songMetadata, time) {
  const measuresPerSecond = songMetadata.bpm / 240;
  const secondsElapsed = time - songMetadata.delay;
  return secondsElapsed * measuresPerSecond + 1;
}

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

function valueOrDefault(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }
  return value;
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
 * @param {options} object
 * @param {number} options.numDeviations - How many standard deviations in either
 *   direction from the mean we want to include in our new range
 * @param {number} options.smoothFactor - What percentage of previous frames to
 *   average into next frame (should be a number between 0 and 1
 * @param {number[2]} representativeIndexRange - The min/max index in the range
 *   of indices we want to look at when calculating our mean/std deviation
 */
function getFrequencyEnergy(energy, options = {}) {
  const numDeviations = valueOrDefault(options.numDeviations, 1.5);
  const smoothFactor = valueOrDefault(options.smoothFactor, 0.6);
  const representativeIndexRange = valueOrDefault(options.representativeIndexRange ||
    [0, energy.length]);

  // Energy values are all 0+
  const nonZero = energy.slice(...representativeIndexRange).filter(e => e > 0);
  const mean = calculateMean(nonZero);

  const stdDev = Math.sqrt(
    calculateMean(nonZero.map(x => Math.pow(mean - x, 2)))
  );

  if (stdDev === 0) {
    // Don't expect this to ever happen, but if it does lets just return our
    // initial energy rather than divide by zero later
    console.error('getFrequencyEnergy has standard deviation of zero');
    return energy;
  }

  const min = mean - stdDev * numDeviations;
  const max = mean + stdDev * numDeviations;

  const ret = energy.map(x => (clamp(min, max, x) - min) / (max - min) * 0xff);
  return smooth(ret, smoothFactor);
}

/**
 * Smooths out an array frame by frame. Each new frame consists of smoothFactor
 * percent of the previous frame and (1-smoothFactor) percent of the current frame
 * This is done so that sprites updates end up being more gradual instead of jerking
 * around
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
 * We also look for a field called energyCustomization on songData that should
 * allow us to tune some of these settings on a song by song basis (by updating
 * the relevant .json files).
 */
function modifySongData(songData) {
  const { analysis } = songData;
  if (!analysis) {
    return songData;
  }

  let customizationOptions = Object.assign({
    numDeviations: 1.5,
    smoothFactor: 0.7,
    representativeMeasureRange: [5, 12],
    // Any of the above options can be tuned per song by setting the respective
    // fields in songData.energyCustomization
  }, songData.energyCustomization);

  // Get the indices of the songData.analysis frames that fit within our measure
  // range
  const representativeIndices = analysis.map((item, index) => {
    const measure = getMeasureForTime(songData, item.time);
    if (measure >= customizationOptions.representativeMeasureRange[0] &&
        measure < customizationOptions.representativeMeasureRange[1] + 1) {
      return index;
    }
    return null;
  }).filter(x => x !== null);

  // The first and last indices into songData.analysis
  customizationOptions.representativeIndexRange = [
    representativeIndices[0],
    representativeIndices[representativeIndices.length - 1] + 1
  ];

  // One thing to note with the approach we've chosen: each song/energy band is
  // independently normalized around energy 128. This means even if a song is
  // very base heavy, the average bass and average treble will end up being the
  // same.
  const bass = getFrequencyEnergy(analysis.map(x => x.energy[0]), customizationOptions);
  const mid = getFrequencyEnergy(analysis.map(x => x.energy[1]), customizationOptions);
  const treble = getFrequencyEnergy(analysis.map(x => x.energy[2]), customizationOptions);

  // Create a new analysis that duplicates each frame, but replaces energy values
  // with our new ones
  const newAnalysis = analysis.map((currentFrame, i) => Object.assign({},
    currentFrame, { energy: [bass[i], mid[i], treble[i]] }));

  return Object.assign({}, songData, { analysis: newAnalysis });
}

module.exports = modifySongData;
