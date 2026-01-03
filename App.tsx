import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import NewReferral from './pages/NewReferral';
import ReferralsList from './pages/ReferralsList';
import StaffManagement from './pages/StaffManagement';
import DataImport from './pages/DataImport';
import Profile from './pages/Profile';
import { Referral, Staff, UserRole, ReferralStatus, Trainee } from './types';
import { ShieldCheck, Lock, User, Bell, Loader2, LogIn, ChevronLeft, Code2 } from 'lucide-react';
import { db } from './services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { sendTelegramNotification, formatReferralMessage } from './services/telegramService';

/**
 * وظيفة أمنية لتوليد بصمة رقمية مشفرة لكلمة المرور (SHA-256)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// بصمة مشفرة لكلمة المرور الافتراضية "123"
const INITIAL_HASH = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";

const INITIAL_STAFF: Staff[] = [
  { id: 'hod1', name: 'م. عبدالله الزهراني', username: 'م. عبدالله Zahrani', password: INITIAL_HASH, role: UserRole.HOD, specialization: 'محركات ومركبات' },
  { id: 'hod2', name: 'م. ياسر الشربي', username: 'م. ياسر الشربي', password: INITIAL_HASH, role: UserRole.HOD, specialization: 'تصنيع' },
  { id: 'counselor1', name: 'ماجد ابراهيم المرزوقي', username: 'ماجد ابراهيم المرزوقي', password: INITIAL_HASH, role: UserRole.TRAINER, specialization: 'توجيه وإرشاد', isCounselor: true },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [editingReferral, setEditingReferral] = useState<Referral | undefined>(undefined);

  // طلب صلاحية الإشعارات عند التشغيل
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const staffRef = collection(db, 'staff');
      unsubscribe = onSnapshot(staffRef, async (snapshot) => {
        if (snapshot.empty && navigator.onLine) {
          for (const s of INITIAL_STAFF) { 
            await setDoc(doc(db, 'staff', s.id), s); 
          }
        } else {
          const staffData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff));
          staffData.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
          setStaff(staffData);
          setIsLoading(false);
        }
      }, (err) => { 
        console.error("Firestore Error (Staff):", err);
        if (staff.length === 0) setStaff(INITIAL_STAFF);
        setIsLoading(false);
      });
    } catch (e) {
      console.error("Firestore Setup Error (Staff):", e);
      setStaff(INITIAL_STAFF);
      setIsLoading(false);
    }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'referrals'), orderBy('date', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setReferrals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Referral)));
      }, (err) => console.warn("Firestore Error (Referrals):", err));
    } catch (e) {
      console.error("Firestore Setup Error (Referrals):", e);
    }
    return () => unsubscribe();
  }, []);

  const pendingCount = useMemo(() => {
    if (!currentUser) return 0;
    return referrals.filter(r => {
      if (currentUser.role === UserRole.HOD) {
        return (r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.RETURNED_TO_HOD) && r.specialization === currentUser.specialization;
      }
      if (currentUser.isCounselor) return r.status === ReferralStatus.PENDING_COUNSELOR;
      return false;
    }).length;
  }, [referrals, currentUser]);

  const effectiveRole = useMemo(() => {
    if (!currentUser) return UserRole.TRAINER;
    if (currentUser.role === UserRole.HOD) return UserRole.HOD;
    if (currentUser.isCounselor) return UserRole.COUNSELOR;
    return currentUser.role;
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const inputHash = await hashPassword(loginPass);
    const user = staff.find(s => s.username === loginUser);

    if (!user) {
      setLoginError('بيانات الدخول غير صحيحة');
      return;
    }

    if (user.password === inputHash || user.password === loginPass) {
      if (user.password === loginPass) {
        await updateDoc(doc(db, 'staff', user.id), { password: inputHash });
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActivePage(user.role === UserRole.HOD || user.isCounselor ? 'dashboard' : 'new-referral');
      
      if ("Notification" in window) {
        Notification.requestPermission();
      }
      return;
    }

    setLoginError('بيانات الدخول غير صحيحة');
  };

  const triggerNotifications = async (r: Referral) => {
    if (!currentUser || !staff.length) return;
    
    // إرسال الإشعارات في جميع الحالات المهمة
    const lastEvent = r.timeline[r.timeline.length - 1];
    const msg = formatReferralMessage(lastEvent.action, r.traineeName, r.status, currentUser.name, lastEvent.comment);
    
    // إشعار المتصفح
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("تنبيه نظام الإحالة", {
        body: `${lastEvent.action}: للمتدرب ${r.traineeName}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
        dir: 'rtl'
      });
    }

    // تحديد المستقبلين للتيليجرام
    let recipientsToNotify: Staff[] = [];
    
    // 1. دائماً نبلغ المدرب الأصلي الذي رفع الحالة بأي تحديث
    const originalTrainer = staff.find(s => s.id === r.trainerId);
    if (originalTrainer) recipientsToNotify.push(originalTrainer);
    
    // 2. إذا كانت الحالة بانتظار رئيس القسم، نبلغ رؤساء الأقسام في نفس التخصص
    if (r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.RETURNED_TO_HOD) {
      const HODs = staff.filter(s => s.role === UserRole.HOD && s.specialization === r.specialization);
      recipientsToNotify.push(...HODs);
    }
    
    // 3. إذا كانت محالة للمرشد، نبلغ جميع المرشدين
    if (r.status === ReferralStatus.PENDING_COUNSELOR) {
      const counselors = staff.filter(s => s.isCounselor);
      recipientsToNotify.push(...counselors);
    }

    // فلترة المكرر والتأكد من وجود Chat ID وعدم إرسال إشعار للشخص الذي قام بالفعل نفسه
    const uniqueRecipients = Array.from(new Set(recipientsToNotify.map(s => s.id)))
      .map(id => staff.find(s => s.id === id))
      .filter((s): s is Staff => !!s && !!s.telegramChatId && s.id !== currentUser.id);

    try {
      await Promise.all(uniqueRecipients.map(recipient => 
        sendTelegramNotification(recipient.telegramChatId!, msg)
      ));
    } catch (error) {
      console.error('Fast Notification Error:', error);
    }
  };

  const renderContent = () => {
    if (!currentUser) return null;
    const commonProps = { currentUser, staff, referrals };
    switch (activePage) {
      case 'dashboard': return <Dashboard referrals={referrals} />;
      case 'new-referral': 
        return <NewReferral {...commonProps} trainees={trainees} 
          onSubmit={async (r) => { 
            await setDoc(doc(db, 'referrals', r.id), r); 
            triggerNotifications(r).catch(e => console.error("Notification BG Error:", e));
            setEditingReferral(undefined);
            setActivePage('referrals'); 
          }} 
          onCancel={() => {
            setEditingReferral(undefined);
            setActivePage('dashboard');
          }} 
          initialData={editingReferral} 
        />;
      case 'referrals': 
        return <ReferralsList referrals={referrals} currentUser={currentUser} 
          onEdit={(r) => { setEditingReferral(r); setActivePage('new-referral'); }} 
          onDelete={async (id) => await deleteDoc(doc(db, 'referrals', id))} />;
      case 'staff': return <StaffManagement staff={staff} setStaff={() => {}} currentUserSpecialization={currentUser.specialization} />;
      case 'import': return <DataImport trainees={trainees} setTrainees={setTrainees} staff={staff} setStaff={() => {}} />;
      case 'profile': return <Profile currentUser={currentUser} 
        updateUserPassword={async (p) => {
          const hashed = await hashPassword(p);
          await updateDoc(doc(db, 'staff', currentUser.id), { password: hashed });
        }} 
        onUpdateTelegram={async (id) => await updateDoc(doc(db, 'staff', currentUser.id), { telegramChatId: id })} />;
      default: return <Dashboard referrals={referrals} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen login-bg flex flex-col items-center justify-center p-6 font-cairo">
        <div className="glass-card p-10 rounded-[2.5rem] w-full max-w-md fade-in-up">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-white/50">
              <ShieldCheck className="text-blue-500" size={52} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظام الإحالة الرقمي</h1>
            <p className="text-slate-500 mt-2 font-bold text-sm">الكلية التقنية بالطائف - التقنية الميكانيكية</p>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-400 font-bold text-center">جاري الاتصال بقاعدة البيانات السحابية...</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 pr-1">
                  <User size={16} className="text-blue-500" /> اختر هويتك الوظيفية
                </label>
                <div className="relative">
                  <select 
                    value={loginUser} 
                    onChange={(e) => setLoginUser(e.target.value)} 
                    className="w-full p-4 bg-white/50 border-2 border-slate-100 rounded-2xl appearance-none focus:border-blue-500 focus:bg-white outline-none text-sm transition-all font-bold text-slate-800 shadow-sm"
                    required
                  >
                    <option value="">اختر اسمك...</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.username}>
                        {s.name} ({s.isCounselor ? 'مرشد' : s.role})
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronLeft size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 flex items-center gap-2 pr-1">
                  <Lock size={16} className="text-blue-500" /> كلمة المرور
                </label>
                <input 
                  type="password" 
                  value={loginPass} 
                  onChange={(e) => setLoginPass(e.target.value)} 
                  className="w-full p-4 bg-white/50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono tracking-widest text-center text-lg shadow-sm"
                  placeholder="••••"
                  required
                />
              </div>

              {loginError && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl text-center border border-red-100 animate-pulse">{loginError}</div>}

              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group active:scale-[0.98]">
                <LogIn size={22} className="group-hover:-translate-x-1 transition-transform" />
                دخول آمن للنظام
              </button>
            </form>
          )}
          <div className="mt-12 text-center flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-inner">
                <Code2 size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">تطوير: م. عبدالله الزهراني</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-cairo overflow-hidden">
      <Sidebar 
        activePage={activePage} 
        setActivePage={(p) => { 
          if(p !== 'new-referral') setEditingReferral(undefined);
          setActivePage(p); 
        }} 
        currentUserRole={effectiveRole} 
        onLogout={() => setIsAuthenticated(false)} 
        notificationCount={pendingCount} 
      />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto pb-28 relative">
        <header className="mb-10 flex justify-between items-center no-print">
           <div className="flex items-center gap-4">
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                 {activePage.replace('-', ' ')}
               </h1>
               <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 <p className="text-slate-400 text-xs font-bold">{currentUser?.name}</p>
               </div>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="relative p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:text-blue-600 transition-all">
                <Bell size={22} />
                {pendingCount > 0 && <span className="absolute top-2.5 right-2.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>}
              </button>
              
              <div 
                className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 transition-all group" 
                onClick={() => setActivePage('profile')}
              >
                <div className="text-left hidden md:block">
                  <p className="font-black text-slate-800 text-sm leading-none">{currentUser?.name}</p>
                </div>
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <User size={22} />
                </div>
              </div>
           </div>
        </header>
        
        <div className="fade-in-up">
          {renderContent()}
        </div>
      </main>
      <MobileNav activePage={activePage} setActivePage={setActivePage} currentUserRole={effectiveRole} notificationCount={pendingCount} onLogout={() => setIsAuthenticated(false)} />
    </div>
  );
};

export default App;