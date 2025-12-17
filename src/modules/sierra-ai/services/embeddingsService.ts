import { llmService } from './llmService';
import { supabase, getUserId } from '../lib/supabase';
import type { DatabaseKBArticle, DatabaseKBQAPair, EmbeddingSourceType } from '../lib/database.types';

export class EmbeddingsService {
  private readonly MAX_CHUNK_SIZE = 1000;

  async generateArticleEmbeddings(article: DatabaseKBArticle): Promise<void> {
    const chunks = this.chunkText(article.content, this.MAX_CHUNK_SIZE);

    await this.deleteExistingEmbeddings('article', article.id);

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await llmService.generateEmbedding(chunks[i]);

      await supabase
        .from('sierra_kb_embeddings')
        .insert({
          user_id: article.user_id,
          source_type: 'article',
          source_id: article.id,
          chunk_index: i,
          content: chunks[i],
          embedding
        });
    }
  }

  async generateQAPairEmbedding(qapair: DatabaseKBQAPair): Promise<void> {
    await this.deleteExistingEmbeddings('qapair', qapair.id);

    const combinedText = `Question: ${qapair.question_pattern}\nAnswer: ${qapair.answer}`;
    const embedding = await llmService.generateEmbedding(combinedText);

    await supabase
      .from('sierra_kb_embeddings')
      .insert({
        user_id: qapair.user_id,
        source_type: 'qapair',
        source_id: qapair.id,
        chunk_index: 0,
        content: combinedText,
        embedding
      });
  }

  async reindexAllKnowledge(): Promise<{ articles: number; qapairs: number }> {
    const userId = await getUserId();

    const { data: articles } = await supabase
      .from('sierra_kb_articles')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'published');

    const { data: qapairs } = await supabase
      .from('sierra_kb_qapairs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'published');

    let articleCount = 0;
    let qapairCount = 0;

    if (articles) {
      for (const article of articles) {
        try {
          await this.generateArticleEmbeddings(article);
          articleCount++;
        } catch (error) {
          console.error(`Error embedding article ${article.id}:`, error);
        }
      }
    }

    if (qapairs) {
      for (const qapair of qapairs) {
        try {
          await this.generateQAPairEmbedding(qapair);
          qapairCount++;
        } catch (error) {
          console.error(`Error embedding Q&A pair ${qapair.id}:`, error);
        }
      }
    }

    return { articles: articleCount, qapairs: qapairCount };
  }

  private async deleteExistingEmbeddings(sourceType: EmbeddingSourceType, sourceId: string): Promise<void> {
    await supabase
      .from('sierra_kb_embeddings')
      .delete()
      .eq('source_type', sourceType)
      .eq('source_id', sourceId);
  }

  private chunkText(text: string, maxChunkSize: number): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }
}

export const embeddingsService = new EmbeddingsService();
