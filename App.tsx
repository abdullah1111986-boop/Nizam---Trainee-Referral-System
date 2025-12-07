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
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy, enableNetwork, disableNetwork } from 'firebase/firestore';

// Mock Initial Data (Kept for seeding)
const INITIAL_STAFF: Staff[] = [
  // Heads of Department
  { 
    id: 'hod1', 
    name: 'م. عبدالله الزهراني', 
    username: 'م. عبدالله الزهراني', 
    password: '0558882711', 
    role: UserRole.HOD, 
    specialization: 'محركات ومركبات' 
  },
  { 
    id: 'hod2', 
    name: 'م. ياسر الشربي', 
    username: 'م. ياسر الشربي', 
    password: '0505709078', 
    role: UserRole.HOD, 
    specialization: 'تصنيع' 
  },
  // Counselor
  {
    id: 'counselor1',
    name: 'ماجد ابراهيم المرزوقي',
    username: 'ماجد ابراهيم المرزوقي',
    password: '1234',
    role: UserRole.TRAINER,
    specialization: 'توجيه وإرشاد',
    isCounselor: true 
  },
  // Trainers (Batch 1)
  { id: 't1', name: 'عبدالله شباب البقمي', username: 'عبدالله شباب البقمي', password: '1234', role: UserRole.TRAINER },
  { id: 't2', name: 'مشعل طائل الشربي', username: 'مشعل طائل الشربي', password: '1234', role: UserRole.TRAINER },
  { id: 't3', name: 'عبدالله احمد الغامدي', username: 'عبدالله احمد الغامدي', password: '1234', role: UserRole.TRAINER },
  { id: 't4', name: 'تركي سليم الدعجاني', username: 'تركي سليم الدعجاني', password: '1234', role: UserRole.TRAINER },
  { id: 't5', name: 'سعد احمد الغامدي', username: 'سعد احمد الغامدي', password: '1234', role: UserRole.TRAINER },
  { id: 't6', name: 'سعود مساعد الهباد', username: 'سعود مساعد الهباد', password: '1234', role: UserRole.TRAINER },
  { id: 't7', name: 'تركي طلق العويمري', username: 'تركي طلق العويمري', password: '1234', role: UserRole.TRAINER },
  { id: 't8', name: 'بدر معيض المالكي', username: 'بدر معيض المالكي', password: '1234', role: UserRole.TRAINER },
  { id: 't9', name: 'صالح عبدالرحمن الغامدي', username: 'صالح عبدالرحمن الغامدي', password: '1234', role: UserRole.TRAINER },
  { id: 't10', name: 'عبدالرحمن محمد الطلحي', username: 'عبدالرحمن محمد الطلحي', password: '1234', role: UserRole.TRAINER },
  { id: 't11', name: 'صالح جارالله الغامدي', username: 'صالح جارالله الغامدي', password: '1234', role: UserRole.TRAINER },
  { id: 't12', name: 'عبدالله حسين الشربي', username: 'عبدالله حسين الشربي', password: '1234', role: UserRole.TRAINER },
  { id: 't13', name: 'رشيد مسعد النفيعي', username: 'رشيد مسعد النفيعي', password: '1234', role: UserRole.TRAINER },
  { id: 't14', name: 'سرور مطر العصيمي', username: 'سرور مطر العصيمي', password: '1234', role: UserRole.TRAINER },
  { id: 't15', name: 'عايش عايض الحارثي', username: 'عايش عايض الحارثي', password: '1234', role: UserRole.TRAINER },
  { id: 't16', name: 'سالم محمد الثبيتي', username: 'سالم محمد الثبيتي', password: '1234', role: UserRole.TRAINER },
  { id: 't17', name: 'احمد محمد مهنا', username: 'احمد محمد مهنا', password: '1234', role: UserRole.TRAINER },
  { id: 't18', name: 'سامي علي العبدلي', username: 'سامي علي العبدلي', password: '1234', role: UserRole.TRAINER },
  { id: 't19', name: 'خالد علي ناصر الحكمي', username: 'خالد علي ناصر الحكمي', password: '1234', role: UserRole.TRAINER },
  { id: 't20', name: 'بندر عبدالعزيز تركستاني', username: 'بندر عبدالعزيز تركستاني', password: '1234', role: UserRole.TRAINER },
  { id: 't21', name: 'فؤاد عباد الثمالي', username: 'فؤاد عباد الثمالي', password: '1234', role: UserRole.TRAINER },
  { id: 't22', name: 'سعيد محمد المالكي', username: 'سعيد محمد المالكي', password: '1234', role: UserRole.TRAINER },
  // Trainers (Batch 2 - Updated)
  { id: 't23', name: 'علي حمود الشمري', username: 'علي حمود الشمري', password: '1234', role: UserRole.TRAINER },
  { id: 't24', name: 'رياض ناصرالغامدي', username: 'رياض ناصرالغامدي', password: '1234', role: UserRole.TRAINER },
  { id: 't25', name: 'خالد عبدالله قدسي', username: 'خالد عبدالله قدسي', password: '1234', role: UserRole.TRAINER },
  { id: 't26', name: 'سالم عبدالله السفياني', username: 'سالم عبدالله السفياني', password: '1234', role: UserRole.TRAINER },
  { id: 't27', name: 'احمد غويزي العصيمي', username: 'احمد غويزي العصيمي', password: '1234', role: UserRole.TRAINER },
  { id: 't28', name: 'عبدالله عابد غندورة', username: 'عبدالله عابد غندورة', password: '1234', role: UserRole.TRAINER },
  { id: 't29', name: 'عمرو عبدالرحمن مؤذن', username: 'عمرو عبدالرحمن مؤذن', password: '1234', role: UserRole.TRAINER },
  { id: 't30', name: 'تركي عقيل الشمري', username: 'تركي عقيل الشمري', password: '1234', role: UserRole.TRAINER },
  { id: 't31', name: 'وليد عبدالله السواط', username: 'وليد عبدالله السواط', password: '1234', role: UserRole.TRAINER },
  { id: 't32', name: 'عادل سليم القثامي', username: 'عادل سليم القثامي', password: '1234', role: UserRole.TRAINER },
  { id: 't33', name: 'حمد محمد القاسم', username: 'حمد محمد القاسم', password: '1234', role: UserRole.TRAINER },
  { id: 't34', name: 'احمد سعيد المالكي', username: 'احمد سعيد المالكي', password: '1234', role: UserRole.TRAINER },
  { id: 't35', name: 'عبدالله دخيل الله الغامدي', username: 'عبدالله دخيل الله الغامدي', password: '1234', role: UserRole.TRAINER },
  { id: 't36', name: 'ايمن حامد الانصاري', username: 'ايمن حامد الانصاري', password: '1234', role: UserRole.TRAINER },
  { id: 't37', name: 'محمد حامد الغامدي', username: 'محمد حامد الغامدي', password: '1234', role: UserRole.TRAINER },
];

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  
  // Login Inputs
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Notification UI State
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Connection State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // App Data State
  const [activePage, setActivePage] = useState('dashboard');
  const [trainees, setTrainees] = useState<Trainee[]>([]); 
  const [staff, setStaff] = useState<Staff[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [editingReferral, setEditingReferral] = useState<Referral | undefined>(undefined);

  // Monitor Connection Status
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

  // --- Firebase Synchronization ---

  // 1. Sync Staff
  useEffect(() => {
    try {
      const staffRef = collection(db, 'staff');
      const unsubscribe = onSnapshot(staffRef, async (snapshot) => {
        if (snapshot.empty && navigator.onLine) {
          // Seed Initial Data if empty and online
          console.log("Seeding Initial Staff Data...");
          try {
            for (const s of INITIAL_STAFF) {
              await setDoc(doc(db, 'staff', s.id), s);
            }
          } catch (err) {
            console.error("Seeding failed:", err);
          }
        } else {
          const staffData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff));
          staffData.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
          setStaff(staffData);
          setIsLoading(false);
        }
      }, (error) => {
        console.error("Staff sync error:", error);
        setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase init error (Staff):", e);
      setIsLoading(false);
    }
  }, []);

  // 2. Sync Referrals
  useEffect(() => {
    try {
      const q = query(collection(db, 'referrals'), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const referralData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Referral));
        setReferrals(referralData);
      }, (error) => {
        console.error("Referrals sync error:", error);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase init error (Referrals):", e);
    }
  }, []);

  // --- Notification Logic ---
  const pendingReferrals = useMemo(() => {
    if (!currentUser) return [];

    let filtered: Referral[] = [];

    if (currentUser.role === UserRole.HOD) {
      filtered = referrals.filter(r => 
        (r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.RETURNED_TO_HOD) &&
        r.specialization === currentUser.specialization
      );
    } 
    else if (currentUser.isCounselor) {
      filtered = referrals.filter(r => r.status === ReferralStatus.PENDING_COUNSELOR);
    }
    
    return filtered;
  }, [referrals, currentUser]);

  const notificationCount = pendingReferrals.length;

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser) {
      setLoginError('الرجاء اختيار اسم المستخدم');
      return;
    }
    const user = staff.find(s => s.username === loginUser && s.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoginError('');
      
      if (user.role === UserRole.HOD || user.isCounselor) {
        setActivePage('dashboard');
      } else {
        setActivePage('new-referral');
      }
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

  const handleUpdatePassword = async (newPass: string) => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, 'staff', currentUser.id);
      await updateDoc(userRef, { password: newPass });
      setCurrentUser({ ...currentUser, password: newPass });
    } catch (e) {
      console.error("Error updating password: ", e);
      alert('حدث خطأ أثناء تحديث كلمة المرور');
    }
  };

  // Logic Handlers
  const handleUpdateReferral = async (referral: Referral) => {
    try {
      await setDoc(doc(db, 'referrals', referral.id), referral);
      setEditingReferral(undefined);
      setActivePage('referrals');
    } catch (e) {
      console.error("Error saving referral: ", e);
      alert("حدث خطأ أثناء حفظ الإحالة. الرجاء التحقق من الاتصال.");
    }
  };

  const handleDeleteReferral = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'referrals', id));
    } catch (e) {
      console.error("Error deleting referral", e);
      alert("حدث خطأ أثناء الحذف");
    }
  }

  const handleEditReferral = (referral: Referral) => {
    setEditingReferral(referral);
    setActivePage('new-referral');
    setShowNotifications(false);
  };

  const addStaffMember = async (newMember: Staff) => {
    await setDoc(doc(db, 'staff', newMember.id), newMember);
  };
  
  const updateStaffMember = async (updatedMember: Staff) => {
    await setDoc(doc(db, 'staff', updatedMember.id), updatedMember);
  };

  const deleteStaffMember = async (id: string) => {
    await deleteDoc(doc(db, 'staff', id));
  };


  // Render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-cairo p-4">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md relative overflow-hidden">
           {/* Connection Status (Login Screen) */}
           <div className="absolute top-4 left-4 flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              {isOnline ? (
                <Wifi size={16} className="text-green-600" />
              ) : (
                <WifiOff size={16} className="text-red-500" />
              )}
              <span className={`text-xs font-bold ${isOnline ? 'text-green-700' : 'text-red-600'}`}>
                {isOnline ? 'متصل' : 'غير متصل'}
              </span>
           </div>

           <div className="text-center mb-8 mt-4">
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-blue-200 shadow-lg">
               <Lock className="text-white" size={32} />
             </div>
             <h1 className="text-xl font-bold text-gray-800">نظام إحالة المتدربين</h1>
             <p className="text-gray-500 mt-2 text-sm">الكلية التقنية بالطائف - قسم التقنية الميكانيكية</p>
           </div>
           
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-gray-400">جاري الاتصال بقاعدة البيانات...</p>
             </div>
           ) : (
             <form onSubmit={handleLogin} className="space-y-6">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">اسم المستخدم</label>
                 <div className="relative">
                   <select
                     value={loginUser}
                     onChange={(e) => setLoginUser(e.target.value)}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white transition-shadow"
                   >
                     <option value="">اختر الاسم من القائمة...</option>
                     {staff.map(s => (
                       <option key={s.id} value={s.username}>{s.name} ({s.role === UserRole.HOD ? 'رئيس قسم' : (s.isCounselor ? 'مرشد تدريبي' : 'مدرب')})</option>
                     ))}
                   </select>
                   <ChevronDown className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" size={20} />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور</label>
                 <input
                   type="password"
                   value={loginPass}
                   onChange={(e) => setLoginPass(e.target.value)}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                   placeholder="****"
                 />
               </div>
               
               {loginError && (
                 <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-medium">
                   {loginError}
                 </div>
               )}
  
               <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
                 دخول
               </button>
             </form>
           )}
           
           <div className="mt-8 text-center border-t border-dashed pt-4">
             <p className="text-[10px] text-gray-400 mb-1">الإصدار 1.2.1 - السيرفر: Firebase</p>
             <p className="text-xs text-blue-500 font-semibold cursor-default">تطوير م. عبدالله الزهراني</p>
           </div>
        </div>
      </div>
    );
  }

  // Determine Effective Role for UI components
  const effectiveRole = currentUser?.isCounselor ? UserRole.COUNSELOR : (currentUser?.role || UserRole.TRAINER);

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activePage) {
      case 'dashboard':
        return <Dashboard referrals={referrals} />;
      case 'new-referral':
        return (
          <NewReferral
            trainees={trainees}
            staff={staff}
            currentUser={currentUser}
            onSubmit={handleUpdateReferral}
            onCancel={() => {
              setEditingReferral(undefined);
              setActivePage(effectiveRole === UserRole.TRAINER ? 'referrals' : 'dashboard');
            }}
            initialData={editingReferral}
          />
        );
      case 'referrals':
        return (
          <ReferralsList 
            referrals={referrals} 
            onEdit={handleEditReferral} 
            currentUser={currentUser}
            onDelete={handleDeleteReferral}
          />
        );
      case 'staff':
        if (currentUser.role !== UserRole.HOD) return <div className="p-8 text-center text-red-500">غير مصرح لك بالوصول</div>;
        return (
          <StaffManagement
            staff={staff}
            setStaff={(newDetails) => {
               newDetails.forEach(n => {
                 if (!staff.find(s => s.id === n.id)) addStaffMember(n);
               });
               newDetails.forEach(n => {
                 const old = staff.find(s => s.id === n.id);
                 if (old && JSON.stringify(old) !== JSON.stringify(n)) updateStaffMember(n);
               });
               staff.forEach(s => {
                 if (!newDetails.find(n => n.id === s.id)) deleteStaffMember(s.id);
               });
            }}
            currentUserSpecialization={currentUser.specialization}
          />
        );
      case 'profile':
        return (
          <Profile 
            currentUser={currentUser}
            updateUserPassword={handleUpdatePassword}
          />
        );
      default:
        return <Dashboard referrals={referrals} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-cairo">
      <Sidebar 
        activePage={activePage} 
        setActivePage={(page) => {
          if(page === 'new-referral') setEditingReferral(undefined);
          setActivePage(page);
        }} 
        currentUserRole={effectiveRole}
        onLogout={handleLogout}
        notificationCount={notificationCount}
      />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 flex flex-col w-full max-w-full">
        {/* Header */}
        <header className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between md:block">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                {activePage === 'dashboard' && 'لوحة المعلومات'}
                {activePage === 'new-referral' && (editingReferral ? 'متابعة الحالة / التعديل' : 'إحالة جديدة')}
                {activePage === 'referrals' && 'سجل الإحالات والمتابعة'}
                {activePage === 'staff' && 'إدارة المدربين'}
                {activePage === 'profile' && 'إعدادات الحساب'}
              </h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">الكلية التقنية بالطائف - قسم التقنية الميكانيكية</p>
            </div>
            {/* Mobile Connection Status (Explicit Icon) */}
            <div className="md:hidden flex items-center bg-white px-2 py-1 rounded-full shadow-sm border border-gray-100">
               {isOnline ? (
                 <Wifi size={16} className="text-green-600" />
               ) : (
                 <WifiOff size={16} className="text-red-500 animate-pulse" />
               )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 self-end md:self-auto">
            
            {/* Desktop Connection Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
               {isOnline ? <Wifi size={18} className="text-green-500"/> : <WifiOff size={18} className="text-red-500"/>}
               <span className={`text-xs font-bold ${isOnline ? 'text-green-700' : 'text-red-600'}`}>
                 {isOnline ? 'متصل بالسيرفر' : 'غير متصل'}
               </span>
            </div>

            {/* Notification Bell */}
            <div className="relative z-10">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-blue-600 transition"
              >
                <Bell size={24} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse border-2 border-white">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute left-0 rtl:left-auto rtl:right-0 md:rtl:left-0 mt-2 w-72 md:w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20">
                  <div className="p-3 border-b border-gray-100 font-bold text-gray-700 bg-gray-50 flex justify-between items-center">
                    <span>الإشعارات</span>
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{notificationCount}</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {pendingReferrals.length > 0 ? (
                      pendingReferrals.map((referral) => (
                        <div 
                          key={referral.id}
                          onClick={() => handleEditReferral(referral)}
                          className="p-3 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition flex flex-col gap-1"
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-sm text-gray-800">{referral.traineeName}</span>
                            <span className="text-[10px] text-gray-400">{new Date(referral.date).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                             <p className="text-xs text-blue-600 font-medium truncate">{referral.status}</p>
                             {referral.repetition === 'دائم التكرار' && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">متكرر</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-400 text-sm">
                        لا توجد إشعارات جديدة
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100 px-3">
              <UserCircle2 className="text-blue-600" />
              <div className="text-sm hidden md:block">
                <p className="font-bold text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500">
                  {currentUser?.role === UserRole.HOD ? `رئيس قسم - ${currentUser.specialization}` : currentUser?.role}
                  {currentUser?.isCounselor && ' (مشرف إرشاد)'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {renderContent()}
      </main>

      <MobileNav 
        activePage={activePage} 
        setActivePage={(page) => {
          if(page === 'new-referral') setEditingReferral(undefined);
          setActivePage(page);
        }} 
        currentUserRole={effectiveRole}
        notificationCount={notificationCount}
      />
    </div>
  );
};

export default App;