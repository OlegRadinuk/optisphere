import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { resolveBaseURL } from '@/lib/ai-config';
import { DEFAULT_BOT_MODEL, getModelRequestParams } from '@/lib/bots/model';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  baseURL: resolveBaseURL(process.env.AI_BASE_URL),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { messages: Array<{ role: string; content: string }> };
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length < 4) {
      return NextResponse.json({ summary: null });
    }

    const convo = messages
      .map(m => `${m.role === 'user' ? 'Клиент' : 'Опти'}: ${m.content.slice(0, 300)}`)
      .join('\n');

    const res = await anthropic.messages.create({
      model: DEFAULT_BOT_MODEL,
      // Ответ короткий, но токены размышления входят в max_tokens → запас ≥1024.
      ...getModelRequestParams(DEFAULT_BOT_MODEL, { legacyMaxTokens: 150, minTokens: 1024 }),
      messages: [{
        role: 'user',
        content: `Сделай резюме диалога в 1-2 предложения для AI-ассистента продавца. Укажи: ниша бизнеса клиента, что интересовало, оставил ли контакт. Только факты.\n\n${convo}`,
      }],
    });

    // На Haiku 5.5 первым блоком идёт thinking — берём первый блок type==="text".
    if (res.stop_reason === 'refusal') {
      console.warn(`[ai/summary] refusal category=${res.stop_details?.category ?? 'none'}`);
    }
    const textBlock = res.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    const summary = textBlock?.text.trim() || null;
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: null });
  }
}
