import React, { useState, useMemo } from 'react';
import { Referral, ReferralStatus, UserRole, Staff } from '../types';
import { Search, Edit, FileText, Printer, AlertOctagon, Trash2 } from 'lucide-react';

interface ReferralsListProps {
  referrals: Referral[];
  onEdit: (referral: Referral) => void;
  currentUser: Staff;
  onDelete: (id: string) => void;
}

const ReferralsList: React.FC<ReferralsListProps> = ({ referrals, onEdit, currentUser, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pre-calculate recurrence for all trainees
  const traineeReferralCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    referrals.forEach(r => {
      counts[r.trainingNumber] = (counts[r.trainingNumber] || 0) + 1;
    });
    return counts;
  }, [referrals]);

  // Filter Logic based on Role & Specialization
  let displayedReferrals = referrals;
  
  // 1. Filter by Search
  displayedReferrals = displayedReferrals.filter(r => 
    r.traineeName.includes(searchTerm) || 
    r.trainingNumber.includes(searchTerm)
  );

  // 2. Filter by Status
  if (statusFilter !== 'all') {
    displayedReferrals = displayedReferrals.filter(r => r.status === statusFilter);
  }

  // 3. Filter by Role/Permissions
  if (currentUser.role === UserRole.HOD) {
    if (currentUser.specialization) {
      displayedReferrals = displayedReferrals.filter(r => r.specialization === currentUser.specialization);
    }
  } else if (currentUser.role === UserRole.TRAINER) {
     if (currentUser.isCounselor) {
       displayedReferrals = displayedReferrals.filter(r => 
         r.trainerId === currentUser.id || 
         r.status === ReferralStatus.PENDING_COUNSELOR ||
         r.timeline.some(t => t.role === UserRole.COUNSELOR)
       );
     } else {
       displayedReferrals = displayedReferrals.filter(r => r.trainerId === currentUser.id);
     }
  } else if (currentUser.role === UserRole.COUNSELOR) {
       displayedReferrals = displayedReferrals.filter(r => 
         r.status === ReferralStatus.PENDING_COUNSELOR ||
         r.timeline.some(t => t.role === UserRole.COUNSELOR)
       );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteClick = (referral: Referral) => {
    // Permission Check
    const isHoD = currentUser.role === UserRole.HOD;
    const isOwner = referral.trainerId === currentUser.id;
    
    if (!isHoD && !isOwner) {
      alert("ليس لديك صلاحية لحذف هذا السجل.");
      return;
    }

    if (window.confirm(`هل أنت متأكد من حذف إحالة المتدرب: ${referral.traineeName}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
      onDelete(referral.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print gap-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 w-full md:w-auto">
          {currentUser.isCounselor ? 'مهام الإرشاد وحالاتي' : 'سجل الإحالات'}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
           <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full md:w-auto"
          >
            <option value="all">جميع الحالات</option>
            <option value={ReferralStatus.PENDING_HOD}>بانتظار رئيس القسم</option>
            <option value={ReferralStatus.PENDING_COUNSELOR}>بانتظار المرشد</option>
            <option value={ReferralStatus.RETURNED_TO_HOD}>عاد لرئيس القسم</option>
            <option value={ReferralStatus.RESOLVED}>مكتملة</option>
          </select>

          <div className="relative flex-1 md:w-64 w-full">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2 w-full md:w-auto">
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Print Header for List */}
      <div className="print-only mb-8 text-center border-b-2 border-black pb-4">
        <div className="flex justify-between items-start">
          <div className="text-right">
            <p className="font-bold text-lg">المملكة العربية السعودية</p>
            <p className="font-bold text-lg">المؤسسة العامة للتدريب التقني والمهني</p>
            <p className="font-bold text-lg">الكلية التقنية بالطائف - قسم التقنية الميكانيكية</p>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black mt-4">تقرير الإحالات</h1>
          </div>
          <div className="w-1/3"></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-0 print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px] md:min-w-0">
            <thead className="bg-gray-50 border-b border-gray-200 print:bg-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">المتدرب</th>
                <th className="p-4 text-sm font-semibold text-gray-600">الرقم التدريبي</th>
                <th className="p-4 text-sm font-semibold text-gray-600 hidden md:table-cell">القسم</th>
                <th className="p-4 text-sm font-semibold text-gray-600">التاريخ</th>
                <th className="p-4 text-sm font-semibold text-gray-600 hidden sm:table-cell">نوع الحالة</th>
                <th className="p-4 text-sm font-semibold text-gray-600">الحالة</th>
                <th className="p-4 text-sm font-semibold text-gray-600 no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50 transition print:break-inside-avoid">
                  <td className="p-4 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {referral.traineeName}
                      {traineeReferralCounts[referral.trainingNumber] > 1 && (
                        <span className="flex items-center text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap" title="متدرب متكرر المخالفات">
                          <AlertOctagon size={12} className="ml-1" />
                          متكرر
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-mono text-sm">{referral.trainingNumber}</td>
                   <td className="p-4 text-gray-600 text-sm hidden md:table-cell">{referral.specialization}</td>
                  <td className="p-4 text-gray-600 text-sm">{new Date(referral.date).toLocaleDateString('ar-SA')}</td>
                  <td className="p-4 text-gray-600 text-sm max-w-xs truncate hidden sm:table-cell">
                    {referral.caseTypes.join(', ')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      referral.status === ReferralStatus.RESOLVED 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : referral.status === ReferralStatus.PENDING_COUNSELOR 
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : referral.status === ReferralStatus.TO_STUDENT_AFFAIRS
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="p-4 no-print flex items-center gap-2">
                    <button 
                      onClick={() => onEdit(referral)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                      title="عرض / تعديل"
                    >
                      <Edit size={18} />
                    </button>
                    
                    {/* Delete Button - Only for HoD or Owner */}
                    {(currentUser.role === UserRole.HOD || referral.trainerId === currentUser.id) && (
                      <button 
                        onClick={() => handleDeleteClick(referral)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        title="حذف السجل"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {displayedReferrals.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <FileText size={48} className="mb-2 opacity-20" />
                      لا توجد بيانات مطابقة
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralsList;