import type { ConversationResponse, SierraAction } from '../lib/database.types';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export class LLMService {
  private apiKey: string;
  private model: string = 'gpt-4-turbo-preview';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not configured');
    }
  }

  async chat(messages: LLMMessage[], functions?: LLMFunction[]): Promise<ConversationResponse> {
    if (!this.apiKey) {
      return this.getMockResponse(messages);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          functions,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const choice = data.choices[0];

      if (choice.message.function_call) {
        return this.parseFunctionCall(choice.message);
      }

      return {
        reply_text: choice.message.content || '',
        actions: [],
        confidence: 0.8
      };
    } catch (error) {
      console.error('LLM Service error:', error);
      return this.getMockResponse(messages);
    }
  }

  private parseFunctionCall(message: any): ConversationResponse {
    const functionName = message.function_call.name;
    const args = JSON.parse(message.function_call.arguments);

    const actionMap: Record<string, SierraAction['type']> = {
      'create_contact': 'create_contact',
      'create_opportunity': 'create_opportunity',
      'book_appointment': 'book_appointment',
      'escalate_to_human': 'escalate',
      'capture_contact_info': 'capture_info'
    };

    const action: SierraAction = {
      type: actionMap[functionName] || 'capture_info',
      data: args
    };

    return {
      reply_text: message.content || this.getDefaultReplyForAction(action.type),
      actions: [action],
      confidence: 0.9
    };
  }

  private getDefaultReplyForAction(actionType: SierraAction['type']): string {
    const replies: Record<SierraAction['type'], string> = {
      'create_contact': 'I\'ve captured your information.',
      'create_opportunity': 'I\'ve created a lead for you.',
      'book_appointment': 'Great! Let me help you schedule an appointment.',
      'escalate': 'Let me connect you with someone who can help.',
      'capture_info': 'Thank you for that information.'
    };
    return replies[actionType];
  }

  private getMockResponse(messages: LLMMessage[]): ConversationResponse {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

    const lowerMessage = lastUserMessage.toLowerCase();

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
      return {
        reply_text: 'Our pricing varies based on the specific project. I\'d be happy to schedule a free estimate for you. Would you like to book an appointment?',
        actions: [],
        confidence: 0.85
      };
    }

    if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
      return {
        reply_text: 'I can help you schedule an appointment. What day works best for you?',
        actions: [{
          type: 'book_appointment',
          data: { intent: 'booking_started' }
        }],
        confidence: 0.9
      };
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return {
        reply_text: 'Hello! Thanks for reaching out. How can I help you today?',
        actions: [],
        confidence: 0.95
      };
    }

    return {
      reply_text: 'Thank you for your message. I\'m here to help! Could you tell me more about what you need?',
      actions: [],
      confidence: 0.7
    };
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      return this.getMockEmbedding(text);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI Embeddings API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return this.getMockEmbedding(text);
    }
  }

  private getMockEmbedding(text: string): number[] {
    const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    return Array.from({ length: 1536 }, (_, i) => random(hash + i));
  }

  getFunctionsSchema(): LLMFunction[] {
    return [
      {
        name: 'create_contact',
        description: 'Create a new contact record when capturing customer information',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Full name of the contact' },
            phone: { type: 'string', description: 'Phone number' },
            email: { type: 'string', description: 'Email address' },
            address: { type: 'string', description: 'Property address' }
          },
          required: ['name']
        }
      },
      {
        name: 'book_appointment',
        description: 'Book an appointment for the customer',
        parameters: {
          type: 'object',
          properties: {
            appointment_type: { type: 'string', description: 'Type of appointment' },
            preferred_date: { type: 'string', description: 'Preferred date in YYYY-MM-DD format' },
            preferred_time: { type: 'string', description: 'Preferred time' },
            notes: { type: 'string', description: 'Additional notes' }
          },
          required: ['appointment_type']
        }
      },
      {
        name: 'escalate_to_human',
        description: 'Escalate the conversation to a human agent',
        parameters: {
          type: 'object',
          properties: {
            reason: { type: 'string', description: 'Reason for escalation' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'] }
          },
          required: ['reason']
        }
      }
    ];
  }
}

export const llmService = new LLMService();
