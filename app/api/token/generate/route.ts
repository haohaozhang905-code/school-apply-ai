import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/token';

/**
 * POST /api/token/generate
 * 生成一次性 Token（后台）
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // 简单密码认证（MVP）
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = await generateToken('admin');

    return NextResponse.json({
      success: true,
      data: {
        token: token.token,
        link: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/apply?token=${token.token}`,
        expiresAt: token.expires_at,
      },
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
