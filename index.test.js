/* global it, expect */
const mainApp = require('./mainApp');

it('Ignored folder', () => {
  const expectedValue = mainApp.filterFiles('node_modules');
  expect(expectedValue).toStrictEqual(false);
});

it('Not ignored file', () => {
  const expectedValue = mainApp.filterFiles('dd.json');
  expect(expectedValue).toStrictEqual(true);
});
