import React, { useState } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => Promise<void>;
  onUpdateTelegram: (chatId: string) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword, onUpdateTelegram }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramChatId, setTelegramChatId] = useState(currentUser.telegramChatId || '');
  
  // حالات تتبع العمليات
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [teleFeedback, setTeleFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmitPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassFeedback(null);

    if (newPassword.length < 4) {
      setPassFeedback({ type: 'error', msg: 'كلمة المرور يجب أن تكون 4 خانات على الأقل' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassFeedback({ type: 'error', msg: 'كلمتا المرور غير متطابقتين' });
      return;
    }

    // إضافة خطوة تأكيد
    const confirmed = window.confirm('هل أنت متأكد من رغبتك في تغيير كلمة المرور؟ سيتم تسجيل خروجك عند الدخول القادم.');
    if (!confirmed) return;

    setIsSavingPass(true);
    try {
      await updateUserPassword(newPassword);
      setPassFeedback({ type: 'success', msg: 'تم تغيير كلمة المرور بنجاح' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPassFeedback({ type: 'error', msg: 'حدث خطأ أثناء التحديث، حاول مجدداً' });
    } finally {
      setIsSavingPass(false);
    }
  };

  const handleUpdateTelegram = async () => {
    setTeleFeedback(null);
    setIsSavingTelegram(true);
    try {
      await onUpdateTelegram(telegramChatId);
      setTeleFeedback({ type: 'success', msg: 'تم تحديث معرف التيليجرام بنجاح' });
    } catch (error) {
      setTeleFeedback({ type: 'error', msg: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6 pb-20">
      {/* قسم الإشعارات */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
            <Send size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إشعارات التيليجرام</h2>
          <p className="text-sm text-slate-400 font-bold mt-1">استقبل تنبيهات الإحالات فورياً</p>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-2xl text-[11px] text-slate-600 leading-relaxed font-bold border border-slate-100">
            <strong className="text-blue-600 block mb-2 text-xs">طريقة التفعيل:</strong>
            <ol className="list-decimal list-inside space-y-2">
              <li>افتح تطبيق التيليجرام.</li>
              <li>ابحث عن بوت <a href="https://t.me/userinfobot" target="_blank" className="text-blue-600 underline">@userinfobot</a>.</li>
              <li>أرسل له أي رسالة وسيعطيك الـ <b className="text-slate-900">Id</b> الخاص بك.</li>
              <li>انسخ الرقم وضعه في الحقل أدناه.</li>
            </ol>
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 pr-1 uppercase tracking-wider">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-center text-lg font-bold text-slate-800"
              placeholder="مثال: 12345678"
            />
          </div>

          <button
            onClick={handleUpdateTelegram}
            disabled={isSavingTelegram}
            className={`w-full py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
              isSavingTelegram ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            {isSavingTelegram ? 'جاري الحفظ...' : 'حفظ معرف الإشعارات'}
          </button>

          {teleFeedback && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold animate-fade-in ${
              teleFeedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {teleFeedback.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {teleFeedback.msg}
            </div>
          )}
        </div>
      </div>

      {/* قسم كلمة المرور */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
            <Lock size={20}/>
          </div>
          <h3 className="text-lg font-black text-slate-900">تغيير كلمة المرور</h3>
        </div>

        <form onSubmit={handleSubmitPass} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 pr-1 uppercase">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-mono tracking-widest text-center"
              placeholder="••••"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 pr-1 uppercase">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-mono tracking-widest text-center"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingPass}
            className={`w-full py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
              isSavingPass ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {isSavingPass ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            {isSavingPass ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
          </button>

          {passFeedback && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold animate-fade-in ${
              passFeedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {passFeedback.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {passFeedback.msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
