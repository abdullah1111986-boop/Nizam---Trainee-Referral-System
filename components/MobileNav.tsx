import React from 'react';
import { LayoutDashboard, FilePlus, FolderOpen } from 'lucide-react';
import { UserRole } from '../types';

interface MobileNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
  currentUserRole: UserRole;
  notificationCount: number;
}

const MobileNav: React.FC<MobileNavProps> = ({ activePage, setActivePage, currentUserRole, notificationCount }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: <LayoutDashboard size={24} />, 
      visible: currentUserRole === UserRole.HOD || currentUserRole === UserRole.COUNSELOR 
    },
    { id: 'new-referral', icon: <FilePlus size={24} />, visible: true },
    { 
      id: 'referrals', 
      icon: <FolderOpen size={24} />, 
      visible: true,
      badge: notificationCount
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {menuItems.filter(item => item.visible).map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={`relative p-3 rounded-full transition-colors ${
            activePage === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
          }`}
        >
          {item.icon}
          {item.badge && item.badge > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default MobileNav;