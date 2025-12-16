import { supabase, getUserId } from '../lib/supabase';
import type {
  DatabaseKBCollection,
  DatabaseKBArticle,
  DatabaseKBQAPair,
  DatabaseKBTable,
  DatabaseKBTableRow
} from '../lib/database.types';

export class KnowledgeBaseService {
  async getCollections(): Promise<DatabaseKBCollection[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createCollection(collection: Partial<DatabaseKBCollection>): Promise<DatabaseKBCollection> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_collections')
      .insert({
        user_id: userId,
        created_by_user_id: userId,
        ...collection
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCollection(id: string, updates: Partial<DatabaseKBCollection>): Promise<DatabaseKBCollection> {
    const { data, error } = await supabase
      .from('sierra_kb_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCollection(id: string): Promise<void> {
    const { error } = await supabase
      .from('sierra_kb_collections')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getArticles(collectionId?: string, status?: 'draft' | 'published'): Promise<DatabaseKBArticle[]> {
    const userId = await getUserId();

    let query = supabase
      .from('sierra_kb_articles')
      .select('*')
      .eq('user_id', userId);

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error} = await query;

    if (error) throw error;
    return data || [];
  }

  async getArticle(id: string): Promise<DatabaseKBArticle | null> {
    const { data, error } = await supabase
      .from('sierra_kb_articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createArticle(article: Partial<DatabaseKBArticle>): Promise<DatabaseKBArticle> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_articles')
      .insert({
        user_id: userId,
        created_by_user_id: userId,
        ...article
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateArticle(id: string, updates: Partial<DatabaseKBArticle>): Promise<DatabaseKBArticle> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_articles')
      .update({
        ...updates,
        updated_by_user_id: userId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
      .from('sierra_kb_articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getQAPairs(intent?: string, status?: 'draft' | 'published'): Promise<DatabaseKBQAPair[]> {
    const userId = await getUserId();

    let query = supabase
      .from('sierra_kb_qapairs')
      .select('*')
      .eq('user_id', userId);

    if (intent) {
      query = query.eq('intent', intent);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getQAPair(id: string): Promise<DatabaseKBQAPair | null> {
    const { data, error } = await supabase
      .from('sierra_kb_qapairs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createQAPair(qapair: Partial<DatabaseKBQAPair>): Promise<DatabaseKBQAPair> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_qapairs')
      .insert({
        user_id: userId,
        created_by_user_id: userId,
        ...qapair
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQAPair(id: string, updates: Partial<DatabaseKBQAPair>): Promise<DatabaseKBQAPair> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_qapairs')
      .update({
        ...updates,
        updated_by_user_id: userId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteQAPair(id: string): Promise<void> {
    const { error } = await supabase
      .from('sierra_kb_qapairs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTables(collectionId?: string): Promise<DatabaseKBTable[]> {
    const userId = await getUserId();

    let query = supabase
      .from('knowledge_base_tables')
      .select('*')
      .eq('user_id', userId);

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getTable(id: string): Promise<DatabaseKBTable | null> {
    const { data, error } = await supabase
      .from('knowledge_base_tables')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createTable(table: Partial<DatabaseKBTable>, rows: Record<string, any>[]): Promise<DatabaseKBTable> {
    const userId = await getUserId();

    const { data: tableData, error: tableError } = await supabase
      .from('knowledge_base_tables')
      .insert({
        user_id: userId,
        created_by: userId,
        ...table,
        row_count: rows.length
      })
      .select()
      .single();

    if (tableError) throw tableError;

    if (rows.length > 0) {
      const rowsToInsert = rows.map((row, index) => ({
        table_id: tableData.id,
        row_index: index,
        row_data: row
      }));

      const { error: rowsError } = await supabase
        .from('knowledge_base_table_rows')
        .insert(rowsToInsert);

      if (rowsError) throw rowsError;
    }

    return tableData;
  }

  async updateTable(id: string, updates: Partial<DatabaseKBTable>): Promise<DatabaseKBTable> {
    const { data, error } = await supabase
      .from('knowledge_base_tables')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTable(id: string): Promise<void> {
    const { error } = await supabase
      .from('knowledge_base_tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTableRows(tableId: string, limit?: number, offset?: number): Promise<DatabaseKBTableRow[]> {
    let query = supabase
      .from('knowledge_base_table_rows')
      .select('*')
      .eq('table_id', tableId)
      .order('row_index', { ascending: true });

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 100) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
