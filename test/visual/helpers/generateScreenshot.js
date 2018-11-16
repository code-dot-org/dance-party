const createBackgroundScreenshot = require('./createBackgroundScreenshot');
/**
 * Run: 'node ./test/visual/helpers/generateScreenshot.js <effectName> <pathToDirectory>'
 *
 * For debugging 'npm run test:visual' failures.
 * Saves a screenshot of the background with the given effect name
 * to the test visual images folder.
 */

var args = process.argv.slice(2);
createBackgroundScreenshot(args[0], args[1]);
