import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, AlertCircle, BellRing, Copy, Info, ExternalLink, Globe, ShieldAlert } from 'lucide-react';
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
  const [showManualOptions, setShowManualOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    setShowManualOptions(false);

    const testMsg = `✅ <b>اختبار نظام الإحالة</b>\n👤 المستخدم: ${currentUser.name}\n🚀 تم التوصيل عبر خوادم وسيطة لتجاوز حظر الشبكة.`;
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ 
        type: 'success', 
        msg: 'تم إرسال الطلب عبر وكلاء خارجيين. تحقق من تليجرام الآن.' 
      });
    } else {
      setTeleFeedback({ 
        type: 'error', 
        msg: 'فشلت جميع محاولات التوصيل الآلي بسبب قيود الشبكة الشديدة.' 
      });
      setShowManualOptions(true);
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
      setTeleFeedback({ type: 'success', msg: 'تم حفظ المعرف في حسابك' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleCopyTestText = () => {
    const text = `أهلاً، أنا ${currentUser.name}، أختبر الربط يدوياً لمعرفي: ${telegramChatId}`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-6 space-y-6 pb-24 px-4 font-cairo">
      {/* تعليمات الربط */}
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-slate-800">
        <h3 className="flex items-center gap-2 font-black text-sm mb-4 text-blue-400">
          <Info size={18} /> كيفية الحصول على المعرف
        </h3>
        <div className="space-y-3 text-[11px] font-bold opacity-90">
          <p>1. تأكد من تفعيل البوت: <a href="https://t.me/ReferralSystemBot" target="_blank" className="text-blue-400 underline">@ReferralSystemBot</a></p>
          <p>2. أرسل أي رسالة للبوت <a href="https://t.me/userinfobot" target="_blank" className="text-blue-400 underline">@userinfobot</a> ليعطيك رقم المعرف (Id).</p>
          <p className="text-orange-400">ملاحظة: إذا بدأ المعرف بعلامة سالب (-) اكتبها كما هي.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-600">
            <BellRing size={26} />
          </div>
          <h2 className="text-lg font-black text-slate-900">ربط الإشعارات</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-1 pr-1 uppercase">Telegram ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
              className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-blue-500 outline-none text-center text-xl font-black text-slate-700 transition-all"
              placeholder="-100123456"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              حفظ
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              اختبار
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl text-[11px] font-bold border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <ShieldAlert size={16} className="mt-0.5" />}
              <div>{teleFeedback.msg}</div>
            </div>
          )}

          {showManualOptions && (
            <div className="mt-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-200 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-[11px] font-black text-slate-600">
                  ⚠️ شبكة الكلية تحظر روابط تليجرام المباشرة تماماً. 
                </p>
                <div className="h-px bg-slate-200 w-full my-2"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase italic">الحل اليدوي الأخير</p>
              </div>

              <button 
                onClick={handleCopyTestText}
                className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-sm border ${copySuccess ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copySuccess ? 'تم النسخ!' : 'نسخ رسالة تعريفية للبوت'}
              </button>
              
              <p className="text-[9px] text-slate-400 text-center font-bold px-4 leading-relaxed">
                انسخ النص أعلاه، ثم افتح تليجرام من هاتفك (ببيانات الجوال) وأرسله للبوت <a href="https://t.me/ReferralSystemBot" className="text-blue-500 underline">@ReferralSystemBot</a> لتأكيد الهوية.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
         <h4 className="font-black text-xs text-slate-800 mb-2 flex items-center gap-2">
           <Lock size={16} className="text-slate-400" /> الأمان
         </h4>
         <button 
            onClick={() => {
              const p = prompt('أدخل كلمة المرور الجديدة:');
              if (p) updateUserPassword(p).then(() => alert('تم التغيير بنجاح'));
            }}
            className="w-full py-3 border-2 border-slate-50 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-100 transition-all"
         >
           تعديل كلمة المرور
         </button>
      </div>
    </div>
  );
};

export default Profile;