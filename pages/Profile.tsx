
import React, { useState } from 'react';
import { Staff } from '../types';
import { Lock, Save, Send } from 'lucide-react';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => void;
  onUpdateTelegram: (chatId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword, onUpdateTelegram }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telegramChatId, setTelegramChatId] = useState(currentUser.telegramChatId || '');

  const handleSubmitPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      alert('كلمة المرور يجب أن تكون 4 خانات على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('كلمتا المرور غير متطابقتين');
      return;
    }
    updateUserPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    alert('تم تغيير كلمة المرور بنجاح');
  };

  const handleUpdateTelegram = () => {
    onUpdateTelegram(telegramChatId);
    alert('تم تحديث معرف التيليجرام بنجاح');
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Send size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">إشعارات التيليجرام</h2>
          <p className="text-sm text-gray-500">استقبل إشعارات فورية عند وجود طلبات إحالة</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 leading-relaxed">
            <strong>طريقة التفعيل:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>افتح تطبيق التيليجرام.</li>
              <li>ابحث عن بوت <a href="https://t.me/userinfobot" target="_blank" className="font-bold underline">@userinfobot</a>.</li>
              <li>أرسل له أي رسالة وسيعطيك الـ <b>Id</b> الخاص بك.</li>
              <li>انسخ الرقم وضعه في الحقل أدناه.</li>
            </ol>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Telegram Chat ID</label>
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="مثال: 12345678"
            />
          </div>
          <button
            onClick={handleUpdateTelegram}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} /> حفظ معرف الإشعارات
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Lock size={20}/> تغيير كلمة المرور</h3>
        <form onSubmit={handleSubmitPass} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="****"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">تأكيد كلمة المرور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="****"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 transition font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} /> حفظ كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
