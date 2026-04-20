import { supabaseAdmin } from './supabase';
import { Submission, FormData } from './types';

/**
 * 保存学生提交记录到 Supabase
 */
export async function saveSubmission(tokenId: string, formData: FormData) {
  // 映射新旧字段
  const mappedGrade = `${formData.stage} - ${formData.yearInStage}`;
  const budgetUsd = formData.budgetCurrency === 'USD' ? formData.budgetAmount : 0;

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({
      token_id: tokenId,
      student_name: formData.studentName,
      email: formData.email,
      grade: mappedGrade,
      gpa: formData.gpa,
      gpa_scale: formData.gpaScale,
      sat_score: formData.satScore,
      act_score: formData.actScore,
      toefl_score: formData.toeflScore,
      ielts_score: formData.ieltsScore,
      target_major: formData.targetMajor,
      degree_type: formData.targetDegree,
      budget_usd: budgetUsd,
      extracurriculars: formData.extracurriculars,
      form_language: formData.formLanguage,
      ai_suggestion: '',
      metadata: {
        ...formData,
        originalCurrency: formData.budgetCurrency,
        originalAmount: formData.budgetAmount,
        targetCountry: formData.targetCountry,
        targetSubRegion: formData.targetSubRegion,
        educationHistory: formData.educationHistory,
        gender: formData.gender,
        currentSchool: formData.currentSchool
      },
    })
    .select();

  if (error) throw error;
  return data[0] as Submission;
}

/**
 * 更新 AI 建议
 */
export async function updateAISuggestion(
  submissionId: string,
  suggestion: string
) {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .update({
      ai_suggestion: suggestion,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId)
    .select();

  if (error) throw error;
  return data[0] as Submission;
}

/**
 * 获取提交记录（后台查看）
 */
export async function getSubmissions(limit = 50, offset = 0) {
  const { data, error, count } = await supabaseAdmin
    .from('submissions')
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { submissions: data as Submission[], total: count };
}

/**
 * 获取单个提交记录
 */
export async function getSubmissionById(submissionId: string) {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error) return null;
  return data as Submission;
}
