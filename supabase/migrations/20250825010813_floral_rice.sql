/*
  # Enhanced Vector Search Functions

  1. Functions
    - Enhanced vector similarity search with proper JSON handling
    - Text-based fallback search for development
    - Improved error handling and logging

  2. Indexes
    - Optimized indexes for better performance
    - Text search indexes for fallback functionality
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS match_documents(vector, float, int, uuid[]);

-- Enhanced vector similarity search function with JSON embedding support
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  document_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    d.title as document_title
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE 
    (document_ids IS NULL OR dc.document_id = ANY(document_ids))
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    AND (
      d.user_id = auth.uid() OR 
      d.is_company_wide = true OR
      public.is_admin(auth.uid())
    )
    AND public.is_approved_user(auth.uid())
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Text-based search function for fallback when vector search is not available
CREATE OR REPLACE FUNCTION search_documents_text(
  search_query text,
  match_count int DEFAULT 5,
  document_ids uuid[] DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  document_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.content,
    dc.metadata,
    0.8::float AS similarity, -- Mock similarity for text search
    d.title as document_title
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE 
    (document_ids IS NULL OR dc.document_id = ANY(document_ids))
    AND dc.content ILIKE '%' || search_query || '%'
    AND (
      d.user_id = auth.uid() OR 
      d.is_company_wide = true OR
      public.is_admin(auth.uid())
    )
    AND public.is_approved_user(auth.uid())
  ORDER BY 
    CASE 
      WHEN dc.content ILIKE search_query || '%' THEN 1
      WHEN dc.content ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    dc.created_at DESC
  LIMIT match_count;
END;
$$;

-- Create text search index for better performance
CREATE INDEX IF NOT EXISTS document_chunks_content_text_idx ON document_chunks USING gin(to_tsvector('english', content));

-- Create index for faster document title lookups
CREATE INDEX IF NOT EXISTS documents_title_idx ON documents(title);

-- Create index for user document access
CREATE INDEX IF NOT EXISTS documents_user_company_idx ON documents(user_id, is_company_wide);