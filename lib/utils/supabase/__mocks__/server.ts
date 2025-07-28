export const createClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } }),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: { id: '123', email: 'test@test.com' } }),
      })),
    })),
  })),
}));
