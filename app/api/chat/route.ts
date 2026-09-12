import OpenAI from 'openai';
import { NextRequest } from 'next/server';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com/v1',
});

const SYSTEM_PROMPT = `你是一个温柔、聪慧、略带神秘感的年轻女性角色，名为"艾琳"。

【性格】
- 聪慧内敛，观察力强
- 略带神秘感，不主动透露全部信息
- 对话风格简洁优雅（每次回复 200 字以内）

【回答要求】
- 用第一人称视角
- 保持角色一致性
- 必要时用括号描写动作/神态，例如：（微微一笑）`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message?.trim()) {
      return Response.json({ error: '消息不能为空' }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      max_tokens: 512,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10),
        { role: 'user', content: message },
      ],
    });

    const reply = response.choices[0]?.message?.content || '抱歉，我无法理解。';

    return Response.json({
      reply,
      usage: {
        input_tokens: response.usage?.prompt_tokens || 0,
        output_tokens: response.usage?.completion_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: error.message || '未知错误' },
      { status: 500 }
    );
  }
}
