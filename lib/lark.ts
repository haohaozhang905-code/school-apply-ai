/**
 * lib/lark.ts
 * 飞书多维表格同步 — 直接调用飞书 Open API（HTTP），兼容 Vercel serverless
 */

import { FormData } from './types';

const FEISHU_BASE_URL = 'https://open.feishu.cn/open-apis';
const APP_ID = process.env.LARK_APP_ID!;
const APP_SECRET = process.env.LARK_APP_SECRET!;
const BASE_TOKEN = process.env.LARK_BASE_TOKEN!;
const TABLE_ID = process.env.LARK_TABLE_ID!;

/** 获取 tenant_access_token（应用身份，每次请求新 token，有效期 2h 足够用） */
async function getAccessToken(): Promise<string> {
  const res = await fetch(`${FEISHU_BASE_URL}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`[Lark] Auth failed: ${data.msg}`);
  return data.tenant_access_token;
}

/** 封装飞书 API 请求 */
async function larkFetch(token: string, method: string, path: string, body?: any) {
  const res = await fetch(`${FEISHU_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`[Lark] API error (${path}): ${data.msg}`);
  return data.data;
}

/** 构建飞书字段 Map */
function buildFields(params: {
  formData?: FormData;
  aiSuggestion?: string;
  token?: string;
  submittedAt?: string;
}): Record<string, any> {
  const { formData, aiSuggestion, token, submittedAt } = params;
  const fields: Record<string, any> = {};

  if (formData) {
    fields['学生姓名'] = formData.studentName || '';
    fields['邮箱'] = formData.email || '';
    fields['目标专业'] = formData.targetMajor || '';

    const stageMap: Record<string, string> = {
      highschool: '高中',
      undergraduate: '本科',
      graduate: '研究生',
    };
    fields['年级'] = `${stageMap[formData.stage] || ''} - ${formData.yearInStage || ''}`;

    if (formData.targetDegree) {
      const degreeMap: Record<string, string> = {
        undergraduate: '本科',
        graduate: '研究生（硕士）',
        phd: '博士',
      };
      fields['学位类型'] = degreeMap[formData.targetDegree] ?? formData.targetDegree;
    }

    if (formData.formLanguage) {
      fields['表单语言'] = formData.formLanguage === 'zh' ? '中文' : 'English';
    }

    if (formData.gpa) fields['GPA'] = formData.gpa;
    if (formData.satScore) fields['SAT成绩'] = formData.satScore;
    if (formData.actScore) fields['ACT成绩'] = formData.actScore;
    if (formData.toeflScore) fields['TOEFL成绩'] = formData.toeflScore;
    if (formData.ieltsScore) fields['IELTS成绩'] = formData.ieltsScore;

    if (formData.budgetAmount) {
      fields['年预算'] = `${formData.budgetAmount}${formData.budgetCurrency || 'USD'}`;
    }

    const extraInfo = [
      formData.extracurriculars ? `[活动]: ${formData.extracurriculars}` : '',
      formData.highlights ? `[亮点]: ${formData.highlights}` : '',
      formData.educationHistory && formData.educationHistory.length > 0
        ? `[历史背景]: ${formData.educationHistory.map((e) => `${e.school}(${e.major})`).join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');
    fields['课外活动'] = extraInfo;
  }

  if (aiSuggestion !== undefined) fields['AI建议'] = aiSuggestion;
  if (token !== undefined) fields['Token'] = token;
  if (submittedAt) {
    // 飞书 datetime 字段使用 UTC 毫秒时间戳，飞书前端会自动按用户时区显示
    fields['提交时间'] = new Date(submittedAt).getTime();
  }

  return fields;
}

/** 提交时立即写入表单数据（AI建议留空），返回 lark record_id */
export async function createLarkRecord(params: {
  formData: FormData;
  token: string;
  submittedAt: string;
}): Promise<string> {
  const fields = buildFields(params);
  const accessToken = await getAccessToken();
  const data = await larkFetch(
    accessToken,
    'POST',
    `/bitable/v1/apps/${BASE_TOKEN}/tables/${TABLE_ID}/records`,
    { fields }
  );
  const recordId = data?.record?.record_id ?? '';
  console.log('[Lark] Created record:', recordId);
  return recordId;
}

/** AI 生成完毕后，按 Token 字段找到记录并更新 AI建议 */
export async function updateLarkAISuggestion(token: string, aiSuggestion: string): Promise<void> {
  const accessToken = await getAccessToken();

  // 拉取记录列表，内存匹配 Token 字段
  const data = await larkFetch(
    accessToken,
    'GET',
    `/bitable/v1/apps/${BASE_TOKEN}/tables/${TABLE_ID}/records?page_size=200`
  );

  const items: any[] = data?.items ?? [];
  const record = items.find((r) => {
    const tokenField = r.fields?.['Token'];
    // 文本字段值可能是富文本数组，也可能是字符串
    if (Array.isArray(tokenField)) {
      return tokenField.map((t: any) => t.text).join('') === token;
    }
    return tokenField === token;
  });

  if (!record) {
    console.warn('[Lark] No record found for token:', token);
    return;
  }

  await larkFetch(
    accessToken,
    'PUT',
    `/bitable/v1/apps/${BASE_TOKEN}/tables/${TABLE_ID}/records/${record.record_id}`,
    { fields: { AI建议: aiSuggestion } }
  );
  console.log('[Lark] Updated AI suggestion for record:', record.record_id);
}
