-- Create knowledge base tables for Sierra AI

-- Sierra KB Articles table
CREATE TABLE sierra_kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  collection_id UUID,
  title TEXT,
  content TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sierra KB Q&A Pairs table
CREATE TABLE sierra_kb_qapairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  collection_id UUID,
  question_pattern TEXT NOT NULL,
  answer TEXT NOT NULL,
  intent TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'published',
  offer_to_book BOOLEAN DEFAULT false,
  allow_ranges BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Tables
CREATE TABLE knowledge_base_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  columns JSONB,
  row_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Base Table Rows
CREATE TABLE knowledge_base_table_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES knowledge_base_tables(id) ON DELETE CASCADE,
  row_index INTEGER NOT NULL,
  row_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sierra KB Documents table
CREATE TABLE sierra_kb_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT NOT NULL,
  collection_id UUID,
  title TEXT,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sierra_kb_articles_org ON sierra_kb_articles(organization_id);
CREATE INDEX idx_sierra_kb_articles_collection ON sierra_kb_articles(collection_id);
CREATE INDEX idx_sierra_kb_articles_status ON sierra_kb_articles(status);

CREATE INDEX idx_sierra_kb_qapairs_org ON sierra_kb_qapairs(organization_id);
CREATE INDEX idx_sierra_kb_qapairs_collection ON sierra_kb_qapairs(collection_id);
CREATE INDEX idx_sierra_kb_qapairs_intent ON sierra_kb_qapairs(intent);
CREATE INDEX idx_sierra_kb_qapairs_status ON sierra_kb_qapairs(status);

CREATE INDEX idx_knowledge_base_tables_org ON knowledge_base_tables(organization_id);
CREATE INDEX idx_knowledge_base_table_rows_table ON knowledge_base_table_rows(table_id);

CREATE INDEX idx_sierra_kb_documents_org ON sierra_kb_documents(organization_id);
CREATE INDEX idx_sierra_kb_documents_collection ON sierra_kb_documents(collection_id);
CREATE INDEX idx_sierra_kb_documents_status ON sierra_kb_documents(status);

-- Enable Row Level Security
ALTER TABLE sierra_kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_kb_qapairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_table_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE sierra_kb_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sierra_kb_articles
CREATE POLICY "Users can view articles in their organization" ON sierra_kb_articles
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can create articles in their organization" ON sierra_kb_articles
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can update articles in their organization" ON sierra_kb_articles
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can delete articles in their organization" ON sierra_kb_articles
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

-- RLS Policies for sierra_kb_qapairs
CREATE POLICY "Users can view QA pairs in their organization" ON sierra_kb_qapairs
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can create QA pairs in their organization" ON sierra_kb_qapairs
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can update QA pairs in their organization" ON sierra_kb_qapairs
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can delete QA pairs in their organization" ON sierra_kb_qapairs
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

-- RLS Policies for knowledge_base_tables
CREATE POLICY "Users can view tables in their organization" ON knowledge_base_tables
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can create tables in their organization" ON knowledge_base_tables
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can update tables in their organization" ON knowledge_base_tables
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can delete tables in their organization" ON knowledge_base_tables
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

-- RLS Policies for knowledge_base_table_rows
CREATE POLICY "Users can view table rows in their organization" ON knowledge_base_table_rows
  FOR SELECT USING (table_id IN (
    SELECT id FROM knowledge_base_tables WHERE organization_id IN (
      SELECT organization_id FROM staff WHERE id = auth.uid()::text
    )
  ));

CREATE POLICY "Users can create table rows in their organization" ON knowledge_base_table_rows
  FOR INSERT WITH CHECK (table_id IN (
    SELECT id FROM knowledge_base_tables WHERE organization_id IN (
      SELECT organization_id FROM staff WHERE id = auth.uid()::text
    )
  ));

CREATE POLICY "Users can update table rows in their organization" ON knowledge_base_table_rows
  FOR UPDATE USING (table_id IN (
    SELECT id FROM knowledge_base_tables WHERE organization_id IN (
      SELECT organization_id FROM staff WHERE id = auth.uid()::text
    )
  ));

CREATE POLICY "Users can delete table rows in their organization" ON knowledge_base_table_rows
  FOR DELETE USING (table_id IN (
    SELECT id FROM knowledge_base_tables WHERE organization_id IN (
      SELECT organization_id FROM staff WHERE id = auth.uid()::text
    )
  ));

-- RLS Policies for sierra_kb_documents
CREATE POLICY "Users can view documents in their organization" ON sierra_kb_documents
  FOR SELECT USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can create documents in their organization" ON sierra_kb_documents
  FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can update documents in their organization" ON sierra_kb_documents
  FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

CREATE POLICY "Users can delete documents in their organization" ON sierra_kb_documents
  FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM staff WHERE id = auth.uid()::text
  ));

-- Add comments for tracking
COMMENT ON TABLE sierra_kb_articles IS 'Stores knowledge base articles for Sierra AI. Created by: BuilderLync Team';
COMMENT ON TABLE sierra_kb_qapairs IS 'Stores Q&A pairs for Sierra AI knowledge base. Created by: BuilderLync Team';
COMMENT ON TABLE knowledge_base_tables IS 'Stores custom tables for knowledge base. Created by: BuilderLync Team';
COMMENT ON TABLE knowledge_base_table_rows IS 'Stores rows for knowledge base tables. Created by: BuilderLync Team';
COMMENT ON TABLE sierra_kb_documents IS 'Stores uploaded documents for knowledge base. Created by: BuilderLync Team';
