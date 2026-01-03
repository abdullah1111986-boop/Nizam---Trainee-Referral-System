import React, { useMemo } from 'react';
import { Referral, ReferralStatus, CaseType, UserRole } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Users, FileText, CheckCircle, AlertTriangle, TrendingUp, ArrowUpRight, Clock, Lightbulb, MousePointer2, Smartphone } from 'lucide-react';

interface DashboardProps {
  referrals: Referral[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; subtitle: string }> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex items-center text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase">
        <TrendingUp size={12} className="ml-1" /> مباشر
      </div>
    </div>
    <div>
      <h3 className="text-4xl font-black text-slate-900 mb-1 tracking-tighter">{value}</h3>
      <p className="text-slate-700 text-sm font-black">{title}</p>
      <p className="text-[10px] text-slate-400 mt-2 font-bold flex items-center gap-1 uppercase">
        <Clock size={10} /> {subtitle}
      </p>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ referrals }) => {
  const stats = useMemo(() => ({
    total: referrals.length,
    completed: referrals.filter(r => r.status === ReferralStatus.RESOLVED).length,
    pending: referrals.filter(r => r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.PENDING_COUNSELOR).length,
    critical: referrals.filter(r => r.status === ReferralStatus.TO_STUDENT_AFFAIRS).length,
  }), [referrals]);

  const chartData = useMemo(() => {
    const counts: any = {};
    referrals.forEach(r => r.caseTypes.forEach(t => counts[t] = (counts[t] || 0) + 1));
    return Object.entries(counts).map(([name, value]) => ({ name, value: value as number }));
  }, [referrals]);

  return (
    <div className="space-y-10 no-print max-w-7xl mx-auto font-cairo">
      
      {/* دليل المدرب السريع - المضافة حديثاً */}
      <div className="bg-white border border-blue-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
          <Lightbulb size={32} />
        </div>
        <div className="flex-1 text-center md:text-right">
          <h3 className="text-lg font-black text-slate-900 mb-2">مرحباً بك في نظام الإحالة الرقمي</h3>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">
            هذا التطبيق هو البديل الرقمي للنموذج الورقي (6). يمكنك الآن رفع حالات المتدربين، متابعة سيرها، والحصول على اقتراحات من الذكاء الاصطناعي لحل المشكلات بضغطة زر.
          </p>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px]">
              <MousePointer2 size={20} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase">رفع سهل</span>
           </div>
           <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px]">
              <Smartphone size={20} className="text-indigo-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase">تنبيهات فورية</span>
           </div>
           <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-w-[100px]">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase">متابعة دقيقة</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="إجمالي الحالات" value={stats.total} icon={<FileText size={26} />} color="bg-blue-500" subtitle="حالات القسم المسجلة" />
        <StatCard title="تم الحل والإغلاق" value={stats.completed} icon={<CheckCircle size={26} />} color="bg-green-500" subtitle="معاملات منتهية" />
        <StatCard title="قيد المتابعة" value={stats.pending} icon={<Users size={26} />} color="bg-amber-500" subtitle="بانتظار الإجراء" />
        <StatCard title="حالات حرجة" value={stats.critical} icon={<AlertTriangle size={26} />} color="bg-red-500" subtitle="محالة للإدارة العليا" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900">تحليل تصنيف المخالفات</h3>
              <p className="text-slate-400 text-xs mt-1 font-bold">إحصائيات توزيع الحالات حسب نوع المخالفة</p>
            </div>
          </div>
          <div className="h-[400px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={8} dataKey="value" animationDuration={1500}>
                    {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Cairo', fontWeight: 'bold' }} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontFamily: 'Cairo', fontWeight: 'bold', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 text-center">
                <FileText size={64} className="opacity-10" />
                <p className="font-bold">ابدأ برفع أول إحالة لتظهر الإحصائيات هنا</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-8">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-xl font-black text-slate-900">آخر التحديثات</h3>
          </div>
          <div className="space-y-8">
            {referrals.slice(0, 6).map((r) => (
              <div key={r.id} className="flex gap-5 items-start group cursor-pointer">
                <div className={`w-1.5 h-12 rounded-full flex-shrink-0 transition-all group-hover:h-14 ${r.status === ReferralStatus.RESOLVED ? 'bg-green-400' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors text-sm">{r.traineeName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{r.status}</span>
                  </div>
                </div>
              </div>
            ))}
            {referrals.length === 0 && <div className="text-center py-20 text-slate-300 font-bold text-sm italic">لا توجد أنشطة مؤخراً</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;