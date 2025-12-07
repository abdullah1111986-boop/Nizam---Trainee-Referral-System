import React from 'react';
import { LayoutDashboard, FilePlus, FolderOpen, Settings, LogOut } from 'lucide-react';
import { UserRole } from '../types';

interface MobileNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUserRole: UserRole;
  notificationCount: number;
  onLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activePage, setActivePage, currentUserRole, notificationCount, onLogout }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: <LayoutDashboard size={20} />, 
      label: 'الرئيسية',
      visible: currentUserRole === UserRole.HOD || currentUserRole === UserRole.COUNSELOR 
    },
    { id: 'new-referral', icon: <FilePlus size={20} />, label: 'جديد', visible: true },
    { 
      id: 'referrals', 
      icon: <FolderOpen size={20} />, 
      label: 'السجل',
      visible: true,
      badge: notificationCount
    },
    { id: 'profile', icon: <Settings size={20} />, label: 'إعدادات', visible: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 py-1 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {menuItems.filter(item => item.visible).map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={`relative p-2 flex flex-col items-center justify-center w-full transition-colors rounded-lg ${
            activePage === item.id ? 'text-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
          }`}
        >
          <div className="p-0.5">
             {item.icon}
          </div>
          <span className="text-[10px] font-bold mt-1">{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white min-w-[18px] text-center shadow-sm">
              {item.badge}
            </span>
          )}
        </button>
      ))}
      
      {/* Explicit Logout Button */}
      <button
        onClick={onLogout}
        className="relative p-2 flex flex-col items-center justify-center w-full text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg active:bg-red-50"
      >
        <div className="p-0.5">
          <LogOut size={20} />
        </div>
        <span className="text-[10px] font-bold mt-1">خروج</span>
      </button>
    </div>
  );
};

export default MobileNav;