import type { SSEStreamEvent } from '../types/sierraAssistant';

export async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: SSEStreamEvent) => void
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        continue;
      }
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === 'object' && 'type' in parsed) {
            onEvent(parsed as SSEStreamEvent);
          }
        } catch {
          // skip malformed
        }
      }
    }
  }
}

export function buildSSERequest(
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
  body: Record<string, unknown>
): Request {
  const url = `${supabaseUrl}/functions/v1/sierra-assistant-chat`;
  return new Request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'Apikey': anonKey,
    },
    body: JSON.stringify(body),
  });
}
