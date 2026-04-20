// Token 类型
export interface Token {
  id: string;
  token: string;
  status: 'unused' | 'used' | 'expired';
  created_at: string;
  used_at: string | null;
  expires_at: string;
  created_by: string;
  metadata: Record<string, any>;
}

// 历史教育背景
export interface EducationRecord {
  school: string;
  major?: string;
  gpa?: string;
  gpaScale?: string;
  graduationYear?: string;
}

// 学生提交记录 (DB 格式，保持不变)
export interface Submission {
  id: string;
  token_id: string;
  student_name: string;
  email: string;
  grade?: string;
  gpa?: number;
  gpa_scale?: number;
  sat_score?: number;
  act_score?: number;
  toefl_score?: number;
  ielts_score?: number;
  target_major?: string;
  degree_type?: string;
  budget_usd?: number;
  extracurriculars?: string;
  ai_suggestion?: string;
  form_language: 'zh' | 'en';
  submitted_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

// 表单步骤数据 (新结构)
export interface FormData {
  // Step 1: Basic Info
  studentName: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  stage: 'highschool' | 'undergraduate' | 'graduate'; // 高中、本科、研究生
  yearInStage: string; // 具体年级
  currentSchool: string; // 当前学校名
  intendedIntakeTime: string;
  email: string;
  educationHistory?: EducationRecord[]; // 历史学历（主要针对研究生）

  // Step 2: Academic Background
  gpa: number;
  gpaScale: number;
  satScore?: number;
  actScore?: number;
  greScore?: number;
  gmatScore?: number;
  toeflScore?: number;
  ieltsScore?: number;
  currentMajor?: string;

  // Step 3: Intent Info
  targetMajor: string;
  targetDegree: 'undergraduate' | 'graduate' | 'phd'; // 申请学位
  targetCountry: string; // 目标国家
  targetSubRegion?: string; // 意向州/城市
  schoolTypePreference?: string;
  budgetCurrency: string; // 预算币种
  budgetAmount?: number; // 预算金额

  // Step 4: Soft Skills
  extracurriculars?: string;
  highlights?: string;

  // Meta
  formLanguage: 'zh' | 'en';
}

// AI 择校建议结构 (保持不变)
export interface SchoolRecommendation {
  name: string;
  reason: string;
  category: 'reach' | 'target' | 'safety';
  ranking?: number;
  admissionRate?: number;
}

export interface AISuggestion {
  reach_schools: SchoolRecommendation[];
  target_schools: SchoolRecommendation[];
  safety_schools: SchoolRecommendation[];
  summary: string;
}
