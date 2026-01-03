import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, AlertCircle, BellRing, Smartphone, MessageSquareText, Info, ExternalLink } from 'lucide-react';
import { sendTelegramNotification } from '../services/telegramService';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => Promise<void>;
  onUpdateTelegram: (chatId: string) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword, onUpdateTelegram }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramChatId, setTelegramChatId] = useState(currentUser.telegramChatId || '');
  
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [teleFeedback, setTeleFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>('default');

  useEffect(() => {
    if ("Notification" in window) {
      setBrowserNotificationStatus(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = async () => {
    if (!("Notification" in window)) {
      alert("هذا المتصفح لا يدعم الإشعارات.");
      return;
    }
    const permission = await Notification.requestPermission();
    setBrowserNotificationStatus(permission);
    if (permission === 'granted') {
      new Notification("تم التفعيل", { body: "ستصلك إشعارات النظام على هذا الجهاز بنجاح." });
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);
    try {
      const testMsg = `✅ تم ربط حسابك بنجاح في نظام الإحالة.\n👤 المستخدم: ${currentUser.name}`;
      await sendTelegramNotification(telegramChatId, testMsg);
      setTeleFeedback({ type: 'success', msg: 'وصلت الرسالة! الربط يعمل بنجاح.' });
    } catch (error: any) {
      setTeleFeedback({ type: 'error', msg: `فشل الإرسال: ${error.message || 'تأكد من الخطوات أدناه'}` });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleUpdateTelegram = async () => {
    setTeleFeedback(null);
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم حفظ المعرف في ملفك الشخصي' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ البيانات' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6 pb-24 px-4">
      {/* قسم إرشادات التيليجرام - مهم جداً للحل */}
      <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 font-black text-lg mb-4">
            <Info size={20} /> خطوات تفعيل التنبيهات
          </h3>
          <ol className="space-y-3 text-sm font-bold opacity-90 list-decimal pr-4">
            <li>ابحث عن البوت في تيليجرام: <span className="bg-white/20 px-2 py-0.5 rounded select-all">ReferralSystemBot</span></li>
            <li>اضغط على زر <b>Start</b> لتفعيل البوت.</li>
            <li>للحصول على الـ ID الخاص بك، ارسل رسالة إلى بوت <a href="https://t.me/userinfobot" target="_blank" className="underline inline-flex items-center gap-1">@userinfobot <ExternalLink size={12}/></a></li>
            <li>انسخ الرقم الظاهر وضعه في الخانة أدناه.</li>
          </ol>
        </div>
        <div className="absolute -bottom-4 -left-4 opacity-10 rotate-12">
           <Send size={120} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-inner">
            <Send size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إشعارات التيليجرام</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 pr-1 uppercase tracking-widest">Chat ID (رقمي فقط)</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-center text-xl font-bold"
              placeholder="مثال: 58210339"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className={`py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 shadow-lg ${isSavingTelegram ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
              حفظ
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className={`py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 border-2 ${isTestingTelegram ? 'bg-slate-50 text-slate-300' : 'border-slate-100 text-slate-600 hover:bg-slate-50 active:scale-95'}`}
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={18} /> : <MessageSquareText size={18} />}
              اختبار
            </button>
          </div>
          {teleFeedback && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-[11px] font-black ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {teleFeedback.msg}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner ${browserNotificationStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <BellRing size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إشعارات المتصفح</h2>
        </div>
        <div className="space-y-4">
           {browserNotificationStatus === 'granted' ? (
             <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
               <CheckCircle className="text-green-500" size={20} />
               <span className="text-xs font-black text-green-800">الإشعارات مفعلة على هذا الجهاز</span>
             </div>
           ) : (
             <button onClick={requestBrowserPermission} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2">
                <Smartphone size={18} /> تفعيل تنبيهات الجهاز
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default Profile;