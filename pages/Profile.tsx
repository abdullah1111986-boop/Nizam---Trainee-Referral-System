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
      const testMsg = `✅ اختبار الربط الذكي من المتصفح\n👤 المستخدم: ${currentUser.name}\n🚀 تم تجاوز قيود الحماية بنجاح.`;
      
      // نستخدم الـ Beacon الآن
      await sendTelegramNotification(telegramChatId, testMsg);
      
      setTeleFeedback({ 
        type: 'success', 
        msg: 'تم إرسال الطلب عبر المتصفح. تحقق من وصول الرسالة لهاتفك الآن.' 
      });
    } catch (error: any) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ في المتصفح أثناء محاولة الإرسال.' });
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
    <div className="max-w-md mx-auto mt-10 space-y-6 pb-24 px-4 font-cairo">
      {/* قسم إرشادات التيليجرام */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-7 rounded-[2.5rem] shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="flex items-center gap-2 font-black text-lg mb-4">
            <Info size={22} /> تفعيل التنبيهات الفورية
          </h3>
          <ol className="space-y-4 text-sm font-bold opacity-90 list-decimal pr-4 leading-relaxed">
            <li>
              افتح محادثة البوت: 
              <a href="https://t.me/ReferralSystemBot" target="_blank" className="bg-white/20 px-3 py-1 rounded-full mr-2 hover:bg-white/30 transition-all inline-flex items-center gap-1">
                ReferralSystemBot <ExternalLink size={12}/>
              </a>
            </li>
            <li>اضغط <b>Start</b> أو ابدأ المحادثة.</li>
            <li>للحصول على معرفك، راسل البوت: <a href="https://t.me/userinfobot" target="_blank" className="font-black underline">@userinfobot</a></li>
            <li>ضع رقم المعرف (ID) في الخانة أدناه واضغط حفظ.</li>
          </ol>
        </div>
        <div className="absolute -bottom-6 -left-6 opacity-10 rotate-12">
           <Send size={150} />
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-inner">
            <Send size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إعدادات التيليجرام</h2>
          <p className="text-[10px] text-slate-400 font-black mt-1 uppercase">Smart Browser Beacon Integration</p>
        </div>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 pr-1">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/\D/g, ''))}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-center text-xl font-bold text-slate-700"
              placeholder="00000000"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className={`py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 shadow-lg ${isSavingTelegram ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 active:scale-95'}`}
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
            <div className={`flex items-center gap-2 p-4 rounded-2xl text-[11px] font-black border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={14} className="flex-shrink-0" /> : <AlertCircle size={14} className="flex-shrink-0" />}
              {teleFeedback.msg}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${browserNotificationStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <BellRing size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-black text-slate-900">تنبيهات المتصفح</h2>
            <p className="text-[10px] text-slate-400 font-bold">{browserNotificationStatus === 'granted' ? 'مفعلة على هذا الجهاز' : 'غير مفعلة حالياً'}</p>
          </div>
          {browserNotificationStatus !== 'granted' && (
            <button onClick={requestBrowserPermission} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-black active:scale-95 transition-all">
              تفعيل
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;