import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, BellRing, Info, ShieldAlert, MessageCircle, Hash, Smartphone, HelpCircle } from 'lucide-react';
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

  // اطلب إذن الإشعارات من المتصفح عند دخول الصفحة
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleTestTelegram = async () => {
    if (!telegramChatId) {
      setTeleFeedback({ type: 'error', msg: 'يرجى إدخال المعرف (Chat ID) أولاً' });
      return;
    }
    setIsTestingTelegram(true);
    setTeleFeedback(null);

    const testMsg = formatReferralMessage(
      'رسالة اختبار الربط', 
      'متدرب افتراضي', 
      'تحت المعالجة', 
      currentUser.name, 
      'تم التحقق من ربط حسابك بنظام الإحالة الرقمي بنجاح. ستصلك الإشعارات هنا فوراً.'
    );
    
    const success = await sendTelegramNotification(telegramChatId, testMsg);
    
    if (success) {
      setTeleFeedback({ type: 'success', msg: 'رائع! تم إرسال رسالة الاختبار، تحقق من تيليجرام.' });
    } else {
      setTeleFeedback({ type: 'error', msg: 'فشل الإرسال. تأكد من تفعيل البوت (@ReferralSystemBot) أولاً.' });
    }
    setIsTestingTelegram(false);
  };

  const handleUpdateTelegram = async () => {
    if (!telegramChatId) return;
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم حفظ المعرف بنجاح وتحديث بيانات ملفك الشخصي.' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء حفظ البيانات في قاعدة البيانات.' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 space-y-6 pb-24 px-4 font-cairo">
      {/* قسم التعليمات - الدليل الكامل */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
          <h3 className="font-black text-lg flex items-center gap-2">
            <HelpCircle size={24} /> كيف تفعل الإشعارات؟
          </h3>
          <Smartphone size={24} className="opacity-50" />
        </div>
        
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto font-black shadow-sm">1</div>
              <p className="font-black text-xs text-slate-800">تفعيل البوت</p>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">ابحث عن <span className="text-blue-600">@ReferralSystemBot</span> في تيليجرام وأرسل له كلمة <span className="bg-slate-100 px-1 rounded">/start</span></p>
            </div>
            
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto font-black shadow-sm">2</div>
              <p className="font-black text-xs text-slate-800">استخراج الـ ID</p>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">ابحث عن بوت <span className="text-blue-600">@userinfobot</span> وأرسل له أي رسالة وسيعطيك رقم (Id) الخاص بك.</p>
            </div>

            <div className="space-y-3 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto font-black shadow-sm">3</div>
              <p className="font-black text-xs text-slate-800">الربط النهائي</p>
              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">ضع الرقم في خانة (Telegram ID) بالأسفل واضغط على زر الحفظ.</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-50 flex justify-center">
            <a href="https://t.me/ReferralSystemBot" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-black text-xs hover:underline">
              <MessageCircle size={18} /> فتح رابط البوت المباشر
            </a>
          </div>
        </div>
      </div>

      {/* نموذج الإدخال */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
            <Hash size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">إعدادات الربط</h2>
        </div>
        
        <div className="space-y-6">
          <div className="relative group">
            <label className="block text-xs font-black text-slate-400 mb-3 pr-2 uppercase tracking-widest">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value.replace(/[^\d-]/g, ''))}
              className="w-full p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:border-blue-500 focus:bg-white outline-none text-center text-3xl font-black text-slate-700 transition-all shadow-inner"
              placeholder="00000000"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleUpdateTelegram}
              disabled={isSavingTelegram}
              className="py-5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all shadow-xl"
            >
              {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              حفظ الإعدادات
            </button>
            <button
              onClick={handleTestTelegram}
              disabled={isTestingTelegram || !telegramChatId}
              className="py-5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95 transition-all"
            >
              {isTestingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              إرسال اختبار
            </button>
          </div>
          
          {teleFeedback && (
            <div className={`flex items-start gap-4 p-5 rounded-3xl text-sm font-bold border animate-fade-in ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
               <div className="bg-white p-2 rounded-xl">
                {teleFeedback.type === 'success' ? <CheckCircle size={20} className="text-green-500" /> : <ShieldAlert size={20} className="text-red-500" />}
               </div>
               <div className="pt-1">{teleFeedback.msg}</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 flex gap-4">
          <Info className="text-amber-500 flex-shrink-0" size={24} />
          <div>
            <h4 className="font-black text-amber-900 text-sm mb-1">لماذا لا تصلني الإشعارات؟</h4>
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
              تأكد من أنك قمت بالضغط على "Start" داخل البوت أولاً، حيث لا يمكن للبوت إرسال رسائل لأي مستخدم لم يقم ببدء المحادثة معه لدواعي الخصوصية.
            </p>
          </div>
      </div>

      <div className="pt-4 text-center">
           <button 
              onClick={() => {
                const p = prompt('أدخل كلمة المرور الجديدة:');
                if (p) updateUserPassword(p).then(() => alert('تم التحديث بنجاح.'));
              }}
              className="text-slate-400 hover:text-slate-600 font-black text-xs flex items-center justify-center gap-2 mx-auto"
           >
             <Lock size={16} /> تغيير كلمة المرور الشخصية
           </button>
      </div>
    </div>
  );
};

export default Profile;