import { useState, useEffect } from 'react';
import { knowledgeBaseService, embeddingsService } from '../services';
import type {
  DatabaseKBCollection,
  DatabaseKBArticle,
  DatabaseKBQAPair
} from '../lib/database.types';

export function useKnowledgeBase() {
  const [collections, setCollections] = useState<DatabaseKBCollection[]>([]);
  const [articles, setArticles] = useState<DatabaseKBArticle[]>([]);
  const [qapairs, setQAPairs] = useState<DatabaseKBQAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [collectionsData, articlesData, qaData] = await Promise.all([
        knowledgeBaseService.getCollections(),
        knowledgeBaseService.getArticles(),
        knowledgeBaseService.getQAPairs()
      ]);
      setCollections(collectionsData);
      setArticles(articlesData);
      setQAPairs(qaData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load knowledge base');
      console.error('Error loading knowledge base:', err);
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (article: Partial<DatabaseKBArticle>) => {
    try {
      const created = await knowledgeBaseService.createArticle(article);
      setArticles(prev => [created, ...prev]);

      if (created.status === 'published') {
        await embeddingsService.generateArticleEmbeddings(created);
      }

      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
      throw err;
    }
  };

  const updateArticle = async (id: string, updates: Partial<DatabaseKBArticle>) => {
    try {
      const updated = await knowledgeBaseService.updateArticle(id, updates);
      setArticles(prev => prev.map(a => a.id === id ? updated : a));

      if (updated.status === 'published') {
        await embeddingsService.generateArticleEmbeddings(updated);
      }

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
      throw err;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await knowledgeBaseService.deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
      throw err;
    }
  };

  const createQAPair = async (qapair: Partial<DatabaseKBQAPair>) => {
    try {
      const created = await knowledgeBaseService.createQAPair(qapair);
      setQAPairs(prev => [created, ...prev]);

      if (created.status === 'published') {
        await embeddingsService.generateQAPairEmbedding(created);
      }

      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create Q&A pair');
      throw err;
    }
  };

  const updateQAPair = async (id: string, updates: Partial<DatabaseKBQAPair>) => {
    try {
      const updated = await knowledgeBaseService.updateQAPair(id, updates);
      setQAPairs(prev => prev.map(q => q.id === id ? updated : q));

      if (updated.status === 'published') {
        await embeddingsService.generateQAPairEmbedding(updated);
      }

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Q&A pair');
      throw err;
    }
  };

  const deleteQAPair = async (id: string) => {
    try {
      await knowledgeBaseService.deleteQAPair(id);
      setQAPairs(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete Q&A pair');
      throw err;
    }
  };

  const reindexAll = async () => {
    try {
      setLoading(true);
      const result = await embeddingsService.reindexAllKnowledge();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reindex knowledge base');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    collections,
    articles,
    qapairs,
    loading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    createQAPair,
    updateQAPair,
    deleteQAPair,
    reindexAll,
    reload: loadAll
  };
}
