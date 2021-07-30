/* global it, expect */
const mainApp = require('./mainApp');

it('Ignored folder', () => {
  const expectedValue = mainApp.filterFiles('node_modules');
  expect(expectedValue).toStrictEqual(false);
});

it('Not ignored folder', () => {
  const expectedValue = mainApp.filterFiles('dd');
  expect(expectedValue).toStrictEqual(true);
});
