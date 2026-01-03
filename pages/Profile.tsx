import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, Info, ShieldAlert, MessageCircle, Hash, Smartphone, HelpCircle, Activity, ExternalLink, BookOpen, MousePointer2, AlertCircle } from 'lucide-react';
import { sendTelegramNotification, formatReferralMessage, checkBotStatus, TelegramResponse, getDirectTelegramLink } from '../services/telegramService';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => Promise<void>;
  onUpdateTelegram: (chatId: string) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword, onUpdateTelegram }) => {
  const [telegramChatId, setTelegramChatId] = useState(currentUser.telegramChatId || '');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [teleFeedback, setTeleFeedback] = useState<TelegramResponse | null>(null);
  const [botHealth, setBotHealth] = useState<{status: 'checking' | 'ok' | 'error', detail?: string}>({status: 'checking'});

  const testMessageText = formatReferralMessage('اختبار الربط', 'متدرب تجريبي', 'نشط', currentUser.name, 'تم التأكد من صحة الربط التقني.');

  useEffect(() => {
    checkBotStatus().then(res => {
      if (res.success) setBotHealth({status: 'ok', detail: res.message});
      else setBotHealth({status: 'error', detail: res.description});
    });
  }, []);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ success: false, message: 'يرجى إدخال المعرف الرقمي أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    const result = await sendTelegramNotification(telegramChatId, testMessageText);
    setTeleFeedback(result);
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    if (!telegramChatId) return;
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      alert('✅ تم حفظ المعرف بنجاح.');
    } catch (error) {
      alert('❌ فشل الحفظ.');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 space-y-8 pb-24 px-4 font-cairo">
      
      {/* 📘 دليل إعداد الإشعارات (شروحات المدربين - الحفاظ عليها وتطويرها) */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
        <div className="bg-white/95 backdrop-blur-md rounded-[2.3rem] p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">دليل الربط الرقمي للمدربين</h2>
              <p className="text-slate-500 text-sm font-bold">هذه الخطوات ضرورية لضمان وصول إشعارات الحالات إليك فوراً</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all duration-500">
              <span className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">1</span>
              <div className="mb-4 text-blue-600"><MessageCircle size={32} /></div>
              <h4 className="font-black text-slate-800 mb-2">تفعيل البوت</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">اضغط على الرابط بالأسفل ثم اضغط <b>Start</b> داخل تطبيق تيليجرام.</p>
              <a href="https://t.me/ReferralSystemBot" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-black text-[10px] bg-blue-50 px-3 py-2 rounded-xl w-fit hover:bg-blue-100 transition-colors">
                فتح البوت @ReferralSystemBot <ExternalLink size={12} />
              </a>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all duration-500">
              <span className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">2</span>
              <div className="mb-4 text-indigo-600"><Hash size={32} /></div>
              <h4 className="font-black text-slate-800 mb-2">الحصول على الـ ID</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">افتح هذا البوت لمعرفة رقمك التسلسلي في تيليجرام.</p>
              <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 font-black text-[10px] bg-indigo-50 px-3 py-2 rounded-xl w-fit hover:bg-indigo-100 transition-colors">
                معرفة المعرف الخاص بي <ExternalLink size={12} />
              </a>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all duration-500">
              <span className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">3</span>
              <div className="mb-4 text-green-600"><Save size={32} /></div>
              <h4 className="font-black text-slate-800 mb-2">الحفظ والاختبار</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">انسخ الرقم، ضعه في الخانة بالأسفل، ثم اضغط حفظ.</p>
              <div className="flex items-center gap-2 text-green-600 font-black text-[10px] bg-green-50 px-3 py-2 rounded-xl w-fit">
                خطوة أخيرة وستكون جاهزاً <CheckCircle size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الربط التقني - مع حل مشكلة CORS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Smartphone size={24} className="text-blue-600" /> خانة الربط التقني
               </h3>
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${botHealth.status === 'ok' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                 حالة البوت العامة: {botHealth.status === 'ok' ? 'نشط' : 'مشكلة بالاتصال'}
               </div>
            </div>
            
            <div className="space-y-8">
              <div className="relative">
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
                  className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none text-center text-4xl font-black text-slate-800 transition-all shadow-inner"
                  placeholder="000000000"
                />
                <p className="text-center text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">أدخل الأرقام فقط (Chat ID)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleUpdateTelegram} disabled={isSavingTelegram} className="py-5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                  {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} حفظ المعرف
                </button>
                <button onClick={handleTestTelegram} disabled={isTestingTelegram || !telegramChatId} className="py-5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                  {isTestingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} فحص الربط
                </button>
              </div>
            </div>

            {teleFeedback && (
              <div className={`mt-8 p-6 rounded-[2rem] border animate-fade-in ${teleFeedback.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 bg-white rounded-xl shadow-sm ${teleFeedback.success ? 'text-green-500' : 'text-red-500'}`}>
                    {teleFeedback.success ? <CheckCircle /> : <AlertCircle />}
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-black text-sm mb-1 ${teleFeedback.success ? 'text-green-800' : 'text-red-800'}`}>{teleFeedback.success ? 'تم الاتصال!' : 'تنبيه حماية (CORS)'}</h5>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed mb-4">{teleFeedback.message || teleFeedback.description}</p>
                    
                    {/* حل مشكلة CORS للمدرب */}
                    {teleFeedback.isNetworkError && (
                      <div className="bg-white p-4 rounded-2xl border border-red-100 space-y-3">
                        <p className="text-[10px] font-bold text-slate-500">بسبب سياسة حماية المتصفح، يرجى الضغط على الزر أدناه لفتح الرابط بشكل مباشر في صفحة جديدة للتأكد من وصول الرسالة:</p>
                        <a 
                          href={getDirectTelegramLink(telegramChatId, testMessageText)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-red-700 transition-all shadow-lg"
                        >
                          <ExternalLink size={14} /> فتح رابط الفحص المباشر (تجاوز الحماية)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* الأسئلة الشائعة (حفاظاً على الشروحات) */}
        <div className="space-y-6">
          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
             <div className="flex items-center gap-2 mb-4 text-amber-600">
                <HelpCircle size={20} />
                <h4 className="font-black text-sm">مساعدة المدربين</h4>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black text-amber-900 mb-1">لماذا تظهر رسالة فشل الشبكة؟</p>
                   <p className="text-[10px] font-bold text-amber-700 opacity-80 leading-relaxed">المتصفح يمنع التطبيقات من مراسلة خوادم خارجية أحياناً. استخدم "رابط الفحص المباشر" في حال ظهور هذه المشكلة.</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-amber-900 mb-1">ما هو البوت الرسمي؟</p>
                   <p className="text-[10px] font-bold text-amber-700 opacity-80 leading-relaxed">البوت الرسمي هو <b>@ReferralSystemBot</b>، ابحث عنه في تيليجرام واضغط ابدأ.</p>
                </div>
             </div>
          </div>

          <button onClick={() => {
            const p = prompt('أدخل كلمة المرور الجديدة:');
            if (p) updateUserPassword(p).then(() => alert('تم التحديث'));
          }} className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-slate-400 font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
            <Lock size={14} /> تغيير كلمة المرور
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;