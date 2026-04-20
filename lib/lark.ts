/**
 * lib/lark.ts
 * 飞书多维表格同步 — 通过 lark-cli（user 身份）写入
 */

import { execSync } from 'child_process';
import { FormData } from './types';

const BASE_TOKEN = process.env.LARK_BASE_TOKEN!;
const TABLE_ID = process.env.LARK_TABLE_ID!;

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

    // 拼接课外活动和特别亮点
    const extraInfo = [
      formData.extracurriculars ? `[活动]: ${formData.extracurriculars}` : '',
      formData.highlights ? `[亮点]: ${formData.highlights}` : '',
      formData.educationHistory && formData.educationHistory.length > 0
        ? `[历史背景]: ${formData.educationHistory.map(e => `${e.school}(${e.major})`).join(', ')}`
        : ''
    ].filter(Boolean).join('\n\n');

    fields['课外活动'] = extraInfo || '';

    // 年级映射
    const stageMap: Record<string, string> = { highschool: '高中', undergraduate: '本科', graduate: '研究生' };
    fields['年级'] = `${stageMap[formData.stage] || ''} - ${formData.yearInStage || ''}`;

    if (formData.targetDegree) {
      const degreeMap: Record<string, string> = { undergraduate: '本科', graduate: '研究生（硕士）', phd: '博士' };
      fields['学位类型'] = degreeMap[formData.targetDegree] ?? formData.targetDegree;
    }

    if (formData.formLanguage) fields['表单语言'] = formData.formLanguage === 'zh' ? '中文' : 'English';
    if (formData.gpa) fields['GPA'] = formData.gpa;
    if (formData.satScore) fields['SAT成绩'] = formData.satScore;
    if (formData.actScore) fields['ACT成绩'] = formData.actScore;
    if (formData.toeflScore) fields['TOEFL成绩'] = formData.toeflScore;
    if (formData.ieltsScore) fields['IELTS成绩'] = formData.ieltsScore;

    // 预算：文本格式，带币种后缀，如 100USD、5000HKD
    if (formData.budgetAmount) {
      fields['年预算'] = `${formData.budgetAmount}${formData.budgetCurrency || 'USD'}`;
    }
  }

  if (aiSuggestion !== undefined) fields['AI建议'] = aiSuggestion;
  if (token !== undefined) fields['Token'] = token;
  if (submittedAt) {
    // 飞书日期字段需要毫秒时间戳（UTC），直接传数字
    fields['提交时间'] = new Date(submittedAt).getTime();
  }

  return fields;
}

function runLarkCli(args: string): any {
  const result = execSync(`lark-cli base ${args} --as user`, { encoding: 'utf-8' });
  const parsed = JSON.parse(result);
  if (!parsed.ok) throw new Error(`[Lark] ${JSON.stringify(parsed.error)}`);
  return parsed.data;
}

/** 提交时立即写入表单数据（AI建议留空），返回 lark record_id */
export async function createLarkRecord(params: {
  formData: FormData;
  token: string;
  submittedAt: string;
}): Promise<string> {
  const fields = buildFields(params);
  const json = JSON.stringify(fields).replace(/'/g, "'\\''");
  const data = runLarkCli(`+record-upsert --base-token ${BASE_TOKEN} --table-id ${TABLE_ID} --json '${json}'`);
  const recordId = data?.record?.record_id_list?.[0] ?? '';
  console.log('[Lark] Created record:', recordId);
  return recordId;
}

/** AI 生成完毕后，按 token 找到记录并更新 AI建议字段 */
export async function updateLarkAISuggestion(token: string, aiSuggestion: string): Promise<void> {
  // 拉取记录列表，在内存里按 Token 字段匹配
  const listData = runLarkCli(
    `+record-list --base-token ${BASE_TOKEN} --table-id ${TABLE_ID} --limit 200`
  );

  // listData.data 是二维数组，field_id_list 对应列顺序
  const fieldIds: string[] = listData?.field_id_list ?? [];
  const records: any[][] = listData?.data ?? [];
  const recordIds: string[] = listData?.record_id_list ?? [];

  // 找 Token 字段的列索引（field_id: fldF9iu5FY）
  const tokenFieldIdx = fieldIds.indexOf('fldF9iu5FY');
  if (tokenFieldIdx === -1) {
    console.warn('[Lark] Token field not found in field list');
    return;
  }

  const rowIdx = records.findIndex((row) => row[tokenFieldIdx] === token);
  if (rowIdx === -1) {
    console.warn('[Lark] No record found for token:', token);
    return;
  }

  const recordId = recordIds[rowIdx];
  const fields = { AI建议: aiSuggestion };
  const json = JSON.stringify(fields).replace(/'/g, "'\\''");
  runLarkCli(`+record-upsert --base-token ${BASE_TOKEN} --table-id ${TABLE_ID} --record-id ${recordId} --json '${json}'`);
  console.log('[Lark] Updated AI suggestion for record:', recordId);
}
