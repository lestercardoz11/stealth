import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/chat/route';
import { createClient } from '@/lib/utils/supabase/server';

// Mock Supabase
jest.mock('@/lib/utils/supabase/server');
jest.mock('@/lib/ai/document-processor');
jest.mock('@/lib/security/input-validation');
jest.mock('@/lib/security/audit-logger');

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe('/api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate chat response for authenticated user', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        messages: [
          { role: 'user', content: 'What are the key terms in this contract?' }
        ],
        documentIds: ['doc-1']
      },
    });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'test@test.com' } },
      error: null,
    });

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: { status: 'approved', role: 'employee', email: 'test@test.com' },
      error: null,
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBeDefined();
    expect(typeof data.response).toBe('string');
    expect(data.sources).toBeDefined();
    expect(Array.isArray(data.sources)).toBe(true);
  });

  it('should return 401 for unauthenticated user', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: 'Test message' }],
        documentIds: []
      },
    });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(401);
  });

  it('should return 400 for empty query', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        messages: [],
        documentIds: []
      },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });

  it('should handle long queries appropriately', async () => {
    const longQuery = 'x'.repeat(15000);
    const { req } = createMocks({
      method: 'POST',
      body: {
        messages: [{ role: 'user', content: longQuery }],
        documentIds: []
      },
    });

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });
});