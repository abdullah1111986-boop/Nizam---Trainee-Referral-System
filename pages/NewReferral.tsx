
import React, { useState, useRef } from 'react';
import { Trainee, Staff, CaseType, Repetition, ReferralStatus, Referral, UserRole, TimelineEvent } from '../types';
import { Save, ArrowLeft, Send, CheckCircle, AlertTriangle, Printer, History, Sparkles, Loader2 } from 'lucide-react';
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
      traineeName: traineeName,
      trainingNumber: trainingNumber,
      department: 'التقنية الميكانيكية',
      specialization: specialization, 
      date: new Date().toISOString(),
      trainerId: currentUser.id,
      trainerName: currentUser.name,
      caseDetails,
      caseTypes: selectedCaseTypes,
      repetition,
      previousActions,
      status: ReferralStatus.PENDING_HOD,
      timeline: [createTimelineEvent('إنشاء الإحالة', 'تم رفع الإحالة لرئيس القسم')],
      trainerSignature: true,
      hodSignature: false,
      counselorSignature: false,
      aiSuggestion: aiAnalysis
    };
    onSubmit(referral);
  };

  const handleAction = (newStatus: ReferralStatus, actionName: string, requiredSignature: 'hod' | 'counselor' | null) => {
    if (!initialData) return;
    if (!currentActionComment && actionName !== 'تحويل للمرشد') {
      alert('الرجاء كتابة تعليق أو تفاصيل الإجراء المتخذ.');
      return;
    }

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

  const exportToPDF = () => { window.print(); };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 no-print gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
           <button onClick={onCancel} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"><ArrowLeft size={18} /> عودة</button>
           <button onClick={exportToPDF} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center gap-2"><Printer size={18} /> طباعة / PDF</button>
        </div>
        <div className="text-sm text-gray-500 w-full md:w-auto text-right md:text-left">الحالة الحالية: <span className="font-bold text-blue-600">{initialData ? initialData.status : 'مسودة'}</span></div>
      </div>

      <div ref={formRef} className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-0">
        <PrintHeader />
        
        <div className="mb-8 border-b pb-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4 bg-blue-50 p-2 rounded print:bg-transparent print:p-0 print:border-b print:text-black">1. بيانات المتدرب والحالة</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">اسم المتدرب:</label>
                {canEditTrainerSection ? <input type="text" value={traineeName} onChange={(e) => setTraineeName(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" /> : <p className="text-gray-900 font-medium">{traineeName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الرقم التدريبي:</label>
                {canEditTrainerSection ? <input type="text" value={trainingNumber} onChange={(e) => setTrainingNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" /> : <p className="text-gray-900 font-mono">{trainingNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">التخصص:</label>
                {canEditTrainerSection ? (
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="">اختر التخصص...</option>
                    <option value="محركات ومركبات">محركات ومركبات</option>
                    <option value="تصنيع">تصنيع</option>
                  </select>
                ) : <p className="text-gray-900">{specialization}</p>}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-fit">
              <label className="block text-sm font-bold text-gray-700 mb-1">المدرب المحيل:</label>
              <p className="text-gray-900 mb-4">{isNew ? currentUser.name : initialData?.trainerName}</p>
              <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الإحالة:</label>
              <p className="text-gray-900">{new Date(initialData?.date || Date.now()).toLocaleDateString('ar-SA')}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">نوع الحالة:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(CaseType).map((type) => (
                <label key={type} className="flex items-center space-x-2 space-x-reverse">
                  <input type="checkbox" checked={selectedCaseTypes.includes(type)} onChange={() => handleCaseTypeChange(type)} disabled={!canEditTrainerSection} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-gray-800">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">تكرار المشكلة:</label>
            <div className="flex flex-col sm:flex-row gap-4">
              {Object.values(Repetition).map((rep) => (
                <label key={rep} className="flex items-center space-x-2 space-x-reverse">
                  <input type="radio" checked={repetition === rep} onChange={() => canEditTrainerSection && setRepetition(rep)} disabled={!canEditTrainerSection} className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-800">{rep}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">تفاصيل الحالة:</label>
              {canEditTrainerSection ? <textarea value={caseDetails} onChange={(e) => setCaseDetails(e.target.value)} className="w-full p-2 border border-gray-300 rounded h-24" /> : <p className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-900 whitespace-pre-line">{caseDetails}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">الإجراءات السابقة:</label>
              {canEditTrainerSection ? <textarea value={previousActions} onChange={(e) => setPreviousActions(e.target.value)} className="w-full p-2 border border-gray-300 rounded h-20" /> : <p className="p-3 bg-gray-50 rounded border border-gray-200 text-gray-900 whitespace-pre-line">{previousActions || 'لا يوجد'}</p>}
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="mt-6 no-print">
            {aiAnalysis ? (
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3 text-purple-700">
                  <Sparkles size={18} />
                  <h4 className="font-black text-sm uppercase tracking-wide">توصية الذكاء الاصطناعي (Gemini)</h4>
                </div>
                <p className="text-sm text-purple-900 leading-relaxed italic">{aiAnalysis}</p>
              </div>
            ) : (
              (isHoD || isCounselor) && (
                <button 
                  onClick={handleAiAnalysis} 
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  تحليل الحالة واقتراح حلول (AI)
                </button>
              )
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">توقيع المدرب / المحيل</p>
              {(initialData?.trainerSignature || isNew) ? <div className="border-2 border-green-600 text-green-700 font-bold px-4 py-1 rounded rotate-[-2deg] opacity-80 inline-block">تم الاعتماد إلكترونياً</div> : null}
            </div>
          </div>
        </div>

        {isNew && (
          <div className="mt-6 text-center no-print">
            <button onClick={handleSubmitNew} className="bg-blue-600 text-white py-3 px-8 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg flex items-center gap-2 mx-auto w-full md:w-auto justify-center">
              <Send size={20} /> رفع الإحالة لرئيس القسم
            </button>
          </div>
        )}

        {!isNew && initialData && (
          <>
            <div className="mt-8 border-t pt-6 page-break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><History /> مسار المتابعة</h3>
              <div className="space-y-4">
                {initialData.timeline.map((event) => (
                  <div key={event.id} className="flex gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                      {event.role === UserRole.TRAINER && 'مدرب'}
                      {event.role === UserRole.HOD && 'رئيس'}
                      {event.role === UserRole.COUNSELOR && 'مرشد'}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-gray-900">{event.actorName}</p>
                        <span className="text-xs text-gray-500" dir="ltr">{new Date(event.date).toLocaleString('en-US')}</span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700 mt-1">{event.action}</p>
                      {event.comment && <p className="text-sm text-gray-700 mt-2 bg-white p-2 rounded border border-gray-100">{event.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 no-print bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-lg text-blue-900 mb-4">إجراءات المتابعة والحل</h3>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">التعليق / الإجراء المتخذ:</label>
                <textarea 
                  value={currentActionComment} 
                  onChange={(e) => setCurrentActionComment(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="اكتب الإجراء المتخذ هنا..." 
                  disabled={!(isHoD && (initialData.status === ReferralStatus.PENDING_HOD || initialData.status === ReferralStatus.RETURNED_TO_HOD)) && !(isCounselor && initialData.status === ReferralStatus.PENDING_COUNSELOR)} 
                />
              </div>
              <div className="flex flex-col md:flex-row flex-wrap gap-4">
                {isHoD && initialData.status === ReferralStatus.PENDING_HOD && (
                  <>
                    <button onClick={() => handleAction(ReferralStatus.RESOLVED, 'تم حل المشكلة من قبل رئيس القسم', 'hod')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 flex-1"><CheckCircle size={18} /> حل وإغلاق</button>
                    <button onClick={() => handleAction(ReferralStatus.PENDING_COUNSELOR, 'تحويل للمرشد التدريبي', 'hod')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 flex-1"><ArrowLeft size={18} /> تحويل للمرشد</button>
                  </>
                )}
                {isHoD && initialData.status === ReferralStatus.RETURNED_TO_HOD && (
                  <>
                    <button onClick={() => handleAction(ReferralStatus.RESOLVED, 'اعتماد الحل وإغلاق', 'hod')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 flex-1"><CheckCircle size={18} /> اعتماد الحل وإغلاق</button>
                    <button onClick={() => handleAction(ReferralStatus.TO_STUDENT_AFFAIRS, 'تحويل لشؤون المتدربين', 'hod')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 flex-1"><AlertTriangle size={18} /> رفع لشؤون المتدربين</button>
                  </>
                )}
                {isCounselor && initialData.status === ReferralStatus.PENDING_COUNSELOR && (
                  <>
                    <button onClick={() => handleAction(ReferralStatus.RETURNED_TO_HOD, 'تمت المعالجة - إعادة لرئيس القسم', 'counselor')} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 flex-1"><CheckCircle size={18} /> تمت المعالجة وإعادة للرئيس</button>
                    <button onClick={() => handleAction(ReferralStatus.RETURNED_TO_HOD, 'توصية بالرفع لشؤون المتدربين', 'counselor')} className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 flex-1"><AlertTriangle size={18} /> توصية لشؤون المتدربين</button>
                  </>
                )}
                {initialData.status === ReferralStatus.RESOLVED && (<p className="text-green-700 font-bold flex items-center gap-2"><CheckCircle/> هذه الإحالة مكتملة.</p>)}
                {initialData.status === ReferralStatus.TO_STUDENT_AFFAIRS && (<p className="text-red-700 font-bold flex items-center gap-2"><AlertTriangle/> هذه الإحالة محالة لشؤون المتدربين.</p>)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewReferral;
