import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';
import { Token } from './types';

/**
 * 生成新的一次性 Token
 */
export async function generateToken(createdBy: string) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 天后过期

  const { data, error } = await supabaseAdmin
    .from('tokens')
    .insert({
      token,
      status: 'unused',
      expires_at: expiresAt.toISOString(),
      created_by: createdBy,
    })
    .select();

  if (error) throw error;
  return data[0] as Token;
}

/**
 * 验证 Token 是否有效
 * 返回 null 表示不存在或已过期
 * 返回 tokenRecord 表示有效（unused）
 * 返回 { used: true, submissionId } 表示已使用
 */
export async function validateToken(token: string): Promise<any> {
  const { data, error } = await supabaseAdmin
    .from('tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error) return null;

  const tokenRecord = data as Token;

  // 已过期
  if (tokenRecord.status === 'expired') return null;

  // 过期时间检查
  if (new Date(tokenRecord.expires_at) < new Date()) {
    await supabaseAdmin
      .from('tokens')
      .update({ status: 'expired' })
      .eq('id', tokenRecord.id);
    return null;
  }

  // 已使用：返回对应的 submissionId
  if (tokenRecord.status === 'used') {
    const { data: sub } = await supabaseAdmin
      .from('submissions')
      .select('id, ai_suggestion, form_language, metadata')
      .eq('token_id', tokenRecord.id)
      .single();
    return { used: true, tokenId: tokenRecord.id, submission: sub || null };
  }

  return tokenRecord;
}

/**
 * 标记 Token 为已使用
 */
export async function markTokenAsUsed(tokenId: string) {
  const { error } = await supabaseAdmin
    .from('tokens')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
    })
    .eq('id', tokenId);

  if (error) throw error;
}

/**
 * 获取 Token 列表（后台）
 */
export async function listTokens(createdBy: string, limit = 50, offset = 0) {
  const { data, error, count } = await supabaseAdmin
    .from('tokens')
    .select('*', { count: 'exact' })
    .eq('created_by', createdBy)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { tokens: data as Token[], total: count };
}
