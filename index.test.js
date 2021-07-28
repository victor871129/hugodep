import main from '.';

/* global it, expect */
it('Smoke test main', () => {
  main();
  expect(3).toBe(3);
});
