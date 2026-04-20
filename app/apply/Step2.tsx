'use client';
import { FormData } from '@/lib/types';

interface Props {
  formData: FormData;
  update: (patch: Partial<FormData>) => void;
  text: any;
}

function NumInput({ label, value, onChange, placeholder, required = false }: {
  label: string; value?: number; onChange: (v?: number) => void;
  placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function Step2({ formData, update, text }: Props) {
  const isGraduate = formData.stage === 'undergraduate' || formData.stage === 'graduate';
  const isPhD = formData.targetDegree === 'phd';

  return (
    <div className="space-y-6">
      {/* 申请学位 (由 Step 1 推断，可修改) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.targetDegree} <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {(['undergraduate', 'graduate', 'phd'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update({ targetDegree: d })}
              className={`py-2 rounded-xl border text-sm transition-all ${
                formData.targetDegree === d
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {d === 'undergraduate' ? text.degreeUndergraduate : d === 'graduate' ? text.degreeGraduate : text.degreePhD}
            </button>
          ))}
        </div>
      </div>

      {/* 当前专业 (本科及以上阶段显示) */}
      {isGraduate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.currentMajor} <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={formData.currentMajor || ''}
            onChange={(e) => update({ currentMajor: e.target.value })}
            placeholder={text.currentMajorPlaceholder}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* 核心成绩 */}
      <div className="grid grid-cols-2 gap-4">
        <NumInput label={text.gpa} value={formData.gpa || undefined} onChange={(v) => update({ gpa: v ?? 0 })} placeholder={text.gpaPlaceholder} required />
        <NumInput label={text.gpaScale} value={formData.gpaScale} onChange={(v) => update({ gpaScale: v ?? 4.0 })} placeholder={text.gpaScalePlaceholder} required />
      </div>

      {/* 标化成绩 (条件显示) */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 mb-3">{text.optional} — 标化/语言成绩</p>
        <div className="grid grid-cols-2 gap-4">
          {/* 高中/本科阶段显示 SAT/ACT */}
          {(formData.stage === 'highschool' || formData.stage === 'undergraduate') && (
            <>
              <NumInput label={text.satScore} value={formData.satScore} onChange={(v) => update({ satScore: v })} placeholder={text.satPlaceholder} />
              <NumInput label={text.actScore} value={formData.actScore} onChange={(v) => update({ actScore: v })} placeholder={text.actPlaceholder} />
            </>
          )}

          {/* 研究生/博士申请显示 GRE/GMAT */}
          {(formData.targetDegree === 'graduate' || formData.targetDegree === 'phd') && (
            <>
              <NumInput label={text.greScore} value={formData.greScore} onChange={(v) => update({ greScore: v })} placeholder={text.grePlaceholder} />
              <NumInput label={text.gmatScore} value={formData.gmatScore} onChange={(v) => update({ gmatScore: v })} placeholder={text.gmatPlaceholder} />
            </>
          )}

          <NumInput label={text.toeflScore} value={formData.toeflScore} onChange={(v) => update({ toeflScore: v })} placeholder={text.toeflPlaceholder} />
          <NumInput label={text.ieltsScore} value={formData.ieltsScore} onChange={(v) => update({ ieltsScore: v })} placeholder={text.ieltsPlaceholder} />
        </div>
      </div>
    </div>
  );
}
