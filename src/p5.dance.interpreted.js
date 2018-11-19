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
  Thriller: 11,
  XArmsSide: 12,
  XArmsUp: 13,
  XJump: 14,
  XClapSide: 15,
  XHeadHips: 16,
  XHighKick: 17,
  XBend: 18,
  XFever: 19,
  XHop: 20,
  XKnee: 21,
  XKneel: 22,
  XOle: 23,
  XSlide: 24,
};

var QueueType = {
  every: 'every',
  after: 'after',
  other: 'other'
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

/**
 * @returns {Object} An object with two arrays, each of which is a list of numbers
 */
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
 *  is another object, where the keys represent the param of the event to be run
 */
function runUserEvents(events) {
  // We have three separate event queues.
  // First we run every N seconds/measures events
  // Then we run after N seconds/measures events
  // Finally we run all other events

  var queues = {};
  Object.keys(QueueType).forEach(function(key) {
    queues[key] = [];
  });

  // Iterate through all of the inputEvents we've cached in the interpreter, looking
  // to see if they meet the criteria of the passed in events object. If they do,
  // we add them to the appropriate event queue
  for (var i = 0; i < inputEvents.length; i++) {
    var eventType = inputEvents[i].type;
    var param = inputEvents[i].param;
    var queueType = inputEvents[i].queueType;
    if (events[eventType] && events[eventType][param]) {
      if (!queues[queueType]) {
        throw new Error('Unknown queueType: ', queueType);
      }
      queues[queueType].push({
        priority: inputEvents[i].priority,
        func: inputEvents[i].func
      });
    }
  }

  function prioritySort(a, b) {
    // TODO: If compareFunction(a, b) returns 0, leave a and b unchanged with respect
    // to each other, but sorted with respect to all different elements. Note: the
    // ECMAscript standard does not guarantee this behaviour, and thus not all
    // browsers (e.g. Mozilla versions dating back to at least 2003) respect this.
    // ^ Matters to us, because we initially seed items according to block position
    // and we want to maintain that ordering in our sort when priorities are equal
    // There are ways we could ensure that
    return a.priority - b.priority;
  }

  function executeFuncs(item) {
    item.func();
  }

  queues[QueueType.every].sort(prioritySort).forEach(executeFuncs);
  queues[QueueType.after].sort(prioritySort).forEach(executeFuncs);
  queues[QueueType.other].forEach(executeFuncs);
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

/**
 * @param {string} key - Many options, including up, down, left, right, a-z, 0-9
 * @param {function} func - Code to run when event fires
 */
function whenKey(key, func) {
  inputEvents.push({
    type: 'this.p5_.keyWentDown',
    func: func,
    param: key,
    queueType: QueueType.other,
  });
}

/**
 * @param {string} range - Should be "bass", "mid", or "treble"
 * @param {function} func - Code to run when event fires
 */
function whenPeak(range, func) {
  inputEvents.push({
    type: 'Dance.fft.isPeak',
    func: func,
    param: range,
    queueType: QueueType.other,
  });
}

/**
 * @param {number} timestamp
 * @param {string} unit - Should be "measures" or "seconds"
 * @param {function} func - Code to run when event fires
 */
function atTimestamp(timestamp, unit, func) {
  // Despite the functions name, if we call atTimestamp(4, "measures", foo), we
  // actually want to fire on the 5th measure (i.e after 4 measures have completed)
  if (unit === "measures") {
    timestamp += 1;
  }

  inputEvents.push({
    type: 'cue-' + unit,
    func: func,
    param: timestamp,
    queueType: QueueType.after,
    // actual priority value is inconsequential here
    priority: 0,
  });
}

/**
 * @param {number} n
 * @param {string} unit - Should be "measures" or "seconds"
 * @param {function} func - Code to run when event fires
 */
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

/**
 * @param {number} n
 * @param {string} unit - Should be "measures" or "seconds"
 * @param {number} start
 * @param {number} stop
 * @param {function} func - Code to run when event fires
 */
function everySecondsRange(n, unit, start, stop, func) {
  if (n <= 0) {
    return;
  }

  // Limit minimum event interval to avoid performance problems
  // from student code like `every 0.001 seconds do...`
  if ('seconds' === unit) {
    // Maximum of 10 events per second
    // Our fastest song is 169bpm
    // This allows events on eighth-notes in that song.
    n = Math.max(0.1, n);
  } else {
    // Maximum of ten events per measure
    // Our fastest song is 169bpm
    // This allows events every 142ms in that song
    n = Math.max(0.1, n);
  }

  // Offset by n so that we don't generate an event at the beginning
  // of the first period.
  var timestamp = start + n;

  while (timestamp < stop) {
    inputEvents.push({
      type: 'cue-' + unit,
      func: func,
      param: timestamp,
      queueType: QueueType.every,
      priority: n
    });
    timestamp += n;
  }
}

/**
 * @param {string} unit - Should be "verse" or "chorus"
 * @param {function} func - Code to run when event fires
 */
function everyVerseChorus(unit, func) {
  inputEvents.push({
    type: 'verseChorus',
    func: func,
    param: unit
  });
}
