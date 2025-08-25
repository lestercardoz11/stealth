import { createClient } from '@/lib/utils/supabase/server';
import { processDocumentText, searchDocuments } from '@/lib/ai/document-processor';

// Mock Supabase
jest.mock('@/lib/utils/supabase/server');

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(),
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      in: jest.fn(),
      ilike: jest.fn(),
      limit: jest.fn(),
      textSearch: jest.fn(),
    })),
  })),
  rpc: jest.fn(),
};

(createClient as jest.Mock).mockResolvedValue(mockSupabase);

describe('Document Processing Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processDocumentText', () => {
    it('should process document text and store chunks', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
      mockSupabase.from().insert().select.mockReturnValue(mockInsert);

      const documentId = 'doc-1';
      const text = 'This is a test document. It contains multiple sentences. Each sentence will be processed separately.';

      await processDocumentText(documentId, text, { title: 'Test Doc' });

      expect(mockSupabase.from).toHaveBeenCalledWith('document_chunks');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should handle empty text gracefully', async () => {
      const documentId = 'doc-1';
      const text = '';

      await expect(processDocumentText(documentId, text)).resolves.not.toThrow();
    });

    it('should continue processing even if some chunks fail', async () => {
      const mockInsert = jest.fn()
        .mockResolvedValueOnce({ data: null, error: null })
        .mockRejectedValueOnce(new Error('Chunk failed'))
        .mockResolvedValueOnce({ data: null, error: null });

      mockSupabase.from().insert().select.mockReturnValue(mockInsert);

      const documentId = 'doc-1';
      const text = 'First sentence. Second sentence. Third sentence.';

      await expect(processDocumentText(documentId, text)).resolves.not.toThrow();
      expect(mockInsert).toHaveBeenCalledTimes(3);
    });
  });

  describe('searchDocuments', () => {
    it('should search documents using text search fallback', async () => {
      const mockData = [
        {
          id: 'chunk-1',
          document_id: 'doc-1',
          content: 'Test content',
          metadata: {},
          documents: { title: 'Test Document' }
        }
      ];

      mockSupabase.from().select().textSearch().limit.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const results = await searchDocuments('test query', ['doc-1']);

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Test content');
      expect(results[0].document_title).toBe('Test Document');
    });

    it('should fallback to ILIKE search when text search fails', async () => {
      const mockData = [
        {
          id: 'chunk-1',
          document_id: 'doc-1',
          content: 'Test content',
          metadata: {},
          documents: { title: 'Test Document' }
        }
      ];

      // First call (textSearch) fails
      mockSupabase.from().select().textSearch().limit.mockRejectedValue(new Error('Text search failed'));
      
      // Second call (ilike) succeeds
      mockSupabase.from().select().ilike().limit.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const results = await searchDocuments('test query');

      expect(results).toHaveLength(1);
      expect(results[0].similarity).toBe(0.8); // Mock similarity
    });

    it('should return empty array on search failure', async () => {
      mockSupabase.from().select().textSearch().limit.mockRejectedValue(new Error('Search failed'));
      mockSupabase.from().select().ilike().limit.mockRejectedValue(new Error('Fallback failed'));

      const results = await searchDocuments('test query');

      expect(results).toHaveLength(0);
    });
  });
});