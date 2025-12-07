import React, { useState } from 'react';
import { Staff } from '../types';
import { Lock, Save } from 'lucide-react';

interface ProfileProps {
  currentUser: Staff;
  updateUserPassword: (password: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, updateUserPassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{currentUser.name}</h2>
          <p className="text-gray-500">{currentUser.role === 'رئيس القسم' ? currentUser.specialization : currentUser.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} /> حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;