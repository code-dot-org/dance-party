/* eslint-disable */

var sprites = 'all'; // compat

// Needed for block dropdown enum options.
var MOVES = {
  Rest: 0,
  ClapHigh: 1,
  Clown: 2,
  Dab: 3,
  DoubleJam: 4,
  Drop: 5,
  Floss: 6,
  Fresh: 7,
  Kick: 8,
  Roll: 9,
  ThisOrThat: 10,
  Thriller: 11
};

// Event handlers, loops, and callbacks.
var inputEvents = [];
var setupCallbacks = [];

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCueList() {
  var timestamps = [];
  var measures = [];
  for (var i = 0; i < inputEvents.length; i++) {
    if (inputEvents[i].type === 'cue-seconds') {
      timestamps.push(inputEvents[i].param);
    } else if (inputEvents[i].type === 'cue-measures') {
      measures.push(inputEvents[i].param);
    }
  }
  return {
    seconds: timestamps,
    measures: measures
  };
}

function registerSetup(callback) {
  setupCallbacks.push(callback);
}

function runUserSetup() {
  setupCallbacks.forEach(function (callback) {
    callback();
  });
}

/**
 * @param {Object} events - An object where each key is an event type. Each value
 *  is another object, where the keys represeent the param of the event to be run
 */
function runUserEvents(events) {
  var functionsToRun = {};

  // Iterate through all of the inputEvents we've cached in the interpreter, looking
  // to see if they meet the criteria of the passed in events object. If they do,
  // we add them to our functionsToRun object.
  for (var i = 0; i < inputEvents.length; i++) {
    var eventType = inputEvents[i].type;
    var func = inputEvents[i].func;
    var param = inputEvents[i].param;
    var priority = inputEvents[i].priority;
    if (events[eventType] && events[eventType][param]) {
      //If there are multiple cues of the same type, only run the event with the highest priority
      if (!functionsToRun[eventType] || functionsToRun[eventType].priority < priority) {
        functionsToRun[eventType] = {
          func: func,
          priority: priority
        };
      }
    }
  }

  // execute functions
  Object.keys(functionsToRun).forEach(key => functionsToRun[key].func());
}

function whenSetup(event) {
  setupCallbacks.push(event);
}

function whenSetupSong(song, event) {
  setupCallbacks.push(event);
}

function ifDanceIs(sprite, dance, ifStatement, elseStatement) {
  if (getCurrentDance(sprite) == Number(dance)) {
    ifStatement();
  } else {
    elseStatement();
  }
}

function whenKey(key, func) {
  inputEvents.push({
    type: 'this.p5_.keyWentDown',
    func: func,
    param: key
  });
}

function whenPeak(range, func) {
  inputEvents.push({
    type: 'Dance.fft.isPeak',
    func: func,
    param: range
  });
}

function atTimestamp(timestamp, unit, func) {
  if (unit === "measures") {
    timestamp += 1;
  }

  // Increment priority by 1 to account for 'atTimestamp' events having a higher priority
  // than everySecond events when they have share a timestamp parameter
  inputEvents.push({
    type: 'cue-' + unit,
    func: func,
    param: timestamp,
    priority: timestamp + 1
  });
}

function everySeconds(n, unit, func) {
  // Measures start counting at 1, whereas seconds start counting at 0.
  // e.g. "every 4 measures" will generate events at "5, 9, 13" measures.
  // e.g. "every 0.25 seconds" will generate events at "0.25, 0.5, 0.75" seconds.
  var start, stop;
  if (unit === "measures") {
    start = 1;
    // TODO: 90 seconds is the max for songs, but 90 measures is too long
    stop = 91;
  } else {
    start = 0;
    stop = 90;
  }
  everySecondsRange(n, unit, start, stop, func);
}

function everySecondsRange(n, unit, start, stop, func) {
  if (n > 0) {
    // Offset by n so that we don't generate an event at the beginning
    // of the first period.
    var timestamp = start + n;

    while (timestamp < stop) {
      inputEvents.push({
        type: 'cue-' + unit,
        func: func,
        param: timestamp,
        priority: n
      });
      timestamp += n;
    }
  }
}

function everyVerseChorus(unit, func) {
  inputEvents.push({
    type: 'verseChorus',
    func: func,
    param: unit
  });
}
