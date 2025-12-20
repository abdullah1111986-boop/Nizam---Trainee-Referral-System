
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import NewReferral from './pages/NewReferral';
import ReferralsList from './pages/ReferralsList';
import StaffManagement from './pages/StaffManagement';
import Profile from './pages/Profile';
import { Referral, Trainee, Staff, UserRole, ReferralStatus } from './types';
import { UserCircle2, Lock, ChevronDown, Bell, Loader2, Wifi, WifiOff } from 'lucide-react';
import { db } from './services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { sendTelegramNotification, formatReferralMessage } from './services/telegramService';

const INITIAL_STAFF: Staff[] = [
  { id: 'hod1', name: 'م. عبدالله الزهراني', username: 'م. عبدالله الزهراني', password: '0558882711', role: UserRole.HOD, specialization: 'محركات ومركبات' },
  { id: 'hod2', name: 'م. ياسر الشربي', username: 'م. ياسر الشربي', password: '0505709078', role: UserRole.HOD, specialization: 'تصنيع' },
  { id: 'counselor1', name: 'ماجد ابراهيم المرزوقي', username: 'ماجد ابراهيم المرزوقي', password: '1234', role: UserRole.TRAINER, specialization: 'توجيه وإرشاد', isCounselor: true },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activePage, setActivePage] = useState('dashboard');
  const [trainees, setTrainees] = useState<Trainee[]>([]); 
  const [staff, setStaff] = useState<Staff[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [editingReferral, setEditingReferral] = useState<Referral | undefined>(undefined);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const staffRef = collection(db, 'staff');
    const unsubscribe = onSnapshot(staffRef, async (snapshot) => {
      if (snapshot.empty && navigator.onLine) {
        for (const s of INITIAL_STAFF) {
          await setDoc(doc(db, 'staff', s.id), s);
        }
      } else {
        const staffData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff));
        staffData.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        setStaff(staffData);
        setIsLoading(false);
        // Sync current user if updated
        if (currentUser) {
          const updatedSelf = staffData.find(s => s.id === currentUser.id);
          if (updatedSelf) setCurrentUser(updatedSelf);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'referrals'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const referralData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Referral));
      setReferrals(referralData);
    });
    return () => unsubscribe();
  }, []);

  const pendingReferrals = useMemo(() => {
    if (!currentUser) return [];
    let filtered: Referral[] = [];
    if (currentUser.role === UserRole.HOD) {
      filtered = referrals.filter(r => 
        (r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.RETURNED_TO_HOD || r.status === ReferralStatus.PENDING_COUNSELOR) &&
        (r.specialization === currentUser.specialization || r.status === ReferralStatus.PENDING_COUNSELOR)
      );
    } else if (currentUser.isCounselor || currentUser.role === UserRole.COUNSELOR) {
      filtered = referrals.filter(r => r.status === ReferralStatus.PENDING_COUNSELOR);
    }
    return filtered;
  }, [referrals, currentUser]);

  const notificationCount = pendingReferrals.length;

  const handleUpdateReferral = async (referral: Referral) => {
    try {
      await setDoc(doc(db, 'referrals', referral.id), referral);
      
      // Handle Telegram Notifications
      const lastEvent = referral.timeline[referral.timeline.length - 1];
      let targetStaff: Staff[] = [];

      if (referral.status === ReferralStatus.PENDING_HOD || referral.status === ReferralStatus.RETURNED_TO_HOD) {
        // Find HOD of the specialization
        targetStaff = staff.filter(s => s.role === UserRole.HOD && s.specialization === referral.specialization);
      } else if (referral.status === ReferralStatus.PENDING_COUNSELOR) {
        // Find all Counselors
        targetStaff = staff.filter(s => s.isCounselor || s.role === UserRole.COUNSELOR);
      }

      const notificationBody = formatReferralMessage(
        lastEvent.action,
        referral.traineeName,
        referral.status,
        currentUser?.name || 'النظام',
        lastEvent.comment
      );

      targetStaff.forEach(s => {
        if (s.telegramChatId) {
          sendTelegramNotification(s.telegramChatId, notificationBody);
        }
      });

      setEditingReferral(undefined);
      setActivePage('referrals');
    } catch (e) {
      console.error("Error saving referral: ", e);
      alert("حدث خطأ أثناء حفظ الإحالة. الرجاء التحقق من الاتصال.");
    }
  };

  const handleUpdateProfile = async (updates: Partial<Staff>) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'staff', currentUser.id);
      await updateDoc(userRef, updates);
      setCurrentUser({ ...currentUser, ...updates });
    } catch (e) {
      console.error("Error updating profile: ", e);
      alert('حدث خطأ أثناء التحديث');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = staff.find(s => s.username === loginUser && s.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoginError('');
      setActivePage(user.role === UserRole.HOD || user.isCounselor ? 'dashboard' : 'new-referral');
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginUser('');
    setLoginPass('');
    setShowNotifications(false);
  };

  const effectiveRole = currentUser?.isCounselor ? UserRole.COUNSELOR : (currentUser?.role || UserRole.TRAINER);

  const renderContent = () => {
    if (!currentUser) return null;
    switch (activePage) {
      case 'dashboard': return <Dashboard referrals={referrals} />;
      case 'new-referral':
        return <NewReferral trainees={trainees} staff={staff} currentUser={currentUser} onSubmit={handleUpdateReferral}
            onCancel={() => { setEditingReferral(undefined); setActivePage(effectiveRole === UserRole.TRAINER ? 'referrals' : 'dashboard'); }}
            initialData={editingReferral} />;
      case 'referrals':
        return <ReferralsList referrals={referrals} onEdit={(r) => { setEditingReferral(r); setActivePage('new-referral'); }} currentUser={currentUser} onDelete={async (id) => await deleteDoc(doc(db, 'referrals', id))} />;
      case 'staff':
        return <StaffManagement staff={staff} setStaff={async (newStaff) => {}} currentUserSpecialization={currentUser.specialization} />;
      case 'profile': return <Profile currentUser={currentUser} updateUserPassword={(p) => handleUpdateProfile({password: p})} onUpdateTelegram={(cid) => handleUpdateProfile({telegramChatId: cid})} />;
      default: return <Dashboard referrals={referrals} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-cairo p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"><Lock className="text-white" size={32} /></div>
             <h1 className="text-xl font-bold text-gray-800">نظام إحالة المتدربين</h1>
           </div>
           {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div> : (
             <form onSubmit={handleLogin} className="space-y-6">
               <select value={loginUser} onChange={(e) => setLoginUser(e.target.value)} className="w-full p-3 border rounded-lg appearance-none bg-white">
                 <option value="">اختر الاسم من القائمة...</option>
                 {staff.map(s => <option key={s.id} value={s.username}>{s.name}</option>)}
               </select>
               <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="كلمة المرور" />
               {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}
               <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">دخول</button>
             </form>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-cairo">
      <Sidebar activePage={activePage} setActivePage={(page) => { if(page === 'new-referral') setEditingReferral(undefined); setActivePage(page); }} 
        currentUserRole={effectiveRole} onLogout={handleLogout} notificationCount={notificationCount} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 flex flex-col w-full max-w-full">
        <header className="mb-6 flex justify-between items-center">
           <div>
             <h1 className="text-xl font-bold text-gray-800">
               {activePage === 'dashboard' ? 'لوحة المعلومات' : activePage === 'new-referral' ? 'إحالة جديدة' : activePage === 'referrals' ? 'سجل الإحالات' : activePage === 'staff' ? 'إدارة المدربين' : 'الملف الشخصي'}
             </h1>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 bg-white rounded-xl shadow-sm border text-gray-600">
                <Bell size={24} />
                {notificationCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{notificationCount}</span>}
              </button>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border px-3 cursor-pointer" onClick={() => setActivePage('profile')}>
                <UserCircle2 className="text-blue-600" />
                <div className="text-sm hidden md:block text-right">
                  <p className="font-bold text-gray-800">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{effectiveRole}</p>
                </div>
              </div>
           </div>
        </header>
        {renderContent()}
      </main>
      <MobileNav activePage={activePage} setActivePage={(page) => { if(page === 'new-referral') setEditingReferral(undefined); setActivePage(page); }} currentUserRole={effectiveRole} notificationCount={notificationCount} onLogout={handleLogout} />
    </div>
  );
};

export default App;
