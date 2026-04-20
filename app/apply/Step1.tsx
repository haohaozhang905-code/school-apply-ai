'use client';
import { FormData, EducationRecord } from '@/lib/types';

interface Props {
  formData: FormData;
  update: (patch: Partial<FormData>) => void;
  text: any;
}

export default function Step1({ formData, update, text }: Props) {
  const stages: ('highschool' | 'undergraduate' | 'graduate')[] = ['highschool', 'undergraduate', 'graduate'];

  const gradeOptions: Record<string, string[]> = {
    highschool: formData.formLanguage === 'zh' ? ['10年级', '11年级', '12年级'] : ['Grade 10', 'Grade 11', 'Grade 12'],
    undergraduate: formData.formLanguage === 'zh' ? ['大一', '大二', '大三', '大四'] : ['Freshman', 'Sophomore', 'Junior', 'Senior'],
    graduate: formData.formLanguage === 'zh' ? ['研一', '研二', '研三及以上'] : ['Master Year 1', 'Master Year 2', 'Master Year 3+'],
  };

  const handleStageChange = (stage: 'highschool' | 'undergraduate' | 'graduate') => {
    let targetDegree: 'undergraduate' | 'graduate' | 'phd' = 'undergraduate';
    if (stage === 'undergraduate') targetDegree = 'graduate';
    else if (stage === 'graduate') targetDegree = 'phd';

    update({
      stage,
      yearInStage: gradeOptions[stage][gradeOptions[stage].length - 1], // 默认最高年级
      targetDegree
    });
  };

  const addEdu = () => {
    const history = formData.educationHistory || [];
    update({ educationHistory: [...history, { school: '', major: '', gpa: '', graduationYear: '' }] });
  };

  const updateEdu = (index: number, patch: Partial<EducationRecord>) => {
    const history = [...(formData.educationHistory || [])];
    history[index] = { ...history[index], ...patch };
    update({ educationHistory: history });
  };

  const removeEdu = (index: number) => {
    const history = [...(formData.educationHistory || [])];
    history.splice(index, 1);
    update({ educationHistory: history });
  };

  return (
    <div className="space-y-6">
      {/* 阶段选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{text.stage} <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {stages.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStageChange(s)}
              className={`py-2.5 rounded-xl border text-sm transition-all ${
                formData.stage === s
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {s === 'highschool' ? text.stageHighschool : s === 'undergraduate' ? text.stageUndergraduate : text.stageGraduate}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.yearInStage} <span className="text-red-400">*</span></label>
          <select
            value={formData.yearInStage}
            onChange={(e) => update({ yearInStage: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            {gradeOptions[formData.stage].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.gender}</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => update({ gender: e.target.value as any })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">{text.optional}</option>
            <option value="male">{text.genderMale}</option>
            <option value="female">{text.genderFemale}</option>
            <option value="other">{text.genderOther}</option>
            <option value="prefer_not_to_say">{text.genderPreferNotToSay}</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.studentName} <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={formData.studentName}
            onChange={(e) => update({ studentName: e.target.value })}
            placeholder={text.studentNamePlaceholder}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{text.currentSchool} <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={formData.currentSchool}
            onChange={(e) => update({ currentSchool: e.target.value })}
            placeholder={text.currentSchool}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{text.intendedIntake} <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={formData.intendedIntakeTime}
              onChange={(e) => update({ intendedIntakeTime: e.target.value })}
              placeholder={text.intendedIntakePlaceholder}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{text.email} <span className="text-red-400">*</span></label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder={text.emailPlaceholder}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 历史学历 (针对本科和研究生) */}
      {(formData.stage === 'undergraduate' || formData.stage === 'graduate') && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-800">{text.educationHistory}</label>
            <button
              type="button"
              onClick={addEdu}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {text.addEducation}
            </button>
          </div>

          <div className="space-y-4">
            {(formData.educationHistory || []).map((edu, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl relative group border border-gray-100">
                <button
                  type="button"
                  onClick={() => removeEdu(idx)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEdu(idx, { school: e.target.value })}
                      placeholder={text.schoolName}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={edu.major}
                      onChange={(e) => updateEdu(idx, { major: e.target.value })}
                      placeholder={text.major}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateEdu(idx, { gpa: e.target.value })}
                      placeholder="GPA"
                      className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={edu.graduationYear}
                      onChange={(e) => updateEdu(idx, { graduationYear: e.target.value })}
                      placeholder={text.graduationYear}
                      className="w-1/2 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!formData.educationHistory || formData.educationHistory.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-2 italic">
                {formData.stage === 'graduate' ? '建议补充本科背景信息' : '可选补充高中/转学前背景'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
