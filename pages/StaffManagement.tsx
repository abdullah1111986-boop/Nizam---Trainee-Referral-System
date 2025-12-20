
import React, { useState } from 'react';
import { Staff, UserRole } from '../types';
import { UserPlus, RefreshCw, Trash2, ShieldCheck, Search, Send } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

interface StaffManagementProps {
  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  currentUserSpecialization?: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, currentUserSpecialization }) => {
  const [newStaffName, setNewStaffName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const displayedStaff = staff.filter(s => 
    s.role === UserRole.TRAINER && 
    (s.name.includes(searchTerm) || s.username.includes(searchTerm))
  );

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    const newId = Date.now().toString();
    const newTrainer: Staff = {
      id: newId,
      name: newStaffName,
      username: newStaffName,
      password: '1234',
      role: UserRole.TRAINER,
      specialization: currentUserSpecialization,
      isCounselor: false
    };
    await setDoc(doc(db, 'staff', newId), newTrainer);
    setNewStaffName('');
  };

  const handleResetPassword = async (id: string) => {
    if (confirm('هل أنت متأكد من إعادة تعيين كلمة المرور إلى "1234"؟')) {
      await updateDoc(doc(db, 'staff', id), { password: '1234' });
    }
  };

  const toggleCounselorRole = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'staff', id), { isCounselor: !currentStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      await deleteDoc(doc(db, 'staff', id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><UserPlus size={20} /> إضافة مدرب جديد</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="الاسم الثلاثي" />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">إضافة</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">قائمة المدربين</h3>
              <div className="relative w-64">
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} /><input type="text" placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-9 pl-4 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">الإشعارات</th>
                    <th className="p-3">الصلاحية</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">
                        {s.telegramChatId ? <span className="flex items-center text-green-600 gap-1 text-[10px]"><Send size={10}/> مفعلة</span> : <span className="text-gray-400 text-[10px]">غير مفعلة</span>}
                      </td>
                      <td className="p-3">
                        <button onClick={() => toggleCounselorRole(s.id, !!s.isCounselor)} className={`text-[10px] px-2 py-1 rounded border ${s.isCounselor ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>{s.isCounselor ? 'مشرف إرشاد' : 'مدرب'}</button>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button onClick={() => handleResetPassword(s.id)} className="text-orange-500"><RefreshCw size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
