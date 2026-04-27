import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  baseURL: process.env.AI_BASE_URL,
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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Сделай резюме диалога в 1-2 предложения для AI-ассистента продавца. Укажи: ниша бизнеса клиента, что интересовало, оставил ли контакт. Только факты.\n\n${convo}`,
      }],
    });

    const summary = res.content[0]?.type === 'text' ? res.content[0].text.trim() : null;
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ summary: null });
  }
}
