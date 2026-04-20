import { NextRequest, NextResponse } from 'next/server';
import { validateToken, markTokenAsUsed } from '@/lib/token';
import { saveSubmission } from '@/lib/submission';
import { createLarkRecord } from '@/lib/lark';

/**
 * POST /api/submit
 * 学生提交表单 — 同时写入 Supabase + 飞书（AI建议留空）
 */
export async function POST(request: NextRequest) {
  try {
    const { token, tokenId, formData } = await request.json();

    if (!token || !tokenId || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 再次校验 Token（防止重复提交）
    const tokenRecord = await validateToken(token);
    if (!tokenRecord || tokenRecord.id !== tokenId) {
      return NextResponse.json({ error: 'Token invalid or already used' }, { status: 400 });
    }

    // 保存提交记录到 Supabase
    const submission = await saveSubmission(tokenId, formData);

    // 标记 Token 为已使用
    await markTokenAsUsed(tokenId);

    // 立即写入飞书（完全后台，不等待，不影响响应速度）
    const submittedAt = submission.submitted_at || new Date().toISOString();
    void createLarkRecord({ formData, token, submittedAt });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
