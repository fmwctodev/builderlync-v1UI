import { supabase, getUserId } from '../lib/supabase';
import { embeddingsService } from './embeddingsService';
import { knowledgeBaseService } from './knowledgeBaseService';

export interface WebSource {
  id: string;
  user_id: string;
  url: string;
  title: string | null;
  collection_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  last_scraped_at: string | null;
  error_message: string | null;
  metadata: Record<string, any>;
  auto_refresh: boolean;
  refresh_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  created_at: string;
  updated_at: string;
}

export interface ScrapeResult {
  success: boolean;
  title?: string;
  content?: string;
  chunks?: string[];
  metadata?: {
    description?: string;
    wordCount?: number;
  };
  error?: string;
}

export class WebScraperService {
  async scrapeUrl(url: string): Promise<ScrapeResult> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, maxChunkSize: 1000 }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape website');
      }

      const result: ScrapeResult = await response.json();
      return result;
    } catch (error) {
      console.error('Web scraping error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createWebSource(data: {
    url: string;
    collection_id?: string;
    auto_refresh?: boolean;
    refresh_frequency?: 'daily' | 'weekly' | 'monthly' | 'never';
  }): Promise<WebSource> {
    const userId = await getUserId();

    const { data: webSource, error } = await supabase
      .from('sierra_kb_web_sources')
      .insert({
        user_id: userId,
        url: data.url,
        collection_id: data.collection_id || null,
        auto_refresh: data.auto_refresh || false,
        refresh_frequency: data.refresh_frequency || 'weekly',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return webSource;
  }

  async importFromUrl(
    url: string,
    collectionId: string,
    options?: {
      autoRefresh?: boolean;
      refreshFrequency?: 'daily' | 'weekly' | 'monthly' | 'never';
    }
  ): Promise<{ webSource: WebSource; articles: any[] }> {
    const userId = await getUserId();

    const webSource = await this.createWebSource({
      url,
      collection_id: collectionId,
      auto_refresh: options?.autoRefresh,
      refresh_frequency: options?.refreshFrequency,
    });

    await this.updateWebSourceStatus(webSource.id, 'processing');

    try {
      const scrapeResult = await this.scrapeUrl(url);

      if (!scrapeResult.success || !scrapeResult.content) {
        await this.updateWebSourceStatus(webSource.id, 'failed', scrapeResult.error);
        throw new Error(scrapeResult.error || 'Failed to scrape content');
      }

      await this.updateWebSource(webSource.id, {
        title: scrapeResult.title || new URL(url).hostname,
        metadata: scrapeResult.metadata || {},
      });

      const articles = [];

      if (scrapeResult.chunks && scrapeResult.chunks.length > 0) {
        for (let i = 0; i < scrapeResult.chunks.length; i++) {
          const chunk = scrapeResult.chunks[i];
          const articleTitle = scrapeResult.chunks.length > 1
            ? `${scrapeResult.title || 'Web Content'} (Part ${i + 1})`
            : scrapeResult.title || 'Web Content';

          const article = await knowledgeBaseService.createArticle({
            title: articleTitle,
            content: chunk,
            collection_id: collectionId,
            status: 'published',
            priority: 'medium',
            allow_verbatim: false,
            source_url: url,
            web_source_id: webSource.id,
          });

          await embeddingsService.generateArticleEmbeddings(article);
          articles.push(article);
        }
      } else {
        const article = await knowledgeBaseService.createArticle({
          title: scrapeResult.title || 'Web Content',
          content: scrapeResult.content,
          collection_id: collectionId,
          status: 'published',
          priority: 'medium',
          allow_verbatim: false,
          source_url: url,
          web_source_id: webSource.id,
        });

        await embeddingsService.generateArticleEmbeddings(article);
        articles.push(article);
      }

      await this.updateWebSourceStatus(webSource.id, 'completed');
      await this.updateWebSource(webSource.id, {
        last_scraped_at: new Date().toISOString(),
      });

      const updatedWebSource = await this.getWebSource(webSource.id);

      return {
        webSource: updatedWebSource!,
        articles,
      };
    } catch (error) {
      await this.updateWebSourceStatus(
        webSource.id,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  async refreshWebSource(webSourceId: string): Promise<void> {
    const webSource = await this.getWebSource(webSourceId);
    if (!webSource) {
      throw new Error('Web source not found');
    }

    await this.updateWebSourceStatus(webSourceId, 'processing');

    try {
      const { data: existingArticles } = await supabase
        .from('sierra_kb_articles')
        .select('id')
        .eq('web_source_id', webSourceId);

      if (existingArticles && existingArticles.length > 0) {
        for (const article of existingArticles) {
          await knowledgeBaseService.deleteArticle(article.id);
        }
      }

      const scrapeResult = await this.scrapeUrl(webSource.url);

      if (!scrapeResult.success || !scrapeResult.content) {
        await this.updateWebSourceStatus(webSourceId, 'failed', scrapeResult.error);
        throw new Error(scrapeResult.error || 'Failed to scrape content');
      }

      await this.updateWebSource(webSourceId, {
        title: scrapeResult.title || webSource.title,
        metadata: scrapeResult.metadata || {},
      });

      if (scrapeResult.chunks && scrapeResult.chunks.length > 0) {
        for (let i = 0; i < scrapeResult.chunks.length; i++) {
          const chunk = scrapeResult.chunks[i];
          const articleTitle = scrapeResult.chunks.length > 1
            ? `${scrapeResult.title || 'Web Content'} (Part ${i + 1})`
            : scrapeResult.title || 'Web Content';

          const article = await knowledgeBaseService.createArticle({
            title: articleTitle,
            content: chunk,
            collection_id: webSource.collection_id!,
            status: 'published',
            priority: 'medium',
            allow_verbatim: false,
            source_url: webSource.url,
            web_source_id: webSourceId,
          });

          await embeddingsService.generateArticleEmbeddings(article);
        }
      }

      await this.updateWebSourceStatus(webSourceId, 'completed');
      await this.updateWebSource(webSourceId, {
        last_scraped_at: new Date().toISOString(),
      });
    } catch (error) {
      await this.updateWebSourceStatus(
        webSourceId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  async getWebSources(): Promise<WebSource[]> {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from('sierra_kb_web_sources')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getWebSource(id: string): Promise<WebSource | null> {
    const { data, error } = await supabase
      .from('sierra_kb_web_sources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async updateWebSource(id: string, updates: Partial<WebSource>): Promise<void> {
    const { error } = await supabase
      .from('sierra_kb_web_sources')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async updateWebSourceStatus(
    id: string,
    status: WebSource['status'],
    errorMessage?: string
  ): Promise<void> {
    const updates: any = { status };
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await supabase
      .from('sierra_kb_web_sources')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteWebSource(id: string): Promise<void> {
    const { data: articles } = await supabase
      .from('sierra_kb_articles')
      .select('id')
      .eq('web_source_id', id);

    if (articles && articles.length > 0) {
      for (const article of articles) {
        await knowledgeBaseService.deleteArticle(article.id);
      }
    }

    const { error } = await supabase
      .from('sierra_kb_web_sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
}

export const webScraperService = new WebScraperService();
