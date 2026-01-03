import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send, Loader2, CheckCircle, AlertCircle, BellRing, Smartphone } from 'lucide-react';

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
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [teleFeedback, setTeleFeedback] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // حالة إشعارات المتصفح
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

  const testBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification("اختبار النظام", { 
        body: "هذا مثال لشكل الإشعار عند وصول إحالة جديدة.",
        icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
      });
    } else {
      alert("يرجى تفعيل الصلاحية أولاً.");
    }
  };

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
    const confirmed = window.confirm('هل أنت متأكد من تغيير كلمة المرور؟');
    if (!confirmed) return;
    setIsSavingPass(true);
    try {
      await updateUserPassword(newPassword);
      setPassFeedback({ type: 'success', msg: 'تم تغيير كلمة المرور بنجاح' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPassFeedback({ type: 'error', msg: 'حدث خطأ أثناء التحديث' });
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
    <div className="max-w-md mx-auto mt-10 space-y-6 pb-20 px-4">
      {/* قسم إشعارات المتصفح الجديد */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner ${browserNotificationStatus === 'granted' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <BellRing size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إشعارات المتصفح</h2>
          <p className="text-sm text-slate-400 font-bold mt-1">تنبيهات فورية على الجوال والكومبيوتر</p>
        </div>

        <div className="space-y-4">
           {browserNotificationStatus === 'granted' ? (
             <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
               <CheckCircle className="text-green-500" size={20} />
               <span className="text-xs font-black text-green-800">الإشعارات مفعلة على هذا الجهاز</span>
             </div>
           ) : browserNotificationStatus === 'denied' ? (
             <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
               <AlertCircle className="text-red-500" size={20} />
               <span className="text-xs font-black text-red-800">الإشعارات محظورة. يرجى تفعيلها من إعدادات المتصفح.</span>
             </div>
           ) : (
             <button
                onClick={requestBrowserPermission}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                <Smartphone size={18} /> تفعيل الإشعارات الآن
             </button>
           )}

           {browserNotificationStatus === 'granted' && (
             <button
               onClick={testBrowserNotification}
               className="w-full py-3 border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all"
             >
               إرسال إشعار تجريبي للجهاز
             </button>
           )}
        </div>
      </div>

      {/* قسم التيليجرام */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-inner">
            <Send size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">إشعارات التيليجرام</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 pr-1 uppercase tracking-wider">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-center text-lg font-bold"
              placeholder="مثال: 12345678"
            />
          </div>
          <button
            onClick={handleUpdateTelegram}
            disabled={isSavingTelegram}
            className={`w-full py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 shadow-lg ${isSavingTelegram ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
          >
            {isSavingTelegram ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            {isSavingTelegram ? 'جاري الحفظ...' : 'حفظ معرف التيليجرام'}
          </button>
          {teleFeedback && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${teleFeedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
          <h3 className="text-lg font-black text-slate-900">أمان الحساب</h3>
        </div>
        <form onSubmit={handleSubmitPass} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 pr-1 uppercase">كلمة المرور الجديدة</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-mono tracking-widest text-center" placeholder="••••" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 pr-1 uppercase">تأكيد كلمة المرور</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-slate-900 focus:bg-white outline-none transition-all font-mono tracking-widest text-center" placeholder="••••" />
          </div>
          <button type="submit" disabled={isSavingPass} className={`w-full py-4 rounded-2xl transition-all font-black flex items-center justify-center gap-2 shadow-xl ${isSavingPass ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'}`}>
            {isSavingPass ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} />}
            تحديث البيانات
          </button>
          {passFeedback && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${passFeedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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