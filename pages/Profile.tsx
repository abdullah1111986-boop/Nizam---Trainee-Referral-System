import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, Info, ShieldAlert, MessageCircle, Hash, Smartphone, HelpCircle, Activity, ExternalLink } from 'lucide-react';
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
    // فحص حالة البوت بمجرد دخول الصفحة
    checkBotStatus().then(res => {
      if (res.success) setBotHealth({status: 'ok', detail: res.message});
      else setBotHealth({status: 'error', detail: res.description});
    });

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ success: false, message: 'يرجى إدخال المعرف الرقمي أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);

    const testMsg = formatReferralMessage(
      'رسالة اختبار التشخيص', 
      'متدرب تجريبي', 
      'اختبار', 
      currentUser.name, 
      'هذه الرسالة لتأكيد نجاح الربط التقني.'
    );
    
    const result = await sendTelegramNotification(telegramChatId, testMsg);
    setTeleFeedback(result);
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    if (!telegramChatId) return;
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      alert('تم حفظ البيانات بنجاح.');
    } catch (error) {
      alert('فشل الاتصال بقاعدة البيانات.');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 space-y-6 pb-24 px-4 font-cairo">
      {/* حالة البوت - تشخيصي */}
      <div className={`p-4 rounded-2xl flex items-center justify-between border ${botHealth.status === 'ok' ? 'bg-green-50 border-green-100 text-green-700' : botHealth.status === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
        <div className="flex items-center gap-3">
          <Activity size={18} className={botHealth.status === 'checking' ? 'animate-pulse' : ''} />
          <span className="text-xs font-black">حالة اتصال البوت: {botHealth.status === 'checking' ? 'جاري الفحص...' : botHealth.status === 'ok' ? 'مستقر' : 'توجد مشكلة'}</span>
        </div>
        {botHealth.detail && <span className="text-[10px] opacity-70 font-bold">{botHealth.detail}</span>}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <h3 className="font-black text-lg flex items-center gap-2">
            <Smartphone size={24} /> ربط التيليجرام
          </h3>
          <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-[10px] bg-white/10 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-white/20">
            <ExternalLink size={12} /> معرفة الـ ID الخاص بي
          </a>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="relative group">
            <label className="block text-xs font-black text-slate-400 mb-3 pr-2 uppercase tracking-widest">Telegram Chat ID (أرقام فقط)</label>
            <input
              type="text"
              inputMode="numeric"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
              className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none text-center text-4xl font-black text-slate-800 transition-all shadow-inner"
              placeholder="مثلاً: 12345678"
            />
            {telegramChatId && !/^-?\d+$/.test(telegramChatId) && (
              <p className="text-red-500 text-[10px] font-black mt-2 text-center">يرجى إدخال أرقام فقط (بدون حروف أو رموز @)</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all shadow-xl"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ المعرف
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              فحص الربط الآن
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`p-6 rounded-3xl border animate-fade-in ${teleFeedback.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-xl bg-white shadow-sm ${teleFeedback.success ? 'text-green-500' : 'text-red-500'}`}>
                  {teleFeedback.success ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
                </div>
                <div className="flex-1">
                  <p className={`font-black text-sm mb-1 ${teleFeedback.success ? 'text-green-800' : 'text-red-800'}`}>
                    {teleFeedback.success ? 'تم الاتصال بنجاح!' : 'فشل التشخيص'}
                  </p>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">
                    {teleFeedback.message || teleFeedback.description}
                  </p>
                  
                  {!teleFeedback.success && teleFeedback.errorCode && (
                    <div className="mt-3 pt-3 border-t border-red-200/50 flex flex-col gap-1">
                      <span className="text-[10px] font-black text-red-400 uppercase">الرمز التقني: {teleFeedback.errorCode}</span>
                      <span className="text-[10px] font-mono text-slate-400 break-all">{teleFeedback.description}</span>
                    </div>
                  )}

                  {!teleFeedback.success && !teleFeedback.errorCode && (
                    <div className="mt-4 p-3 bg-white/50 rounded-xl border border-red-100">
                      <p className="text-[10px] text-red-700 font-black mb-2">💡 حلول مقترحة:</p>
                      <ul className="text-[10px] text-slate-500 space-y-1 font-bold">
                        <li>• افتح <a href={`https://t.me/ReferralSystemBot`} target="_blank" className="text-blue-600 underline">رابط البوت</a> واضغط Start.</li>
                        <li>• تأكد من أن الـ ID لا يحتوي على مسافات.</li>
                        <li>• إذا كنت تستخدم شبكة كلية، جرب استخدام بيانات الهاتف.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 flex gap-4">
          <Info className="text-amber-500 flex-shrink-0" size={24} />
          <div className="text-[11px] font-bold text-amber-700 leading-relaxed">
            ملاحظة: البوت لا يمكنه "البحث عنك". يجب أن تكون أنت من يبدأ المحادثة معه بإرسال أي رسالة، ثم سيتمكن النظام من التعرف عليك وإرسال الإشعارات.
          </div>
      </div>

      <div className="text-center pt-4">
        <button onClick={() => {
          const p = prompt('أدخل كلمة المرور الجديدة:');
          if (p) updateUserPassword(p).then(() => alert('تم التحديث'));
        }} className="text-slate-400 text-xs font-black flex items-center justify-center gap-2 mx-auto hover:text-slate-600">
          <Lock size={14} /> تغيير كلمة المرور
        </button>
      </div>
    </div>
  );
};

export default Profile;