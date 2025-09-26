// Basic test to verify test infrastructure works
test('basic test infrastructure', () => {
  expect(1 + 1).toBe(2);
});

test('environment check', () => {
  expect(process.env.NODE_ENV).toBeDefined();
});
