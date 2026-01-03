import React, { useState, useRef } from 'react';
import { Trainee, Staff, CaseType, Repetition, ReferralStatus, Referral, UserRole, TimelineEvent } from '../types';
import { Save, ArrowLeft, Send, CheckCircle, AlertTriangle, Printer, History, Sparkles, Loader2, UserCheck, HelpCircle, Clock, Calendar } from 'lucide-react';
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

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return {
      date: date.toLocaleDateString('ar-SA'),
      time: date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const currentRefDateTime = formatDateTime(initialData?.date || new Date().toISOString());

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8 font-cairo">
      {/* الأزرار العلوية */}
      <div className="flex items-center justify-between mb-6 no-print gap-4">
           <button onClick={onCancel} className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded-xl hover:bg-slate-50 flex items-center gap-2 font-black transition-all shadow-sm"><ArrowLeft size={18} /> عودة</button>
           <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2 rounded-xl hover:bg-slate-800 flex items-center gap-2 font-black transition-all shadow-xl"><Printer size={18} /> طباعة التقرير</button>
      </div>

      <div ref={formRef} className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-200 print:shadow-none print:border-0 print:p-0">
        <PrintHeader />
        
        {/* الترويسة الرقمية (تاريخ ووقت) */}
        <div className="flex flex-wrap justify-between items-center mb-8 pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-blue-50 p-3 rounded-2xl">
               <HelpCircle size={24} className="text-blue-600" />
             </div>
             <div>
               <h3 className="text-xl font-black text-slate-900 leading-none">بيانات المتدرب والحالة</h3>
               <p className="text-[10px] text-slate-400 font-bold mt-1">تأكد من دقة البيانات المكتوبة قبل الرفع</p>
             </div>
          </div>
          <div className="flex gap-2">
             <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-xs font-black text-slate-700">{currentRefDateTime.date}</span>
             </div>
             <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                <Clock size={14} className="text-blue-600" />
                <span className="text-xs font-black text-blue-700">{currentRefDateTime.time}</span>
             </div>
          </div>
        </div>

        {/* شبكة البيانات (تنسيق منظم) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 pr-2 uppercase">اسم المتدرب</label>
            {canEditTrainerSection ? (
              <input type="text" value={traineeName} onChange={(e) => setTraineeName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all" placeholder="الاسم الثلاثي" />
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-slate-800">{traineeName}</div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 pr-2 uppercase">الرقم التدريبي</label>
            {canEditTrainerSection ? (
              <input type="text" value={trainingNumber} onChange={(e) => setTrainingNumber(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-mono font-bold transition-all text-center" placeholder="000000000" />
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-mono font-black text-slate-800 text-center">{trainingNumber}</div>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 pr-2 uppercase">التخصص التدريبي</label>
            {canEditTrainerSection ? (
              <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all appearance-none">
                <option value="">اختر...</option>
                <option value="محركات ومركبات">محركات ومركبات</option>
                <option value="تصنيع">تصنيع</option>
              </select>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-black text-slate-800 text-center">{specialization}</div>
            )}
          </div>
        </div>

        {/* تصنيف الحالة */}
        <div className="mb-10">
          <label className="block text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            نوع الحالة التدريبية <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">اختيار متعدد</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(CaseType).map((type) => (
              <label key={type} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${selectedCaseTypes.includes(type) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                <input type="checkbox" checked={selectedCaseTypes.includes(type)} onChange={() => handleCaseTypeChange(type)} disabled={!canEditTrainerSection} className="hidden" />
                <span className="text-xs font-black">{type}</span>
                {selectedCaseTypes.includes(type) && <CheckCircle size={16} className="mr-auto" />}
              </label>
            ))}
          </div>
        </div>

        {/* تفاصيل الحالة والإجراءات */}
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">تفاصيل الحالة (توجيه للمدرب)</label>
            <p className="text-[10px] text-slate-400 font-bold mb-3 italic">اشرح المشكلة بالتفصيل (متى بدأت، الظواهر الملاحظة على المتدرب؟)</p>
            {canEditTrainerSection ? (
              <textarea value={caseDetails} onChange={(e) => setCaseDetails(e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:border-blue-500 outline-none font-bold text-sm h-32 transition-all" placeholder="اكتب هنا تفاصيل المشكلة..." />
            ) : (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 text-sm font-bold whitespace-pre-line leading-relaxed">{caseDetails}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-black text-slate-800 mb-2">الإجراءات المتخذة قبل الإحالة</label>
            <p className="text-[10px] text-slate-400 font-bold mb-3 italic">ماذا فعلت لحل المشكلة؟ (تنبيه شفهي، اتصال، لقاء؟)</p>
            {canEditTrainerSection ? (
              <textarea value={previousActions} onChange={(e) => setPreviousActions(e.target.value)} className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:border-blue-500 outline-none font-bold text-sm h-24 transition-all" placeholder="اذكر الإجراءات السابقة..." />
            ) : (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-700 text-sm font-bold whitespace-pre-line leading-relaxed">{previousActions || 'لا يوجد إجراءات مسجلة'}</div>
            )}
          </div>
        </div>

        {/* التوقيع والتأكيد */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap justify-between items-center gap-6">
           <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                <UserCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">المدرب المحيل</p>
                <p className="text-sm font-black text-slate-800">{isNew ? currentUser.name : initialData?.trainerName}</p>
              </div>
           </div>
           
           {isNew && (
             <button onClick={handleSubmitNew} className="bg-blue-600 text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95">
                <Send size={20} /> رفع الإحالة الرقمية الآن
             </button>
           )}
           
           {!isNew && initialData?.trainerSignature && (
             <div className="bg-green-50 text-green-700 px-6 py-4 rounded-2xl border border-green-100 flex items-center gap-3">
                <CheckCircle size={20} />
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase opacity-60">حالة التوقيع</p>
                   <p className="text-xs font-black">تم الاعتماد إلكترونياً</p>
                </div>
             </div>
           )}
        </div>

        {/* التايملاين للأقسام (في حال كان هناك إحالة قائمة) */}
        {!isNew && initialData.timeline.length > 0 && (
          <div className="mt-12 no-print">
            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <History size={20} className="text-blue-600" /> سجل متابعة الحالة
            </h4>
            <div className="space-y-4">
              {initialData.timeline.map((event, idx) => {
                const eventDT = formatDateTime(event.date);
                return (
                  <div key={idx} className="flex gap-4 items-start relative group">
                    <div className="w-1.5 h-full absolute right-[19px] top-6 bg-slate-100 -z-10 rounded-full"></div>
                    <div className="w-10 h-10 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm text-blue-600 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-black text-sm text-slate-800">{event.action}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{event.actorName} - {event.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-500 uppercase">{eventDT.date}</p>
                          <p className="text-[10px] font-black text-blue-600 uppercase">{eventDT.time}</p>
                        </div>
                      </div>
                      {event.comment && <p className="text-xs text-slate-600 font-bold border-t border-slate-200 pt-2 mt-2 italic">"{event.comment}"</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* قسم اتخاذ القرار (لرئيس القسم والمرشد) */}
        {!isNew && (isHoD || isCounselor) && initialData.status !== ReferralStatus.RESOLVED && (
          <div className="mt-12 bg-slate-900 text-white p-8 rounded-[2.5rem] no-print">
            <h4 className="text-lg font-black mb-6 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-400" /> اتخاذ إجراء إداري / تربوي
            </h4>
            
            <textarea
              value={currentActionComment}
              onChange={(e) => setCurrentActionComment(e.target.value)}
              className="w-full p-5 bg-white/10 border border-white/20 rounded-2xl text-white outline-none focus:border-blue-400 mb-6 placeholder-white/30 font-bold text-sm"
              placeholder="اكتب ملاحظاتك الإجرائية هنا..."
            />

            <div className="flex flex-wrap gap-4">
              {isHoD && initialData.status === ReferralStatus.PENDING_HOD && (
                <button onClick={() => handleAction(ReferralStatus.PENDING_COUNSELOR, 'تحويل للمرشد التدريبي', 'hod')} className="bg-blue-600 px-6 py-4 rounded-xl font-black text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                  <Send size={18} /> اعتماد وتحويل للإرشاد
                </button>
              )}
              {isCounselor && initialData.status === ReferralStatus.PENDING_COUNSELOR && (
                <>
                  <button onClick={() => handleAction(ReferralStatus.RESOLVED, 'تم الحل بنجاح', 'counselor')} className="bg-green-600 px-6 py-4 rounded-xl font-black text-sm hover:bg-green-700 transition-all flex items-center gap-2">
                    <CheckCircle size={18} /> تم الحل والإغلاق
                  </button>
                  <button onClick={() => handleAction(ReferralStatus.RETURNED_TO_HOD, 'إعادة لرئيس القسم للمراجعة', 'counselor')} className="bg-amber-600 px-6 py-4 rounded-xl font-black text-sm hover:bg-amber-700 transition-all flex items-center gap-2 text-slate-900">
                    <ArrowLeft size={18} /> إعادة لرئيس القسم
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewReferral;