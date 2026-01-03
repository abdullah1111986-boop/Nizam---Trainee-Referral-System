import React, { useState } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, BellRing, Info, ShieldAlert, MessageCircle, ExternalLink, Hash, Smartphone } from 'lucide-react';
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
      'تهانينا! حسابك الآن مرتبط بنظام الإحالة الرقمي بنجاح.'
    );
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ type: 'success', msg: 'تم تسليم الإشعار بنجاح! تحقق من تليجرام.' });
    } else {
      setTeleFeedback({ type: 'error', msg: 'فشل الإرسال. تأكد من تفعيل البوت أولاً.' });
    }
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    if (!telegramChatId) return;
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم حفظ بيانات الربط بنجاح في النظام' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء الاتصال بقاعدة البيانات' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-8 pb-24 px-4 font-cairo">
      {/* بطاقة الدليل الإرشادي - مهمة جداً للمدرب */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="flex items-center gap-3 font-black text-xl mb-6">
            <Smartphone size={28} className="text-blue-200" /> دليل تفعيل الإشعارات
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black flex-shrink-0">1</div>
              <div>
                <p className="font-black text-sm mb-1">تفعيل البوت</p>
                <p className="text-xs opacity-80 leading-relaxed">ابحث في تليجرام عن البوت <span className="bg-white/20 px-2 py-0.5 rounded font-mono">@ReferralSystemBot</span> أو ابدأ المحادثة بالضغط على زر "فتح تليجرام" أدناه.</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black flex-shrink-0">2</div>
              <div>
                <p className="font-black text-sm mb-1">الحصول على معرفك (Chat ID)</p>
                <p className="text-xs opacity-80 leading-relaxed">لمعرفة رقم الـ ID الخاص بك، ابحث عن بوت <span className="bg-white/20 px-2 py-0.5 rounded font-mono">@userinfobot</span> وأرسل له أي رسالة وسيعطيك رقم (Id) مكون من عدة أرقام.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-black flex-shrink-0">3</div>
              <div>
                <p className="font-black text-sm mb-1">الربط النهائي</p>
                <p className="text-xs opacity-80 leading-relaxed">قم بنسخ الرقم وضعه في خانة "Telegram ID" بالأسفل ثم اضغط حفظ.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
            <a href="https://t.me/ReferralSystemBot" target="_blank" rel="noreferrer" className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-lg">
              <MessageCircle size={18} /> فتح تليجرام وتفعيل البوت
            </a>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
            <Hash size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">بيانات الربط الرقمي</h2>
          <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest">Connect your Telegram Account</p>
        </div>
        
        <div className="space-y-6">
          <div className="relative group">
            <label className="block text-xs font-black text-slate-400 mb-3 pr-2 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} className="text-amber-500" /> Telegram Chat ID
            </label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
              className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none text-center text-3xl font-black text-slate-700 transition-all shadow-inner placeholder:text-slate-200"
              placeholder="مثال: 54321098"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all shadow-xl"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ وتثبيت الهوية
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-all border-b-4 border-blue-800"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              إرسال رسالة تجريبية
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-4 p-5 rounded-[1.5rem] text-sm font-bold border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              <div className="bg-white p-2 rounded-xl shadow-sm">
                {teleFeedback.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
              </div>
              <div className="pt-1">{teleFeedback.msg}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
           <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
             <Lock size={18} className="text-slate-400" /> الأمن الشخصي
           </h4>
           <button 
              onClick={() => {
                const p = prompt('أدخل كلمة المرور الجديدة:');
                if (p) updateUserPassword(p).then(() => alert('تم تحديث كلمة المرور بنجاح.'));
              }}
              className="w-full py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
           >
             تغيير كلمة المرور السرية
           </button>
        </div>

        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
           <h4 className="font-black text-amber-900 mb-2 flex items-center gap-2 text-sm">
             <Info size={18} /> ملاحظة تقنية
           </h4>
           <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
             الإشعارات تصل فورياً عند رفع حالة جديدة، أو عند اتخاذ قرار من قبل رئيس القسم أو المرشد التدريبي. تأكد من عدم كتم صوت البوت في هاتفك.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;