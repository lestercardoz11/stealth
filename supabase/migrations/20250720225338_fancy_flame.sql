/*
  # Vector Storage for RAG Implementation

  1. New Tables
    - `document_chunks` - Stores document chunks with embeddings for vector search
    
  2. Extensions
    - Enable pgvector extension for vector similarity search
    
  3. Functions
    - Vector similarity search function for RAG queries
    
  4. Security
    - RLS policies for document chunks based on document access
*/

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks table for RAG
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for faster document lookups
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);

-- Enable RLS
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_chunks
CREATE POLICY "Users can view chunks from accessible documents"
  ON document_chunks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_chunks.document_id
      AND (
        d.user_id = auth.uid() OR 
        d.is_company_wide = true OR
        public.is_admin(auth.uid())
      )
    ) AND public.is_approved_user(auth.uid())
  );

CREATE POLICY "Users can insert chunks for own documents"
  ON document_chunks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_chunks.document_id
      AND (d.user_id = auth.uid() OR public.is_admin(auth.uid()))
    ) AND public.is_approved_user(auth.uid())
  );

CREATE POLICY "Admins can manage all chunks"
  ON document_chunks
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Vector similarity search function
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