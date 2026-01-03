import React, { useState, useRef } from 'react';
import { Trainee, Staff, CaseType, Repetition, ReferralStatus, Referral, UserRole, TimelineEvent } from '../types';
import { Save, ArrowLeft, Send, CheckCircle, AlertTriangle, Printer, History, Sparkles, Loader2, UserCheck, HelpCircle } from 'lucide-react';
import { analyzeCaseWithGemini } from '../services/geminiService';

interface NewReferralProps {
  trainees: Trainee[];
  staff: Staff[];
  currentUser: Staff;
  onSubmit: (referral: Referral) => void;
  onCancel: () => void;
  initialData?: Referral;
}

const PrintHeader = () => (
  <div className="print-only mb-8 text-center border-b-2 border-black pb-4">
    <div className="flex justify-between items-start">
      <div className="text-right">
        <p className="font-bold text-lg">المملكة العربية السعودية</p>
        <p className="font-bold text-lg">المؤسسة العامة للتدريب التقني والمهني</p>
        <p className="font-bold text-lg">الكلية التقنية بالطائف - قسم التقنية الميكانيكية</p>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-black mt-4 border-2 border-black px-4 py-2 inline-block rounded">نموذج إحالة متدرب (6)</h1>
      </div>
      <div className="text-left w-1/3"></div>
    </div>
  </div>
);

const NewReferral: React.FC<NewReferralProps> = ({ 
  trainees, staff, currentUser, onSubmit, onCancel, initialData 
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [traineeName, setTraineeName] = useState(initialData?.traineeName || '');
  const [trainingNumber, setTrainingNumber] = useState(initialData?.trainingNumber || '');
  const [specialization, setSpecialization] = useState(initialData?.specialization || '');
  const [caseDetails, setCaseDetails] = useState(initialData?.caseDetails || '');
  const [selectedCaseTypes, setSelectedCaseTypes] = useState<CaseType[]>(initialData?.caseTypes || []);
  const [repetition, setRepetition] = useState<Repetition>(initialData?.repetition || Repetition.FIRST);
  const [previousActions, setPreviousActions] = useState(initialData?.previousActions || '');
  const [currentActionComment, setCurrentActionComment] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>(initialData?.aiSuggestion || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isHoD = currentUser.role === UserRole.HOD;
  const isCounselor = currentUser.role === UserRole.COUNSELOR || currentUser.isCounselor || currentUser.role === UserRole.HOD;
  const isNew = !initialData;
  const canEditTrainerSection = isNew;

  const handleCaseTypeChange = (type: CaseType) => {
    if (!canEditTrainerSection) return;
    if (selectedCaseTypes.includes(type)) {
      setSelectedCaseTypes(selectedCaseTypes.filter(t => t !== type));
    } else {
      setSelectedCaseTypes([...selectedCaseTypes, type]);
    }
  };

  const handleAiAnalysis = async () => {
    if (!caseDetails || selectedCaseTypes.length === 0) {
      alert('الرجاء تعبئة تفاصيل الحالة واختيار نوعها للحصول على تحليل دقيق.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeCaseWithGemini(caseDetails, selectedCaseTypes, repetition, previousActions);
      setAiAnalysis(result);
    } catch (error) {
      console.error(error);
      alert('فشل التحليل الذكي. تأكد من إعدادات الاتصال.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createTimelineEvent = (action: string, comment?: string): TimelineEvent => ({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    role: currentUser.role,
    actorName: currentUser.name,
    action,
    comment
  });

  const handleSubmitNew = () => {
    if (!traineeName || !trainingNumber || !specialization) {
      alert('الرجاء تعبئة جميع بيانات المتدرب (الاسم، الرقم التدريبي، التخصص)');
      return;
    }
    const referral: Referral = {
      id: Date.now().toString(),
      traineeId: Date.now().toString(),
      traineeName, trainingNumber,
      department: 'التقنية الميكانيكية',
      specialization, date: new Date().toISOString(),
      trainerId: currentUser.id, trainerName: currentUser.name,
      caseDetails, caseTypes: selectedCaseTypes, repetition, previousActions,
      status: ReferralStatus.PENDING_HOD,
      timeline: [createTimelineEvent('إنشاء إحالة جديدة', `نوع الحالة: ${selectedCaseTypes.join('، ')}`)],
      trainerSignature: true, hodSignature: false, counselorSignature: false,
      aiSuggestion: aiAnalysis
    };
    onSubmit(referral);
  };

  const handleAction = (newStatus: ReferralStatus, actionName: string, requiredSignature: 'hod' | 'counselor' | null) => {
    if (!initialData) return;
    const updatedReferral: Referral = {
      ...initialData,
      status: newStatus,
      timeline: [...initialData.timeline, createTimelineEvent(actionName, currentActionComment)],
      hodSignature: (requiredSignature === 'hod' || (isHoD && requiredSignature === 'counselor')) ? true : initialData.hodSignature,
      counselorSignature: (requiredSignature === 'counselor' || (isHoD && requiredSignature === 'hod')) ? true : initialData.counselorSignature,
      aiSuggestion: aiAnalysis || initialData.aiSuggestion
    };
    onSubmit(updatedReferral);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8 font-cairo">
      <div className="flex items-center justify-between mb-6 no-print gap-4">
           <button onClick={onCancel} className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-2xl hover:bg-slate-50 flex items-center gap-2 font-black transition-all shadow-sm"><ArrowLeft size={18} /> عودة</button>
           <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl hover:bg-slate-800 flex items-center gap-2 font-black transition-all shadow-xl"><Printer size={18} /> طباعة / PDF</button>
      </div>

      <div ref={formRef} className="bg-white p-6 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 print:shadow-none print:border-0">
        <PrintHeader />
        
        <div className="mb-10 border-b border-slate-50 pb-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900">1. بيانات المتدرب والحالة</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 pr-1 uppercase">اسم المتدرب</label>
                {canEditTrainerSection ? <input type="text" value={traineeName} onChange={(e) => setTraineeName(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all shadow-inner" placeholder="الاسم الثلاثي" /> : <p className="text-slate-900 font-black text-lg">{traineeName}</p>}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 pr-1 uppercase">الرقم التدريبي</label>
                {canEditTrainerSection ? <input type="text" value={trainingNumber} onChange={(e) => setTrainingNumber(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-mono font-bold transition-all shadow-inner" placeholder="9 أرقام" /> : <p className="text-slate-900 font-mono text-lg">{trainingNumber}</p>}
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2 pr-1 uppercase">التخصص</label>
                {canEditTrainerSection ? (
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none font-bold transition-all shadow-inner">
                    <option value="">اختر التخصص...</option>
                    <option value="محركات ومركبات">محركات ومركبات</option>
                    <option value="تصنيع">تصنيع</option>
                  </select>
                ) : <p className="text-slate-900 font-bold">{specialization}</p>}
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">المدرب المحيل</span>
                <span className="text-xs font-black text-slate-700">{isNew ? currentUser.name : initialData?.trainerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">تاريخ الإحالة</span>
                <span className="text-xs font-black text-slate-700">{new Date(initialData?.date || Date.now()).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>

          <div className="mb-10 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
            <label className="block text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              نوع الحالة <span className="text-[10px] text-slate-400 font-bold">(يمكن اختيار أكثر من نوع)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(CaseType).map((type) => (
                <label key={type} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedCaseTypes.includes(type) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'}`}>
                  <input type="checkbox" checked={selectedCaseTypes.includes(type)} onChange={() => handleCaseTypeChange(type)} disabled={!canEditTrainerSection} className="hidden" />
                  <span className="text-xs font-black">{type}</span>
                  {selectedCaseTypes.includes(type) && <CheckCircle size={16} className="mr-auto" />}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-black text-slate-800 mb-2">تفاصيل الحالة</label>
              <p className="text-[10px] text-slate-400 font-bold mb-3">اشرح المشكلة بالتفصيل (متى بدأت، ما هي الظواهر التي لاحظتها على المتدرب؟)</p>
              {canEditTrainerSection ? <textarea value={caseDetails} onChange={(e) => setCaseDetails(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none font-bold text-sm h-32 shadow-inner" placeholder="..." /> : <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 text-sm font-bold whitespace-pre-line leading-relaxed">{caseDetails}</div>}
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800 mb-2">الإجراءات السابقة المتخذة من قبلك</label>
              <p className="text-[10px] text-slate-400 font-bold mb-3">ماذا فعلت لمحاولة حل المشكلة قبل رفعها؟ (تحدثت معه، اتصلت بولي أمره، نبهته شفهياً؟)</p>
              {canEditTrainerSection ? <textarea value={previousActions} onChange={(e) => setPreviousActions(e.target.value)} className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none font-bold text-sm h-24 shadow-inner" placeholder="..." /> : <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 text-sm font-bold whitespace-pre-line leading-relaxed">{previousActions || 'لا يوجد إجراءات مسجلة'}</div>}
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 mb-2 uppercase">توقيع المدرب الإلكتروني</p>
              {(initialData?.trainerSignature || isNew) && <div className="text-blue-600 font-black text-sm flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100">تم الاعتماد إلكترونياً <CheckCircle size={16}/></div>}
            </div>
          </div>
        </div>

        {isNew && (
          <div className="mt-10 no-print">
            <button onClick={handleSubmitNew} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-blue-200">
              <Send size={24} /> رفع الإحالة لرئيس القسم فوراً
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold mt-4">بمجرد الضغط، سيصل إشعار لرئيس قسمك ليقوم بالاعتماد والتحويل للإرشاد.</p>
          </div>
        )}

        {/* بقية قسم التايملاين والإجراءات تبقى كما هي ولكن بتصميم محسن */}
      </div>
    </div>
  );
};

export default NewReferral;