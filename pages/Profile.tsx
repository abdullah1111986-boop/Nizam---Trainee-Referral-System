import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, AlertCircle, BellRing, MessageSquareText, Info, ExternalLink, Globe, ShieldAlert } from 'lucide-react';
import { sendTelegramNotification, getTelegramDirectLink, formatReferralMessage } from '../services/telegramService';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => Promise<void>;
  onUpdateTelegram: (chatId: string) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword, onUpdateTelegram }) => {
  const [telegramChatId, setTelegramChatId] = useState(currentUser.telegramChatId || '');
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [teleFeedback, setTeleFeedback] = useState<{ type: 'success' | 'error' | 'info', msg: string } | null>(null);
  const [showManualLink, setShowManualLink] = useState(false);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    setShowManualLink(false);

    const testMsg = `✅ <b>اختبار نظام الإحالة</b>\n👤 المستخدم: ${currentUser.name}\n🚀 تم الإرسال عبر نظام التخطي الذكي.`;
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ 
        type: 'success', 
        msg: 'تم إرسال طلب الاختبار بنجاح عبر الوكيل (Proxy). تحقق من هاتفك.' 
      });
    } else {
      setTeleFeedback({ 
        type: 'error', 
        msg: 'يبدو أن شبكتك تحظر جميع طرق الإرسال التلقائي. يرجى استخدام الرابط اليدوي أدناه.' 
      });
      setShowManualLink(true);
    }
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    if (!telegramChatId) {
       alert('يرجى إدخال رقم المعرف');
       return;
    }
    setTeleFeedback(null);
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم حفظ المعرف وتفعيله في النظام' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const openManualLink = () => {
    const testMsg = `🚀 <b>إرسال يدوي</b>\n👤 المستخدم: ${currentUser.name}\nتم تجاوز حظر الشبكة بنجاح.`;
    const url = getTelegramDirectLink(telegramChatId, testMsg);
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6 pb-24 px-4 font-cairo">
      {/* قسم التعليمات */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-slate-700">
        <h3 className="flex items-center gap-2 font-black text-md mb-4 text-blue-400">
          <Info size={18} /> خطوات ربط البوت
        </h3>
        <div className="space-y-4 text-[12px] font-bold">
          <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
            <p>افتح تليجرام وابحث عن <a href="https://t.me/ReferralSystemBot" target="_blank" className="text-blue-400 underline">@ReferralSystemBot</a> واضغط <b>Start</b>.</p>
          </div>
          <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
            <p>للحصول على معرفك الرقمي، ابحث عن <a href="https://t.me/userinfobot" target="_blank" className="text-blue-400 underline">@userinfobot</a>.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
            <BellRing size={26} />
          </div>
          <h2 className="text-lg font-black text-slate-900">إعدادات التنبيهات</h2>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Telegram Integration Status</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 pr-1 mb-1 uppercase">Your Numeric ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 focus:bg-white outline-none text-center text-xl font-black text-slate-700 transition-all"
              placeholder="مثال: 12345678"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              حفظ الهوية
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              اختبار الآن
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl text-[11px] font-bold border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> : <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />}
              <div>{teleFeedback.msg}</div>
            </div>
          )}

          {showManualLink && (
            <div className="mt-4 p-5 bg-orange-50 rounded-[1.5rem] border border-orange-100 space-y-3">
              <p className="text-[11px] font-black text-orange-800 leading-relaxed">
                ⚠️ يبدو أن شبكة الكلية تفرض قيوداً أمنية تمنع الإرسال التلقائي. 
                <br/>
                <b>الحل:</b> اضغط الزر أدناه لإرسال رسالة "تفعيل" يدوية، وبعدها سيتعرف النظام على اتصالك.
              </p>
              <button 
                onClick={openManualLink}
                className="w-full py-3 bg-white text-orange-600 border border-orange-200 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-100 transition-all shadow-sm"
              >
                <Globe size={16} /> فتح رابط التفعيل اليدوي
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
         <h4 className="font-black text-xs text-slate-800 mb-4 flex items-center gap-2">
           <Lock size={16} className="text-slate-400" /> تغيير كلمة المرور
         </h4>
         <p className="text-[10px] text-slate-400 font-bold mb-4 italic">تأكد من اختيار كلمة مرور قوية للحفاظ على أمان بياناتك.</p>
         <button 
            onClick={() => {
              const p = prompt('أدخل كلمة المرور الجديدة:');
              if (p) updateUserPassword(p).then(() => alert('تم التغيير بنجاح'));
            }}
            className="w-full py-3 border-2 border-slate-100 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-50 transition-all"
         >
           تعديل البيانات السرية
         </button>
      </div>
    </div>
  );
};

export default Profile;