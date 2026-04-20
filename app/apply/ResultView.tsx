'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Lang } from '@/lib/i18n';
import { FormData } from '@/lib/types';

interface Props {
  lang: Lang;
  aiResult: string;
  text: any;
  submittedFormData?: FormData | null;
}

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-xl font-bold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-1">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg font-bold text-gray-800 mt-5 mb-2">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-base font-semibold text-gray-700 mt-4 mb-1">{children}</h3>,
  p: ({ children }: any) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-gray-800">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  hr: () => <hr className="border-gray-200 my-4" />,
  blockquote: ({ children }: any) => <blockquote className="border-l-4 border-blue-300 pl-4 text-gray-600 italic my-3">{children}</blockquote>,
};

const stageMap: Record<string, string> = { highschool: '高中', undergraduate: '本科', graduate: '研究生' };
const degreeMap: Record<string, string> = { undergraduate: '本科', graduate: '研究生（硕士）', phd: '博士' };

function FormSummary({ fd, lang }: { fd: FormData; lang: Lang }) {
  const isZh = lang === 'zh';
  const rows: [string, string][] = [
    [isZh ? '姓名' : 'Name', fd.studentName || '-'],
    [isZh ? '当前阶段' : 'Stage', `${stageMap[fd.stage] || fd.stage} ${fd.yearInStage}`],
    [isZh ? '当前学校' : 'Current School', fd.currentSchool || '-'],
    [isZh ? 'GPA' : 'GPA', fd.gpa ? `${fd.gpa} / ${fd.gpaScale}` : '-'],
    [isZh ? '目标学位' : 'Target Degree', degreeMap[fd.targetDegree] || fd.targetDegree],
    [isZh ? '目标专业' : 'Target Major', fd.targetMajor || '-'],
    [isZh ? '目标国家/地区' : 'Target Country', fd.targetCountry || '-'],
    ...(fd.targetSubRegion ? [[isZh ? '意向城市/州' : 'Sub-region', fd.targetSubRegion] as [string, string]] : []),
    [isZh ? '计划入学时间' : 'Intended Intake', fd.intendedIntakeTime || '-'],
    [isZh ? '邮箱' : 'Email', fd.email || '-'],
    ...(fd.toeflScore ? [['TOEFL', String(fd.toeflScore)] as [string, string]] : []),
    ...(fd.ieltsScore ? [['IELTS', String(fd.ieltsScore)] as [string, string]] : []),
    ...(fd.satScore ? [['SAT', String(fd.satScore)] as [string, string]] : []),
    ...(fd.actScore ? [['ACT', String(fd.actScore)] as [string, string]] : []),
    ...(fd.greScore ? [['GRE', String(fd.greScore)] as [string, string]] : []),
    ...(fd.gmatScore ? [['GMAT', String(fd.gmatScore)] as [string, string]] : []),
    ...(fd.budgetAmount ? [[isZh ? '年预算' : 'Annual Budget', `${fd.budgetAmount} ${fd.budgetCurrency}`] as [string, string]] : []),
    ...(fd.extracurriculars ? [[isZh ? '课外活动/科研' : 'Extracurriculars', fd.extracurriculars] as [string, string]] : []),
    ...(fd.highlights ? [[isZh ? '特别亮点' : 'Highlights', fd.highlights] as [string, string]] : []),
  ];

  return (
    <div className="mt-4 space-y-2">
      {fd.educationHistory && fd.educationHistory.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">{isZh ? '历史学历' : 'Education History'}</p>
          {fd.educationHistory.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
              {e.school}{e.major ? ` · ${e.major}` : ''}{e.gpa ? ` · GPA ${e.gpa}` : ''}{e.graduationYear ? ` · ${e.graduationYear}` : ''}
            </p>
          ))}
        </div>
      )}
      {rows.map(([label, value]) => (
        <div key={label} className="flex gap-2 text-xs">
          <span className="text-gray-400 w-28 shrink-0">{label}</span>
          <span className="text-gray-700 break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResultView({ lang, aiResult, text, submittedFormData }: Props) {
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLoading = !aiResult;
  // 剥掉 AI 输出的所有 ``` 围栏行
  const content = aiResult
    .replace(/^```.*$/gm, '')
    .trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800">{text.resultTitle}</h1>
        </div>

        {/* 查看填写内容（始终展示） */}
        {submittedFormData && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700"
            >
              <span>{lang === 'zh' ? '查看填写内容' : 'View Submitted Form'}</span>
              <span className="text-gray-400">{showForm ? '▲' : '▼'}</span>
            </button>
            {showForm && <FormSummary fd={submittedFormData} lang={lang} />}
          </div>
        )}

        {/* AI 建议 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {isLoading ? (
            <div className="flex items-center gap-3 text-gray-500 py-8 justify-center">
              <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>{text.generating}</span>
            </div>
          ) : (
            <>
              <div className="text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {content}
                </ReactMarkdown>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-4 py-2 transition"
                >
                  {copied ? `✓ ${text.copied}` : `📋 ${text.copyResult}`}
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          {lang === 'zh'
            ? '以上建议由 AI 生成，仅供参考，请结合实际情况与顾问确认'
            : 'Recommendations are AI-generated and for reference only. Please confirm with your advisor.'}
        </p>
      </div>
    </div>
  );
}
