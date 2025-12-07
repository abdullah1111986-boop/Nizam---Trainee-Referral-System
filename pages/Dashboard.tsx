import React, { useMemo } from 'react';
import { Referral, ReferralStatus, CaseType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, FileText, CheckCircle, Clock, AlertTriangle, AlertOctagon, ArrowLeft } from 'lucide-react';

interface DashboardProps {
  referrals: Referral[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${color} text-white`}>
      {icon}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ referrals }) => {
  const stats = useMemo(() => {
    return {
      total: referrals.length,
      completed: referrals.filter(r => r.status === ReferralStatus.RESOLVED).length,
      pending: referrals.filter(r => r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.RETURNED_TO_HOD).length,
      withCounselor: referrals.filter(r => r.status === ReferralStatus.PENDING_COUNSELOR).length,
      affairs: referrals.filter(r => r.status === ReferralStatus.TO_STUDENT_AFFAIRS).length,
    };
  }, [referrals]);

  // Identify Repeat Offenders logic
  const repeatOffenders = useMemo(() => {
    const counts: Record<string, { name: string, count: number, latestDate: string }> = {};
    
    referrals.forEach(r => {
      if (!counts[r.trainingNumber]) {
        counts[r.trainingNumber] = { name: r.traineeName, count: 0, latestDate: r.date };
      }
      counts[r.trainingNumber].count += 1;
      if (new Date(r.date) > new Date(counts[r.trainingNumber].latestDate)) {
        counts[r.trainingNumber].latestDate = r.date;
      }
    });

    // Filter for those with 2 or more referrals
    return Object.values(counts).filter(item => item.count >= 2);
  }, [referrals]);

  const caseTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(CaseType).forEach(type => counts[type] = 0);
    
    referrals.forEach(r => {
      r.caseTypes.forEach(type => {
        if (counts[type] !== undefined) counts[type]++;
      });
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [referrals]);

  return (
    <div className="space-y-6 animate-fade-in no-print">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="إجمالي الإحالات" value={stats.total} icon={<FileText size={24} />} color="bg-blue-500" />
        <StatCard title="تم الحل والإغلاق" value={stats.completed} icon={<CheckCircle size={24} />} color="bg-green-500" />
        <StatCard title="لدى المرشد" value={stats.withCounselor} icon={<Users size={24} />} color="bg-purple-500" />
        <StatCard title="شؤون المتدربين" value={stats.affairs} icon={<AlertTriangle size={24} />} color="bg-red-500" />
      </div>

      {/* Repeat Offenders Alert Section */}
      {repeatOffenders.length > 0 && (
        <div className="bg-red-50 border-r-4 border-red-500 p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
            <AlertOctagon /> تنبيه: متدربون تجاوزوا حد المخالفات (تكرار)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repeatOffenders.map((offender, idx) => (
              <div key={idx} className="bg-white p-4 rounded shadow-sm border border-red-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{offender.name}</p>
                  <p className="text-xs text-gray-500">آخر إحالة: {new Date(offender.latestDate).toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                  {offender.count} مخالفات
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Case Types */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">أنواع الحالات المحالة</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {caseTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">آخر الإحالات</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {referrals.slice(0, 5).map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{referral.traineeName}</p>
                  <p className="text-xs text-gray-500">{referral.caseTypes.join(', ')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  referral.status === ReferralStatus.RESOLVED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {referral.status}
                </span>
              </div>
            ))}
            {referrals.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد إحالات مسجلة</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;