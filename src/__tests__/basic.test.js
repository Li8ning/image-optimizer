// Basic test to verify Jest setup
describe('Basic Jest Setup', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should pass another simple test', () => {
    expect('hello').toMatch('hello');
  });
});