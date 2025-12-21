
import React from 'react';
import { LayoutDashboard, FilePlus, FolderOpen, Users, Settings, LogOut, ChevronRight, Code2, Database } from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUserRole: UserRole;
  onLogout: () => void;
  notificationCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, currentUserRole, onLogout, notificationCount }) => {
  
  const getLabelForReferrals = () => {
    switch (currentUserRole) {
      case UserRole.TRAINER: return 'حالاتي المرفوعة';
      case UserRole.COUNSELOR: return 'صندوق الوارد';
      default: return 'سجل الإحالات';
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'الرئيسية', 
      icon: <LayoutDashboard size={22} />, 
      visible: currentUserRole === UserRole.HOD || currentUserRole === UserRole.COUNSELOR 
    },
    { id: 'new-referral', label: 'إحالة جديدة', icon: <FilePlus size={22} />, visible: true }, 
    { 
      id: 'referrals', 
      label: getLabelForReferrals(), 
      icon: <FolderOpen size={22} />, 
      visible: true,
      badge: notificationCount > 0 ? notificationCount : undefined
    },
    { id: 'import', label: 'استيراد البيانات', icon: <Database size={22} />, visible: currentUserRole === UserRole.HOD },
    { id: 'staff', label: 'إدارة المدربين', icon: <Users size={22} />, visible: currentUserRole === UserRole.HOD },
    { id: 'profile', label: 'الإعدادات', icon: <Settings size={22} />, visible: true },
  ];

  return (
    <div className="w-72 bg-slate-900 text-white min-h-screen flex flex-col shadow-2xl hidden md:flex no-print border-l border-white/5 relative">
      <div className="p-10 border-b border-white/5 flex flex-col items-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
          <span className="text-2xl font-black">N</span>
        </div>
        <div className="text-xl font-black text-center tracking-tight">
          نظام <span className="text-blue-500 italic">الإحالة</span>
        </div>
        <div className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest opacity-60">Digital Control Panel</div>
      </div>
      
      <nav className="flex-1 p-6 space-y-3">
        {menuItems.filter(item => item.visible).map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${
              activePage === item.id
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`${activePage === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`}>
                {item.icon}
              </span>
              <span className="font-bold text-[14px]">{item.label}</span>
            </div>
            {item.badge ? (
              <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md animate-pulse">
                {item.badge}
              </span>
            ) : (
              activePage === item.id && <ChevronRight size={16} className="opacity-40" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5 bg-slate-950/30">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-400/10 rounded-2xl transition-all font-black text-sm active:scale-95"
        >
          <LogOut size={20} />
          <span>خروج آمن</span>
        </button>
        
        <div className="mt-8 pt-8 border-t border-white/5 text-center space-y-3">
          <div className="flex flex-col items-center gap-2 bg-slate-800/50 py-3 px-2 rounded-2xl border border-white/5">
             <Code2 size={16} className="text-blue-400" />
             <span className="text-[11px] font-black text-slate-300 tracking-tight">تطوير: م. عبدالله الزهراني</span>
          </div>
          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
            الكلية التقنية بالطائف © 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
