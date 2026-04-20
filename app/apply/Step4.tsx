'use client';
import { FormData } from '@/lib/types';

interface Props {
  formData: FormData;
  update: (patch: Partial<FormData>) => void;
  text: any;
  isSubmitting: boolean;
  submitError: string;
}

export default function Step4({ formData, update, text, isSubmitting, submitError }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{text.extracurriculars}</label>
        <textarea
          value={formData.extracurriculars || ''}
          onChange={(e) => update({ extracurriculars: e.target.value })}
          placeholder={text.extracurricularsPlaceholder}
          rows={5}
          maxLength={500}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{(formData.extracurriculars || '').length} / 500</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{text.highlights}</label>
        <textarea
          value={formData.highlights || ''}
          onChange={(e) => update({ highlights: e.target.value })}
          placeholder={text.highlightsPlaceholder}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      {isSubmitting && (
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          正在提交，请稍候...
        </div>
      )}
    </div>
  );
}
