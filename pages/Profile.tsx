import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, MessageCircle, Hash, Smartphone, HelpCircle, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { sendTelegramNotification, formatReferralMessage, checkBotStatus, TelegramResponse } from '../services/telegramService';

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

  useEffect(() => {
    checkBotStatus().then(res => {
      if (res.success) setBotHealth({status: 'ok', detail: res.message});
      else setBotHealth({status: 'error', detail: res.description});
    });
  }, []);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ success: false, description: 'يرجى إدخال المعرف الرقمي أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    
    const testMessage = formatReferralMessage('اختبار النظام', 'تجربة ناجحة', 'نشط', currentUser.name, 'تم ربط حسابك بنظام الإشعارات بنجاح!');
    const result = await sendTelegramNotification(telegramChatId, testMessage);
    
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
      
      {/* 📘 دليل إعداد الإشعارات (الشروحات - كما طلبت باقية ومحسنة) */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
        <div className="bg-white rounded-[2.3rem] p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">مركز مساعدة المدربين</h2>
              <p className="text-slate-500 text-sm font-bold">اتبع هذه الخطوات لربط حسابك وتلقي الإشعارات</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group transition-all duration-500">
              <span className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">1</span>
              <div className="mb-4 text-blue-600"><MessageCircle size={32} /></div>
              <h4 className="font-black text-slate-800 mb-2">تفعيل البوت</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">يجب الدخول للبوت والضغط على <b>Start</b> لفتح قناة التواصل.</p>
              <a href="https://t.me/ReferralSystemBot" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-black text-[10px] bg-blue-50 px-3 py-2 rounded-xl w-fit hover:bg-blue-100 transition-colors">
                فتح البوت الرسمي <ExternalLink size={12} />
              </a>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group transition-all duration-500">
              <span className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">2</span>
              <div className="mb-4 text-indigo-600"><Hash size={32} /></div>
              <h4 className="font-black text-slate-800 mb-2">معرفة رقم الـ ID</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">هذا البوت يزودك برقم حسابك (Chat ID) المطلوب وضعه بالأسفل.</p>
              <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 font-black text-[10px] bg-indigo-50 px-3 py-2 rounded-xl w-fit hover:bg-indigo-100 transition-colors">
                معرفة رقم الـ ID الخاص بي <ExternalLink size={12} />
              </a>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group transition-all duration-500">
              <span className="absolute -top-4 -right-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">3</span>
              <div className="mb-4 text-green-600"><CheckCircle size={32} /></div>
              <h4 className="font-black text-slate-800 mb-2">الحفظ والفحص</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">ضع الرقم في الخانة، اضغط حفظ، ثم جرب إرسال رسالة فحص.</p>
              <div className="text-green-600 font-black text-[10px] bg-green-50 px-3 py-2 rounded-xl w-fit flex items-center gap-2">
                جاهز للعمل <Smartphone size={12} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الإعدادات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                 <Smartphone size={24} className="text-blue-600" /> إعدادات الربط التقني
               </h3>
               <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${botHealth.status === 'ok' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                 {botHealth.status === 'ok' ? 'نظام الإشعارات متصل' : 'مشكلة في خادم تيليجرام'}
               </div>
            </div>
            
            <div className="space-y-8">
              <div className="relative">
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full p-8 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:border-blue-500 focus:bg-white outline-none text-center text-4xl font-black text-slate-800 transition-all shadow-inner"
                  placeholder="000000000"
                />
                <p className="text-center text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest">المعرف الرقمي الخاص بك (Chat ID)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleUpdateTelegram} disabled={isSavingTelegram} className="py-5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                  {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} حفظ المعرف
                </button>
                <button onClick={handleTestTelegram} disabled={isTestingTelegram || !telegramChatId} className="py-5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all active:scale-95">
                  {isTestingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} فحص الربط الآن
                </button>
              </div>
            </div>

            {teleFeedback && (
              <div className={`mt-8 p-6 rounded-[2rem] border animate-fade-in ${teleFeedback.success ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    {teleFeedback.success ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                  </div>
                  <div>
                    <h5 className="font-black text-sm mb-1">{teleFeedback.success ? 'تم الاتصال بنجاح!' : 'فشل الاتصال'}</h5>
                    <p className="text-xs font-bold opacity-75 leading-relaxed">{teleFeedback.success ? 'تم إرسال رسالة تجريبية لهاتفك، يرجى التأكد من وصولها.' : teleFeedback.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
             <div className="flex items-center gap-2 mb-4 text-amber-600">
                <HelpCircle size={20} />
                <h4 className="font-black text-sm">أسئلة شائعة</h4>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black text-amber-900 mb-1">لماذا لا تصلني التنبيهات؟</p>
                   <p className="text-[10px] font-bold text-amber-700 opacity-80 leading-relaxed">تأكد من إرسال /start للبوت @ReferralSystemBot أولاً، ومن صحة رقم الـ ID.</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-amber-900 mb-1">هل الإشعارات فورية؟</p>
                   <p className="text-[10px] font-bold text-amber-700 opacity-80 leading-relaxed">نعم، تصلك الإشعارات في نفس اللحظة التي يتم فيها رفع الحالة أو تحديثها.</p>
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