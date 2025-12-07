import React, { useState } from 'react';
import { Staff, UserRole } from '../types';
import { UserPlus, RefreshCw, Trash2, ShieldCheck, Search } from 'lucide-react';

interface StaffManagementProps {
  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  currentUserSpecialization?: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ staff, setStaff, currentUserSpecialization }) => {
  const [newStaffName, setNewStaffName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter: HoDs only manage trainers in their specialization (optional logic, but good for large orgs)
  // For now, we allow HoD to see all trainers to assign Counselor easily.
  const displayedStaff = staff.filter(s => 
    s.role === UserRole.TRAINER && 
    (s.name.includes(searchTerm) || s.username.includes(searchTerm))
  );

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) {
      alert('الرجاء تعبئة اسم المدرب');
      return;
    }

    if (staff.some(s => s.name === newStaffName)) {
      alert('هذا الاسم مسجل مسبقاً');
      return;
    }

    const newTrainer: Staff = {
      id: Date.now().toString(),
      name: newStaffName,
      username: newStaffName, // Username matches Name for dropdown login
      password: '1234', // Default password
      role: UserRole.TRAINER,
      specialization: currentUserSpecialization, // Inherit department from HoD
      isCounselor: false
    };

    setStaff([...staff, newTrainer]);
    setNewStaffName('');
    alert(`تم إضافة المدرب بنجاح. كلمة المرور الافتراضية: 1234`);
  };

  const handleResetPassword = (id: string) => {
    if (confirm('هل أنت متأكد من إعادة تعيين كلمة المرور إلى "1234"؟')) {
      setStaff(staff.map(s => s.id === id ? { ...s, password: '1234' } : s));
      alert('تم إعادة تعيين كلمة المرور.');
    }
  };

  const toggleCounselorRole = (id: string) => {
    const target = staff.find(s => s.id === id);
    if (!target) return;

    const newStatus = !target.isCounselor;
    const msg = newStatus 
      ? `هل تريد تعيين ${target.name} مشرفاً للإرشاد والتوجيه؟` 
      : `هل تريد إلغاء صلاحية الإرشاد عن ${target.name}؟`;

    if (confirm(msg)) {
      setStaff(staff.map(s => s.id === id ? { ...s, isCounselor: newStatus } : s));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      setStaff(staff.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add New Trainer Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus size={20} /> إضافة مدرب جديد
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الثلاثي</label>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="مثال: محمد علي الاسمري"
                />
              </div>
              <div className="text-sm text-gray-500 bg-blue-50 p-2 rounded">
                سيظهر الاسم في قائمة الدخول.
                <br/>
                كلمة المرور الافتراضية: <strong>1234</strong>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-bold"
              >
                إضافة الحساب
              </button>
            </form>
          </div>
        </div>

        {/* Staff List */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">قائمة المدربين</h3>
              <div className="relative w-64">
                <Search className="absolute right-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="بحث بالاسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3">الاسم (اسم المستخدم)</th>
                    <th className="p-3">الصلاحيات</th>
                    <th className="p-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayedStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">
                        <button 
                          onClick={() => toggleCounselorRole(s.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded border transition ${
                            s.isCounselor 
                              ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <ShieldCheck size={14} />
                          {s.isCounselor ? 'مشرف إرشاد' : 'مدرب فقط'}
                        </button>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button 
                          onClick={() => handleResetPassword(s.id)}
                          className="text-orange-500 hover:bg-orange-50 p-2 rounded"
                          title="إعادة تعيين كلمة المرور"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded"
                          title="حذف"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayedStaff.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-400">لا يوجد مدربين مطابقين</td>
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