'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { t, Lang } from '@/lib/i18n';
import { FormData } from '@/lib/types';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import ResultView from './ResultView';

const TOTAL_STEPS = 4;

const emptyForm: FormData = {
  studentName: '',
  gender: undefined,
  stage: 'highschool',
  yearInStage: '',
  currentSchool: '',
  intendedIntakeTime: '',
  email: '',
  educationHistory: [],
  gpa: 0,
  gpaScale: 4.0,
  satScore: undefined,
  actScore: undefined,
  greScore: undefined,
  gmatScore: undefined,
  toeflScore: undefined,
  ieltsScore: undefined,
  currentMajor: '',
  targetMajor: '',
  targetDegree: 'undergraduate',
  targetCountry: '美国',
  targetSubRegion: '',
  schoolTypePreference: '',
  budgetCurrency: 'USD',
  budgetAmount: undefined,
  extracurriculars: '',
  highlights: '',
  formLanguage: 'zh',
};

export default function ApplyForm() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get('token') || '';

  const [lang, setLang] = useState<Lang>('zh');
  const [step, setStep] = useState(0); // 0=欢迎页, 1-4=表单步骤, 5=结果页
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const [tokenId, setTokenId] = useState('');
  const [tokenStatus, setTokenStatus] = useState<'verifying' | 'valid' | 'invalid'>('verifying');
  const [submissionId, setSubmissionId] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [historyFormData, setHistoryFormData] = useState<FormData | null>(null); // 历史已提交的表单数据
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const text = t[lang];

  // 验证 Token
  useEffect(() => {
    if (!tokenParam) { setTokenStatus('invalid'); return; }
    fetch(`/api/token/validate?token=${tokenParam}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTokenId(data.tokenId);
          setTokenStatus('valid');
        } else if (data.used && data.submission) {
          // Token 已使用：直接展示历史 AI 建议
          setTokenId(data.tokenId);
          setTokenStatus('valid');
          if (data.submission.ai_suggestion) {
            setAiResult(data.submission.ai_suggestion);
          }
          if (data.submission.form_language) {
            setLang(data.submission.form_language as Lang);
          }
          if (data.submission.metadata) {
            setHistoryFormData(data.submission.metadata as FormData);
          }
          setStep(5);
        } else {
          setTokenStatus('invalid');
        }
      })
      .catch(() => setTokenStatus('invalid'));
  }, [tokenParam]);

  function toggleLang() {
    const next: Lang = lang === 'zh' ? 'en' : 'zh';
    setLang(next);
    setFormData((prev) => ({ ...prev, formLanguage: next }));
  }

  function updateForm(patch: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenParam, tokenId, formData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submit failed');
      setSubmissionId(data.submissionId);
      setStep(5);
      // 流式拉取 AI 建议
      fetchAIResult(data.submissionId);
    } catch (e: any) {
      setSubmitError(e.message || text.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function fetchAIResult(sid: string) {
    const res = await fetch(`/api/ai/suggest?submissionId=${sid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData, lang, token: tokenParam }),
    });
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      setAiResult(result);
    }
  }

  // ---- 渲染状态 ----

  // 验证中
  if (tokenStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{text.verifying}</p>
        </div>
      </div>
    );
  }

  // Token 无效
  if (tokenStatus === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-sm px-6">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{text.tokenInvalid}</h2>
          <p className="text-gray-400 text-sm">{text.tokenExpired}</p>
        </div>
      </div>
    );
  }

  // 结果页
  if (step === 5) {
    return <ResultView lang={lang} aiResult={aiResult} text={text} historyFormData={historyFormData} />;
  }

  // 欢迎页
  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md w-full text-center">
          {/* 语言切换 */}
          <div className="flex justify-end mb-4">
            <button onClick={toggleLang} className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-full px-3 py-1">
              {lang === 'zh' ? 'English' : '中文'}
            </button>
          </div>
          <div className="text-5xl mb-5">🎓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{text.welcomeTitle}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">{text.welcomeDesc}</p>
          <button
            onClick={() => setStep(1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold text-base transition"
          >
            {text.startButton}
          </button>
        </div>
      </div>
    );
  }

  // 表单步骤
  const stepTitles = [text.step1Title, text.step2Title, text.step3Title, text.step4Title];
  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <span className="font-semibold text-gray-700">
              {lang === 'zh' ? `第 ${step} / ${TOTAL_STEPS} 步` : `Step ${step} of ${TOTAL_STEPS}`}
            </span>
          </div>
          <button onClick={toggleLang} className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-full px-3 py-1">
            {lang === 'zh' ? 'English' : '中文'}
          </button>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 步骤标题 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">{stepTitles[step - 1]}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {[text.step1Desc, text.step2Desc, text.step3Desc, text.step4Desc][step - 1]}
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          {step === 1 && <Step1 formData={formData} update={updateForm} text={text} />}
          {step === 2 && <Step2 formData={formData} update={updateForm} text={text} />}
          {step === 3 && <Step3 formData={formData} update={updateForm} text={text} />}
          {step === 4 && <Step4 formData={formData} update={updateForm} text={text} isSubmitting={isSubmitting} submitError={submitError} />}
        </div>

        {/* 导航按钮 */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              {text.prev}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
            >
              {text.next}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? text.submitting : text.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
