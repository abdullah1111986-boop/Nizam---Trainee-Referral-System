import React, { useState } from 'react';
import { Staff, UserRole } from '../types';
import { UserPlus, RefreshCw, Trash2, ShieldCheck, Search, Send } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { hashPassword } from '../App';

interface StaffManagementProps {
  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  currentUserSpecialization?: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, currentUserSpecialization }) => {
  const [newStaffName, setNewStaffName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // بصمة مشفرة للرقم "1234" لاستخدامها ككلمة مرور افتراضية
  const DEFAULT_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    
    const newId = Date.now().toString();
    const newTrainer: Staff = {
      id: newId,
      name: newStaffName,
      username: newStaffName,
      password: DEFAULT_HASH, // حفظ البصمة المشفرة بدلاً من النص
      role: UserRole.TRAINER,
      specialization: currentUserSpecialization,
      isCounselor: false
    };
    
    await setDoc(doc(db, 'staff', newId), newTrainer);
    setNewStaffName('');
  };

  const handleResetPassword = async (id: string) => {
    if (confirm('هل أنت متأكد من إعادة تعيين كلمة المرور إلى "1234"؟ سيتم تخزينها بشكل مشفر للأمان.')) {
      await updateDoc(doc(db, 'staff', id), { password: DEFAULT_HASH });
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

  const displayedStaff = staff.filter(s => 
    s.role === UserRole.TRAINER && 
    (s.name.includes(searchTerm) || s.username.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-fade-in no-print">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" /> إضافة مدرب جديد
            </h3>
            <p className="text-[10px] text-slate-400 mb-4 font-bold leading-tight">سيتم إنشاء الحساب بكلمة مرور افتراضية "1234" مشفرة برمجياً.</p>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <input type="text" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} className="w-full p-3 border-2 border-slate-50 rounded-xl focus:border-blue-500 outline-none transition-all font-bold text-sm" placeholder="الاسم الثلاثي للمدرب" required />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">إضافة واعتماد</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-gray-800">إدارة صلاحيات المدربين</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                <input type="text" placeholder="بحث بالاسم..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-9 pl-4 py-2 bg-slate-50 border-transparent border-2 rounded-xl focus:border-blue-500 focus:bg-white transition-all text-sm outline-none font-bold" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-400">
                  <tr>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">المدرب</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">إشعارات التلجرام</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest">المستوى الصلاحي</th>
                    <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayedStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{s.name}</td>
                      <td className="p-4">
                        {s.telegramChatId ? 
                          <span className="inline-flex items-center text-green-600 gap-1 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-black"><Send size={10}/> مفعلة</span> : 
                          <span className="text-slate-300 text-[10px] font-bold">غير مرتبطة</span>
                        }
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleCounselorRole(s.id, !!s.isCounselor)} className={`text-[10px] px-3 py-1.5 rounded-lg border-2 font-black transition-all ${s.isCounselor ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600'}`}>
                          {s.isCounselor ? 'مشرف إرشاد' : 'مدرب تدريبي'}
                        </button>
                      </td>
                      <td className="p-4">
                         <div className="flex justify-center gap-3">
                            <button onClick={() => handleResetPassword(s.id)} title="إعادة تعيين كلمة المرور" className="p-2 text-orange-400 hover:bg-orange-50 rounded-lg transition-colors"><RefreshCw size={18} /></button>
                            <button onClick={() => handleDelete(s.id)} title="حذف الحساب" className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {displayedStaff.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-slate-300 font-bold italic">لا يوجد مدربون مطابقون للبحث</td>
                    </tr>
                  )}
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