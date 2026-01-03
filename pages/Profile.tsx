import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, BellRing, Copy, Info, Globe, ShieldAlert, WifiOff } from 'lucide-react';
import { sendTelegramNotification, getTelegramDirectLink } from '../services/telegramService';

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
  const [showNetworkHelp, setShowNetworkHelp] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    setShowNetworkHelp(false);

    const testMsg = `✅ <b>اختبار مباشر</b>\n👤 المستخدم: ${currentUser.name}\nتم الإرسال مباشرة من المتصفح دون وسائط.`;
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ 
        type: 'success', 
        msg: 'تم إرسال الطلب المباشر بنجاح! تحقق من هاتفك.' 
      });
    } else {
      setTeleFeedback({ 
        type: 'error', 
        msg: 'تعذر الاتصال بخادم تيليجرام. الشبكة المحلية قد تمنع الطلبات المباشرة.' 
      });
      setShowNetworkHelp(true);
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
      setTeleFeedback({ type: 'success', msg: 'تم حفظ المعرف في النظام' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleCopyTestText = () => {
    const text = `أهلاً، أنا ${currentUser.name}، أختبر الربط المباشر لمعرفي: ${telegramChatId}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6 pb-24 px-4 font-cairo">
      {/* قسم التوجيه */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-slate-800">
        <h3 className="flex items-center gap-2 font-black text-sm mb-4 text-blue-400">
          <Info size={18} /> ربط مباشر بالبوت
        </h3>
        <div className="space-y-3 text-[11px] font-bold opacity-90">
          <p>1. افتح البوت <a href="https://t.me/ReferralSystemBot" target="_blank" className="text-blue-400 underline">@ReferralSystemBot</a> واضغط <b>ابدأ</b>.</p>
          <p>2. أدخل رقم الـ ID الخاص بك (يمكنك الحصول عليه من <a href="https://t.me/userinfobot" target="_blank" className="text-blue-400 underline">@userinfobot</a>).</p>
          <p className="text-blue-300 italic">ملاحظة: النظام الآن يتصل بـ Telegram مباشرة من جهازك.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
            <BellRing size={26} />
          </div>
          <h2 className="text-lg font-black text-slate-900">إعدادات الإشعارات</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-1 pr-1 uppercase">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-center text-xl font-black text-slate-700 transition-all"
              placeholder="-123456789"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              حفظ الهوية
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              اختبار مباشر
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl text-[11px] font-bold border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <ShieldAlert size={16} className="mt-0.5" />}
              <div>{teleFeedback.msg}</div>
            </div>
          )}

          {showNetworkHelp && (
            <div className="mt-4 p-5 bg-amber-50 rounded-[1.5rem] border border-amber-100 space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                <WifiOff size={18} />
                <p className="text-[11px] font-black italic">تحليل المشكلة:</p>
              </div>
              <p className="text-[10px] font-bold text-amber-900 leading-relaxed">
                بما أنك تستخدم <b>الاتصال المباشر</b>، فإن المتصفح يحاول محادثة خوادم تيليجرام بنفسه. إذا لم تصل الرسالة، فهذا يعني أن جدار حماية شبكة الكلية يمنع هذه "المحادثة".
              </p>
              
              <button 
                onClick={handleCopyTestText}
                className={`w-full py-3 rounded-xl font-black text-[10px] flex items-center justify-center gap-2 transition-all shadow-sm border ${copySuccess ? 'bg-green-600 text-white border-green-600' : 'bg-white text-amber-700 border-amber-200'}`}
              >
                {copySuccess ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copySuccess ? 'تم النسخ' : 'نسخ نص للتحقق اليدوي من الهاتف'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
         <h4 className="font-black text-xs text-slate-800 mb-2 flex items-center gap-2">
           <Lock size={16} className="text-slate-400" /> تغيير المرور
         </h4>
         <button 
            onClick={() => {
              const p = prompt('أدخل كلمة المرور الجديدة:');
              if (p) updateUserPassword(p).then(() => alert('تم التغيير بنجاح'));
            }}
            className="w-full py-3 border-2 border-slate-50 text-slate-400 rounded-xl font-black text-[10px] hover:bg-slate-50 transition-all"
         >
           تعديل البيانات السرية
         </button>
      </div>
    </div>
  );
};

export default Profile;