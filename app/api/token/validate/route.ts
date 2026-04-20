import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/token';

/**
 * GET /api/token/validate?token=xxx
 * 校验 Token 是否有效（学生访问时调用）
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ valid: false, error: 'Token missing' }, { status: 400 });
  }

  const result = await validateToken(token);

  if (!result) {
    return NextResponse.json({ valid: false, error: 'Token invalid or expired' }, { status: 200 });
  }

  // Token 已使用：返回历史提交记录
  if (result.used) {
    return NextResponse.json({
      valid: false,
      used: true,
      tokenId: result.tokenId,
      submission: result.submission,
    });
  }

  // Token 有效未使用
  return NextResponse.json({ valid: true, tokenId: result.id });
}
