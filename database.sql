-- Tokens 表：管理一次性链接
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unused', -- unused, used, expired
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Submissions 表：学生提交记录
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  grade VARCHAR(50),
  gpa DECIMAL(4, 2),
  gpa_scale DECIMAL(3, 1),
  sat_score INTEGER,
  act_score INTEGER,
  toefl_score INTEGER,
  ielts_score DECIMAL(3, 1),
  target_major VARCHAR(255),
  degree_type VARCHAR(50),
  budget_usd INTEGER,
  extracurriculars TEXT,
  ai_suggestion TEXT,
  form_language VARCHAR(20) NOT NULL DEFAULT 'zh', -- zh, en
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引优化查询
CREATE INDEX idx_tokens_token ON tokens(token);
CREATE INDEX idx_tokens_status ON tokens(status);
CREATE INDEX idx_tokens_created_by ON tokens(created_by);
CREATE INDEX idx_submissions_token_id ON submissions(token_id);
CREATE INDEX idx_submissions_email ON submissions(email);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);

-- 启用 RLS (Row Level Security)
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许公开查询（学生填表时可查询 token）
CREATE POLICY "Allow anyone to check token" ON tokens
  FOR SELECT USING (status != 'used' AND NOW() < expires_at);

-- RLS 策略：允许插入新提交（学生提交表单）
CREATE POLICY "Allow anyone to submit" ON submissions
  FOR INSERT WITH CHECK (true);

-- RLS 策略：后台查询（暂时允许全部，后续可加 JWT 认证）
CREATE POLICY "Allow service role to query all" ON tokens
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to query all submissions" ON submissions
  FOR ALL USING (auth.role() = 'service_role');
