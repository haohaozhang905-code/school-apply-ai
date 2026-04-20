'use client';

import { useState, useEffect } from 'react';

interface TokenItem {
  id: string;
  token: string;
  status: 'unused' | 'used' | 'expired';
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

interface SubmissionItem {
  id: string;
  student_name: string;
  email: string;
  grade: string;
  target_major: string;
  degree_type: string;
  submitted_at: string;
  form_language: string;
  ai_suggestion: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState<'tokens' | 'submissions'>('tokens');
  const [tokens, setTokens] = useState<TokenItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [generateCount, setGenerateCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [newLinks, setNewLinks] = useState<{ token: string; link: string; expiresAt: string }[]>([]);
  const [copyTip, setCopyTip] = useState('');
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  function getApplyLink(token: string) {
    return `${appUrl}/apply?token=${token}`;
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(getApplyLink(token));
    setCopyTip(token);
    setTimeout(() => setCopyTip(''), 2000);
  }

  async function handleLogin() {
    setLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens.tokens || []);
        setSubmissions(data.submissions.submissions || []);
        setAuthed(true);
      } else {
        setAuthError('密码错误');
      }
    } catch (e) {
      setAuthError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setNewLinks([]);
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: {
        'x-admin-password': password,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ count: generateCount }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setNewLinks(data.tokens);
      // 刷新 token 列表
      fetchData();
    }
  }

  async function fetchData() {
    const res = await fetch('/api/admin/data', {
      headers: { 'x-admin-password': password },
    });
    if (res.ok) {
      const data = await res.json();
      setTokens(data.tokens.tokens || []);
      setSubmissions(data.submissions.submissions || []);
    }
  }

  function copyAll() {
    const text = newLinks.map((l) => l.link).join('\n');
    navigator.clipboard.writeText(text);
    setCopyTip('已复制！');
    setTimeout(() => setCopyTip(''), 2000);
  }

  const statusColor = (s: string) => {
    if (s === 'unused') return 'bg-green-100 text-green-700';
    if (s === 'used') return 'bg-gray-100 text-gray-500';
    return 'bg-red-100 text-red-500';
  };

  const statusLabel = (s: string) => {
    if (s === 'unused') return '未使用';
    if (s === 'used') return '已使用';
    return '已过期';
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">后台管理</h1>
          <p className="text-gray-400 text-sm mb-6">AI 择校建议系统</p>
          <input
            type="password"
            placeholder="请输入管理密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
          {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? '验证中...' : '登录'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">后台管理</h1>
            <p className="text-gray-400 text-sm mt-1">AI 择校建议系统</p>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            退出登录
          </button>
        </div>

        {/* 生成链接区域 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">生成一次性链接</h2>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={50}
              value={generateCount}
              onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">条链接</span>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? '生成中...' : '生成'}
            </button>
            {newLinks.length > 0 && (
              <button
                onClick={copyAll}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {copyTip || '复制全部链接'}
              </button>
            )}
          </div>

          {newLinks.length > 0 && (
            <div className="mt-4 space-y-2">
              {newLinks.map((l) => (
                <div key={l.token} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-700 flex-1 truncate">{l.link}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    30天后过期
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(l.link); }}
                    className="text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
                  >
                    复制
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('tokens')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'tokens' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            链接记录 ({tokens.length})
          </button>
          <button
            onClick={() => setTab('submissions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'submissions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            学生提交 ({submissions.length})
          </button>
        </div>

        {/* Tokens 列表 */}
        {tab === 'tokens' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-5 py-3">Token</th>
                  <th className="text-left px-5 py-3">申请链接</th>
                  <th className="text-left px-5 py-3">状态</th>
                  <th className="text-left px-5 py-3">创建时间</th>
                  <th className="text-left px-5 py-3">过期时间</th>
                  <th className="text-left px-5 py-3">使用时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 truncate max-w-[140px]">{t.token.substring(0, 8)}…</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={getApplyLink(t.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-700 underline truncate max-w-[180px]"
                        >
                          {getApplyLink(t.token).replace(/https?:\/\//, '')}
                        </a>
                        <button
                          onClick={() => copyLink(t.token)}
                          className="text-xs text-gray-400 hover:text-blue-600 whitespace-nowrap"
                        >
                          {copyTip === t.token ? '✓' : '复制'}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(t.status)}`}>
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{new Date(t.created_at).toLocaleString('zh-CN')}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(t.expires_at).toLocaleDateString('zh-CN')}</td>
                    <td className="px-5 py-3 text-gray-400">{t.used_at ? new Date(t.used_at).toLocaleString('zh-CN') : '-'}</td>
                  </tr>
                ))}
                {tokens.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-300">暂无记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Submissions 列表 */}
        {tab === 'submissions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-5 py-3">姓名</th>
                  <th className="text-left px-5 py-3">邮箱</th>
                  <th className="text-left px-5 py-3">年级</th>
                  <th className="text-left px-5 py-3">目标专业</th>
                  <th className="text-left px-5 py-3">学位</th>
                  <th className="text-left px-5 py-3">语言</th>
                  <th className="text-left px-5 py-3">提交时间</th>
                  <th className="text-left px-5 py-3">AI建议</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.student_name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3 text-gray-500">{s.grade || '-'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.target_major || '-'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.degree_type || '-'}</td>
                    <td className="px-5 py-3 text-gray-400">{s.form_language === 'zh' ? '中文' : 'EN'}</td>
                    <td className="px-5 py-3 text-gray-400">{new Date(s.submitted_at).toLocaleString('zh-CN')}</td>
                    <td className="px-5 py-3">
                      {s.ai_suggestion
                        ? <span className="text-green-600 text-xs">已生成</span>
                        : <span className="text-gray-300 text-xs">待生成</span>}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-300">暂无提交记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
