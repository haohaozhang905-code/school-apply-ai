import OpenAI from 'openai';
import { FormData } from './types';

// 使用 OpenAI 兼容接口调用通义千问
export const qwenClient = new OpenAI({
  apiKey: process.env.QWEN_API_KEY!,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

// 模型：QwQ-Plus（深度思考）
export const QWEN_MODEL = 'qwq-plus';

/**
 * 构建择校建议 Prompt（中英文）
 */
export function buildPrompt(formData: FormData, lang: 'zh' | 'en'): string {
  const isZh = lang === 'zh';

  // 整理学生信息
  const profile: Record<string, string> = {};

  const stageMap = {
    highschool: isZh ? '高中' : 'High School',
    undergraduate: isZh ? '本科' : 'Undergraduate',
    graduate: isZh ? '研究生' : 'Graduate',
  };

  const degreeMap = {
    undergraduate: isZh ? '本科' : 'Undergraduate',
    graduate: isZh ? '研究生（硕士）' : "Graduate (Master's)",
    phd: isZh ? '博士' : 'PhD',
  };

  if (isZh) {
    profile['姓名'] = formData.studentName || '未填写';
    if (formData.gender) {
      const gMap = { male: '男', female: '女', other: '其他', prefer_not_to_say: '不愿透露' };
      profile['性别'] = gMap[formData.gender] || '未填写';
    }
    profile['当前阶段'] = stageMap[formData.stage];
    profile['当前年级'] = formData.yearInStage;
    profile['当前学校'] = formData.currentSchool || '未填写';
    profile['GPA'] = formData.gpa ? `${formData.gpa} / ${formData.gpaScale}` : '未填写';
    if (formData.currentMajor) profile['当前专业'] = formData.currentMajor;

    // 标化
    if (formData.satScore) profile['SAT'] = String(formData.satScore);
    if (formData.actScore) profile['ACT'] = String(formData.actScore);
    if (formData.greScore) profile['GRE'] = String(formData.greScore);
    if (formData.gmatScore) profile['GMAT'] = String(formData.gmatScore);
    if (formData.toeflScore) profile['TOEFL'] = String(formData.toeflScore);
    if (formData.ieltsScore) profile['IELTS'] = String(formData.ieltsScore);

    // 历史教育背景
    if (formData.educationHistory && formData.educationHistory.length > 0) {
      profile['过往教育背景'] = formData.educationHistory
        .map(e => `${e.school} (${e.major || '无专业'}), GPA: ${e.gpa || '未提供'}, 毕业年份: ${e.graduationYear || '未提供'}`)
        .join('; ');
    }

    profile['目标申请学位'] = degreeMap[formData.targetDegree];
    profile['目标专业'] = formData.targetMajor || '未填写';
    profile['目标国家/地区'] = formData.targetCountry || '未填写';
    if (formData.targetSubRegion) profile['意向城市/州'] = formData.targetSubRegion;
    if (formData.schoolTypePreference) profile['学校类型偏好'] = formData.schoolTypePreference;
    if (formData.budgetAmount) profile['年学费预算'] = `${formData.budgetCurrency} ${formData.budgetAmount.toLocaleString()}`;

    profile['计划入学时间'] = formData.intendedIntakeTime || '未填写';
    if (formData.extracurriculars) profile['课外活动/科研/实习'] = formData.extracurriculars;
    if (formData.highlights) profile['特别亮点'] = formData.highlights;
  } else {
    profile['Name'] = formData.studentName || 'N/A';
    if (formData.gender) profile['Gender'] = formData.gender;
    profile['Current Stage'] = stageMap[formData.stage];
    profile['Current Year'] = formData.yearInStage;
    profile['Current School'] = formData.currentSchool || 'N/A';
    profile['GPA'] = formData.gpa ? `${formData.gpa} / ${formData.gpaScale}` : 'N/A';
    if (formData.currentMajor) profile['Current Major'] = formData.currentMajor;

    if (formData.satScore) profile['SAT'] = String(formData.satScore);
    if (formData.actScore) profile['ACT'] = String(formData.actScore);
    if (formData.greScore) profile['GRE'] = String(formData.greScore);
    if (formData.gmatScore) profile['GMAT'] = String(formData.gmatScore);
    if (formData.toeflScore) profile['TOEFL'] = String(formData.toeflScore);
    if (formData.ieltsScore) profile['IELTS'] = String(formData.ieltsScore);

    if (formData.educationHistory && formData.educationHistory.length > 0) {
      profile['Education History'] = formData.educationHistory
        .map(e => `${e.school} (${e.major || 'N/A'}), GPA: ${e.gpa || 'N/A'}, Grad Year: ${e.graduationYear || 'N/A'}`)
        .join('; ');
    }

    profile['Target Degree'] = degreeMap[formData.targetDegree];
    profile['Target Major'] = formData.targetMajor || 'N/A';
    profile['Target Country'] = formData.targetCountry || 'N/A';
    if (formData.targetSubRegion) profile['Preferred City/State'] = formData.targetSubRegion;
    if (formData.schoolTypePreference) profile['School Type Preference'] = formData.schoolTypePreference;
    if (formData.budgetAmount) profile['Annual Tuition Budget'] = `${formData.budgetCurrency} ${formData.budgetAmount.toLocaleString()}`;

    profile['Intended Intake'] = formData.intendedIntakeTime || 'N/A';
    if (formData.extracurriculars) profile['Extracurriculars/Research/Internships'] = formData.extracurriculars;
    if (formData.highlights) profile['Special Highlights'] = formData.highlights;
  }

  const profileText = Object.entries(profile)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  if (isZh) {
    return `你是一位资深的全球留学申请顾问，拥有超过15年的行业经验，精通美、英、加、澳、港、新等主流留学目的地的录取规律、专业优势及就业前景。

请根据以下我的背景信息，为我量身定制一份专业、深度的择校建议报告。

### 我的背景信息
${profileText}

### 输出要求
请使用 Markdown 格式输出，报告应包含以下板块：

## 一、 核心竞争力评估
结合我的学术成绩、院校背景及软实力，给出 100-150 字的客观评估，指出我的竞争优势及需要提升的环节。

## 二、 冲刺院校推荐 (3-4所)
适合我挑战，但录取难度较高（录取率通常低于15%或要求极高）的顶尖名校。
每所学校请包含：
- **学校名称 (及排名参考)**
- **推荐理由**：需结合我的具体背景（如专业匹配度、GPA竞争力等）进行深度分析，50-80字。
- **申请建议**：1-2点针对性的加分策略。

## 三、 核心主申院校 (4-5所)
与我背景最为匹配、录取概率较高的核心目标院校。
格式同上。

## 四、 保底院校推荐 (2-3所)
确保有录取的底线学校。
格式同上。

## 五、 申请整体策略建议
针对我的背景，提供 3-5 条关键建议，涵盖文书创作方向、标化考试规划、活动提升或套磁建议。

### 特别提示
1. 学校推荐必须真实存在，排名参考最新主流排名（如 US News, QS 等）。
2. 理由必须具象化，严禁使用“环境优美”、“历史悠久”等套话。
3. 必须严格遵循我提出的目标国家和预算限制。`;
  } else {
    return `You are a seasoned global college admissions consultant with over 15 years of experience, specializing in admissions patterns, program strengths, and career prospects in the US, UK, Canada, Australia, HK, and Singapore.

Based on my profile below, please provide a professional and in-depth school selection report tailored specifically to me.

### My Profile
${profileText}

### Output Format
Please use Markdown for the report, including the following sections:

## 1. Overall Competitiveness Assessment
Provide an objective 100-150 word analysis of my academic strength, background highlights, and areas for improvement.

## 2. Reach Schools (3-4 schools)
Top-tier institutions that are challenging but possible with a strong application.
For each school:
- **School Name (with Ranking Reference)**
- **Why Recommended**: Deeply analyze based on my profile (program fit, GPA, etc.), 50-80 words.
- **Application Tips**: 1-2 specific strategies to strengthen the application.

## 3. Target Schools (4-5 schools)
Core target schools where admission probability is reasonable and matches my profile.
Same format as above.

## 4. Safety Schools (2-3 schools)
Reliable options to ensure an admission.
Same format as above.

## 5. Strategic Application Advice
Provide 3-5 key recommendations covering essay direction, test planning, extracurricular enhancement, or networking.

### Important Notes
1. All recommended schools must be real, referencing the latest US News or QS rankings.
2. Reasons must be specific and tied to my profile; avoid generic statements.
3. Strictly adhere to my target countries and budget constraints.`;
  }
}
