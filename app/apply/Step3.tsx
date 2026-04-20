'use client';
import { FormData } from '@/lib/types';

interface Props {
  formData: FormData;
  update: (patch: Partial<FormData>) => void;
  text: any;
}

const countries = ['美国', '英国', '加拿大', '澳大利亚', '香港', '新加坡', '欧洲', '其他'];
const currencies = ['USD', 'CNY', 'GBP', 'HKD', 'CAD', 'AUD', 'SGD', 'EUR'];

export default function Step3({ formData, update, text }: Props) {
  const lang = formData.formLanguage || 'zh';
  const degreeLabels = {
    undergraduate: text.degreeUndergraduate,
    graduate: text.degreeGraduate,
    phd: text.degreePhD
  };

  return (
    <div className="space-y-6">
      {/* 申请学位（只读，由 Step2 确定） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{text.targetDegree}</label>
        <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-600 font-medium">
          {degreeLabels[formData.targetDegree]}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {text.targetMajor} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.targetMajor}
          onChange={(e) => update({ targetMajor: e.target.value })}
          placeholder={text.targetMajorPlaceholder}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.targetCountry} <span className="text-red-400">*</span></label>
          <select
            value={formData.targetCountry}
            onChange={(e) => update({ targetCountry: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.targetSubRegion}</label>
          <input
            type="text"
            value={formData.targetSubRegion || ''}
            onChange={(e) => update({ targetSubRegion: e.target.value })}
            placeholder={text.targetSubRegionPlaceholder}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.schoolTypePreference}</label>
        <div className="grid grid-cols-2 gap-2">
          {text.schoolTypePreferenceOptions.map((opt: string) => (
            <button
              key={opt}
              type="button"
              onClick={() => update({ schoolTypePreference: opt })}
              className={`py-2 rounded-lg border text-sm transition ${formData.schoolTypePreference === opt ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.budgetCurrency}</label>
          <select
            value={formData.budgetCurrency}
            onChange={(e) => update({ budgetCurrency: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {currencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.budgetAmount}</label>
          <input
            type="number"
            value={formData.budgetAmount ?? ''}
            onChange={(e) => update({ budgetAmount: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder={text.budgetPlaceholder}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
