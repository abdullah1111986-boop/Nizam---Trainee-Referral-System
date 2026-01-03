import React, { useState } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, BellRing, Info, ShieldAlert } from 'lucide-react';
import { sendTelegramNotification, formatReferralMessage } from '../services/telegramService';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => Promise<void>;
  onUpdateTelegram: (chatId: string) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword, onUpdateTelegram }) => {
  const [telegramChatId, setTelegramChatId] = useState(currentUser.telegramChatId || '');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [teleFeedback, setTeleFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);

    const testMsg = formatReferralMessage(
      'اختبار نظام الإشعارات', 
      'متدرب تجريبي', 
      'نشط', 
      currentUser.name, 
      'تم الإرسال باستخدام بروتوكول POST JSON الموثوق.'
    );
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ type: 'success', msg: 'تم تسليم الإشعار بنجاح! تحقق من تليجرام.' });
    } else {
      setTeleFeedback({ type: 'error', msg: 'فشل الإرسال. تأكد من أنك بدأت المحادثة مع البوت.' });
    }
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    if (!telegramChatId) return;
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم تحديث بيانات الربط بنجاح' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6 pb-24 px-4 font-cairo">
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-slate-800">
        <h3 className="flex items-center gap-2 font-black text-sm mb-4 text-blue-400">
          <Info size={18} /> التوافقية المباشرة
        </h3>
        <p className="text-[11px] font-bold opacity-80 leading-relaxed">
          نظامنا يستخدم الآن أحدث معايير التواصل مع تيليجرام (POST/JSON) لضمان مرور الإشعارات من خلال شبكات الكليات والشبكات المحمية بنسبة نجاح عالية.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
            <BellRing size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إعدادات الإشعارات</h2>
          <p className="text-xs text-slate-400 font-bold mt-1">ربط حسابك بتطبيق تيليجرام</p>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 pr-1 uppercase tracking-widest">Telegram ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
              className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-center text-2xl font-black text-slate-700 transition-all shadow-inner"
              placeholder="-100xxxxxxx"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              حفظ الهوية
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              إرسال اختبار
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl text-[11px] font-bold border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <ShieldAlert size={16} className="mt-0.5" />}
              <div>{teleFeedback.msg}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
         <button 
            onClick={() => {
              const p = prompt('أدخل كلمة المرور الجديدة:');
              if (p) updateUserPassword(p).then(() => alert('تم تحديث البيانات بنجاح'));
            }}
            className="w-full py-4 border-2 border-slate-50 text-slate-400 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
         >
           <Lock size={16} /> تعديل كلمة المرور السرية
         </button>
      </div>
    </div>
  );
};

export default Profile;