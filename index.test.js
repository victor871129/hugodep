const mainApp = require('./main');

/* global it, expect */
it('Smoke test main', () => {
  mainApp.main();
  expect(3).toBe(3); // TODO
});
