export const cookies = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn(),
  getAll: jest.fn(),
  [Symbol.iterator]: jest.fn(),
}));
