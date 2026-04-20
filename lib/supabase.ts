import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 客户端（用于浏览器，权限受限）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端客户端（用于 API 路由，拥有完整权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
