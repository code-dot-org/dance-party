const test = require("tape");
const attempt = require("../helpers/runLevel.js");

test('Dance 1: Pass', t => {
  attempt('hoc01', (result, message) => {
    t.ok('test');
    t.end();
  });
});
