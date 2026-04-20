import { NextRequest, NextResponse } from 'next/server';
import { listTokens, generateToken } from '@/lib/token';
import { getSubmissions } from '@/lib/submission';

function checkAuth(request: NextRequest) {
  const auth = request.headers.get('x-admin-password');
  return auth === process.env.ADMIN_PASSWORD;
}

/**
 * GET /api/admin/data
 * 获取后台数据：token 列表 + 提交记录
 */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const [tokenData, submissionData] = await Promise.all([
    listTokens('admin', limit, offset),
    getSubmissions(limit, offset),
  ]);

  return NextResponse.json({
    tokens: tokenData,
    submissions: submissionData,
  });
}

/**
 * POST /api/admin/data
 * 批量生成 Token
 */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { count = 1 } = await request.json();
  const num = Math.min(Math.max(parseInt(count), 1), 50); // 最多一次生成 50 个

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const tokens = [];

  for (let i = 0; i < num; i++) {
    const token = await generateToken('admin');
    tokens.push({
      token: token.token,
      link: `${appUrl}/apply?token=${token.token}`,
      expiresAt: token.expires_at,
    });
  }

  return NextResponse.json({ success: true, tokens });
}
