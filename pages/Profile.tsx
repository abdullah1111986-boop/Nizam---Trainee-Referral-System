import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, AlertCircle, BellRing, MessageSquareText, Info, ExternalLink, Globe } from 'lucide-react';
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

  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>('default');

  useEffect(() => {
    if ("Notification" in window) {
      setBrowserNotificationStatus(Notification.permission);
    }
  }, []);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    setShowManualLink(false);

    const testMsg = `✅ <b>اختبار الربط</b>\n👤 المستخدم: ${currentUser.name}\n🚀 إذا وصلتك هذه الرسالة، فالربط التلقائي يعمل بنجاح.`;
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ 
        type: 'success', 
        msg: 'تم إرسال طلب الاختبار. إذا لم تصل الرسالة خلال 10 ثوانٍ، جرب الإرسال اليدوي.' 
      });
      setShowManualLink(true);
    } else {
      setTeleFeedback({ 
        type: 'error', 
        msg: 'تعذر الإرسال التلقائي. قد يكون تليجرام محظوراً في شبكتك.' 
      });
      setShowManualLink(true);
    }
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    setTeleFeedback(null);
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم حفظ المعرف بنجاح' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const openManualLink = () => {
    const testMsg = `🚀 <b>اختبار إرسال يدوي</b>\n👤 المستخدم: ${currentUser.name}\nتم الإرسال عبر رابط مباشر لتجاوز قيود الشبكة.`;
    const url = getTelegramDirectLink(telegramChatId, testMsg);
    window.open(url, '_blank', 'width=500,height=400');
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6 pb-24 px-4 font-cairo">
      {/* تعليمات الربط */}
      <div className="bg-slate-900 text-white p-7 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 font-black text-lg mb-4 text-blue-400">
            <Info size={22} /> تفعيل التنبيهات
          </h3>
          <ol className="space-y-3 text-[13px] font-bold opacity-90 list-decimal pr-4 leading-relaxed">
            <li>ابحث عن البوت: <a href="https://t.me/ReferralSystemBot" target="_blank" className="underline text-blue-400">@ReferralSystemBot</a></li>
            <li>أرسل كلمة <b>/start</b> للبوت.</li>
            <li>احصل على معرفك من: <a href="https://t.me/userinfobot" target="_blank" className="underline text-blue-400">@userinfobot</a></li>
            <li>ضع المعرف في الخانة بالأسفل.</li>
          </ol>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Send size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">ربط التيليجرام</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 pr-1">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none text-center text-xl font-bold text-slate-700"
              placeholder="00000000"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
              حفظ
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-4 border-2 border-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={18} /> : <MessageSquareText size={18} />}
              اختبار
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-2 p-4 rounded-2xl text-[11px] font-black border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
              <div>{teleFeedback.msg}</div>
            </div>
          )}

          {showManualLink && (
            <button 
              onClick={openManualLink}
              className="w-full py-4 bg-orange-50 text-orange-700 border-2 border-orange-100 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-orange-100 transition-all"
            >
              <Globe size={16} />
              لم تصل الرسالة؟ جرب الإرسال اليدوي
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;