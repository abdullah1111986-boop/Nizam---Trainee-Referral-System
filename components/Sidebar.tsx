import React from 'react';
import { LayoutDashboard, FilePlus, FolderOpen, Users, Settings, LogOut } from 'lucide-react';
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
      case UserRole.COUNSELOR: return 'مهامي (الحالات)';
      default: return 'سجل الإحالات';
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'لوحة المعلومات', 
      icon: <LayoutDashboard size={20} />, 
      visible: currentUserRole === UserRole.HOD || currentUserRole === UserRole.COUNSELOR 
    },
    // Updated: Visible to everyone now
    { id: 'new-referral', label: 'إحالة جديدة', icon: <FilePlus size={20} />, visible: true }, 
    { 
      id: 'referrals', 
      label: getLabelForReferrals(), 
      icon: <FolderOpen size={20} />, 
      visible: true,
      badge: notificationCount > 0 ? notificationCount : undefined
    },
    { id: 'staff', label: 'إدارة المدربين', icon: <Users size={20} />, visible: currentUserRole === UserRole.HOD },
    { id: 'profile', label: 'الإعدادات', icon: <Settings size={20} />, visible: true },
  ];

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col shadow-lg hidden md:flex no-print">
      <div className="p-6 border-b border-slate-700 flex items-center justify-center">
        <div className="text-2xl font-bold text-center">
          <span className="text-blue-400">نِظام</span> إحالة
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.filter(item => item.visible).map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ${
              activePage === item.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 space-x-reverse px-4 py-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>تسجيل خروج</span>
        </button>
        <div className="mt-6 text-xs text-slate-500 text-center leading-relaxed">
          الكلية التقنية بالطائف
          <br/>
          قسم التقنية الميكانيكية
          <br/>
          <span className="text-blue-400 mt-2 block">تطوير م. عبدالله الزهراني</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;