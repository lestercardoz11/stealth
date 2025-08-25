import { createMocks } from 'node-mocks-http';
import { POST, GET } from '@/app/api/documents/route';
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
      order: jest.fn(() => ({
        or: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
    })),
  },
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe('/api/documents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return documents for authenticated user', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/documents',
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { status: 'approved', role: 'employee' },
        error: null,
      });

      mockSupabase.from().select().order().or.mockResolvedValue({
        data: [
          {
            id: 'doc-1',
            title: 'Test Document',
            user_id: 'user-1',
            is_company_wide: false,
          },
        ],
        error: null,
      });

      const response = await GET(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.documents).toHaveLength(1);
      expect(data.documents[0].title).toBe('Test Document');
    });

    it('should return 401 for unauthenticated user', async () => {
      const { req } = createMocks({
        method: 'GET',
        url: '/api/documents',
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const response = await GET(req as any);
      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should upload document successfully', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Test Document');
      formData.append('isCompanyWide', 'false');

      const { req } = createMocks({
        method: 'POST',
        body: formData,
      });

      // Mock successful authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      });

      // Mock user profile
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { status: 'approved', role: 'employee', email: 'test@test.com' },
        error: null,
      });

      // Mock storage upload
      mockSupabase.storage.from().upload.mockResolvedValue({
        data: { path: 'user-1/test-file.txt' },
        error: null,
      });

      // Mock database insert
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: {
          id: 'doc-1',
          title: 'Test Document',
          user_id: 'user-1',
          file_path: 'user-1/test-file.txt',
        },
        error: null,
      });

      const response = await POST(req as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.document.title).toBe('Test Document');
    });

    it('should reject files that are too large', async () => {
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', largeFile);
      formData.append('title', 'Large Document');

      const { req } = createMocks({
        method: 'POST',
        body: formData,
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });

    it('should reject unsupported file types', async () => {
      const file = new File(['test'], 'test.exe', { type: 'application/x-executable' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', 'Executable');

      const { req } = createMocks({
        method: 'POST',
        body: formData,
      });

      const response = await POST(req as any);
      expect(response.status).toBe(400);
    });
  });
});