import { NextRequest, NextResponse } from 'next/server';
import { Stream } from 'openai/streaming';
import { ChatCompletionChunk } from 'openai/resources';
import { qwenClient, QWEN_MODEL, buildPrompt } from '@/lib/qwen';
import { updateAISuggestion } from '@/lib/submission';
import { updateLarkAISuggestion } from '@/lib/lark';

// 设置最大执行时间为 5 分钟（Next.js Route Handler）
export const maxDuration = 300;

/**
 * POST /api/ai/suggest?submissionId=xxx
 * 流式生成 AI 择校建议
 * Body: { formData, lang, token }
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('submissionId');

  if (!submissionId) {
    return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 });
  }

  const { formData, lang, token } = await request.json();

  if (!formData) {
    return NextResponse.json({ error: 'Missing formData' }, { status: 400 });
  }

  // 构建 Prompt
  const prompt = buildPrompt(formData, lang || 'zh');

  // 创建流式响应
  const encoder = new TextEncoder();
  let fullContent = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // QwQ 模型：enable_thinking=true 开启深度思考
        // 深度思考内容在 reasoning_content 字段，最终答案在 content 字段
        // 我们只流式输出最终 content，不输出 thinking 过程
        const createParams: any = {
          model: QWEN_MODEL,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          // QwQ-Plus 深度思考开关（关闭以加快响应速度）
          enable_thinking: false,
        };
        const response = await qwenClient.chat.completions.create(createParams) as unknown as Stream<ChatCompletionChunk>;

        for await (const chunk of response) {
          const delta = chunk.choices[0]?.delta as any;

          // 跳过 thinking 内容（reasoning_content），只流式输出 content
          if (delta?.content) {
            fullContent += delta.content;
            controller.enqueue(encoder.encode(delta.content));
          }
        }

        controller.close();

        // 流式结束后，并行更新 Supabase + 飞书 AI建议
        if (fullContent && submissionId) {
          updateAISuggestion(submissionId, fullContent).catch((err) => {
            console.error('[AI] Failed to update Supabase:', err);
          });

          if (token) {
            updateLarkAISuggestion(token, fullContent).catch((err) => {
              console.error('[Lark] Failed to update AI suggestion:', err);
            });
          }
        }
      } catch (error: any) {
        console.error('[AI] Streaming error:', error);
        const errMsg = lang === 'zh'
          ? '\n\n[AI 生成出现错误，请联系顾问手动出具建议]'
          : '\n\n[AI generation error. Please contact your advisor for manual recommendations.]';
        controller.enqueue(encoder.encode(errMsg));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

