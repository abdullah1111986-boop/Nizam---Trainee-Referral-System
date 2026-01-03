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

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

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

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const staffRef = collection(db, 'staff');
      unsubscribe = onSnapshot(staffRef, async (snapshot) => {
        if (snapshot.empty && navigator.onLine) {
          for (const s of INITIAL_STAFF) { await setDoc(doc(db, 'staff', s.id), s); }
        } else {
          const staffData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Staff));
          staffData.sort((a, b) => {
            if (a.role === UserRole.HOD && b.role !== UserRole.HOD) return -1;
            if (a.role !== UserRole.HOD && b.role === UserRole.HOD) return 1;
            return a.name.localeCompare(b.name, 'ar');
          });
          setStaff(staffData);
          setIsLoading(false);
        }
      }, () => setIsLoading(false));
    } catch (e) { setIsLoading(false); }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'referrals'), orderBy('date', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        setReferrals(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Referral)));
      });
    } catch (e) { console.error(e); }
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
    const inputHash = await hashPassword(loginPass);
    const user = staff.find(s => s.username === loginUser);
    if (user && (user.password === inputHash || user.password === loginPass)) {
      if (user.password === loginPass) await updateDoc(doc(db, 'staff', user.id), { password: inputHash });
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActivePage(user.role === UserRole.HOD || user.isCounselor ? 'dashboard' : 'new-referral');
    } else {
      setLoginError('بيانات الدخول غير صحيحة');
    }
  };

  /**
   * إطلاق الإشعارات فور تأكيد نجاح عملية الحفظ في Firebase
   */
  const triggerNotifications = async (r: Referral) => {
    if (!currentUser || !staff.length) return;
    
    const lastEvent = r.timeline[r.timeline.length - 1];
    const htmlMessage = formatReferralMessage(lastEvent.action, r.traineeName, r.status, currentUser.name, lastEvent.comment);
    
    // 1. إشعار المتصفح المحلي (إذا كان مفعلاً)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("تحديث إحالة", { 
        body: `${r.traineeName}: ${lastEvent.action}`, 
        icon: '/favicon.ico',
        dir: 'rtl' 
      });
    }

    // 2. تصفية المستهدفين بالإشعار
    let potentialRecipients: Staff[] = [];
    
    // المدرب صاحب الحالة يصله إشعار دائماً عن أي تحديث
    const trainer = staff.find(s => s.id === r.trainerId);
    if (trainer) potentialRecipients.push(trainer);

    // إذا كانت بانتظار رئيس القسم
    if (r.status === ReferralStatus.PENDING_HOD || r.status === ReferralStatus.RETURNED_TO_HOD) {
      const hods = staff.filter(s => s.role === UserRole.HOD && s.specialization === r.specialization);
      potentialRecipients.push(...hods);
    }

    // إذا كانت بانتظار المرشد
    if (r.status === ReferralStatus.PENDING_COUNSELOR) {
      const counselors = staff.filter(s => s.isCounselor);
      potentialRecipients.push(...counselors);
    }

    // إرسال الإشعارات لمن يمتلك Chat ID ومفعل للبوت
    const uniqueRecipients = potentialRecipients.filter((s, index, self) => 
      s.telegramChatId && 
      s.id !== currentUser.id && 
      self.findIndex(t => t.id === s.id) === index
    );

    uniqueRecipients.forEach(recipient => {
      sendTelegramNotification(recipient.telegramChatId!, htmlMessage);
    });
  };

  const renderContent = () => {
    if (!currentUser) return null;
    const commonProps = { currentUser, staff, referrals };
    switch (activePage) {
      case 'dashboard': return <Dashboard referrals={referrals} />;
      case 'new-referral': 
        return <NewReferral {...commonProps} trainees={trainees} 
          onSubmit={async (r) => { 
            // ننتظر نجاح الكتابة في قاعدة البيانات أولاً
            await setDoc(doc(db, 'referrals', r.id), r); 
            // نطلق الإشعارات فوراً بعد التأكد من الحفظ
            triggerNotifications(r);
            setEditingReferral(undefined);
            setActivePage('referrals'); 
          }} 
          onCancel={() => { setEditingReferral(undefined); setActivePage('dashboard'); }} 
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
          <div className="text-center mb-10 text-slate-900">
            <ShieldCheck className="mx-auto mb-4 text-blue-600" size={60} />
            <h1 className="text-3xl font-black">نظام الإحالة الرقمي</h1>
            <p className="text-sm font-bold opacity-60">الكلية التقنية بالطائف</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pr-1 uppercase">اختر هويتك (رؤساء الأقسام أولاً)</label>
              <select 
                value={loginUser} 
                onChange={(e) => setLoginUser(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 appearance-none transition-all shadow-sm"
                required
              >
                <option value="">-- اختر من القائمة --</option>
                {staff.map(s => <option key={s.id} value={s.username}>{s.name} ({s.isCounselor ? 'مرشد' : s.role})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 pr-1 uppercase">كلمة المرور</label>
              <input 
                type="password" 
                value={loginPass} 
                onChange={(e) => setLoginPass(e.target.value)} 
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl font-mono text-center text-xl outline-none focus:border-blue-500 transition-all shadow-sm"
                placeholder="••••"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-center text-xs font-bold animate-pulse">{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all">دخول آمن</button>
          </form>
          <div className="mt-12 flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
                <Code2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">تطوير: م. عبدالله الزهراني</span>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-cairo overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={(p) => { if(p !== 'new-referral') setEditingReferral(undefined); setActivePage(p); }} currentUserRole={effectiveRole} onLogout={() => setIsAuthenticated(false)} notificationCount={pendingCount} />
      <main className="flex-1 p-4 md:p-10 overflow-y-auto pb-28">
        <header className="mb-10 flex justify-between items-center no-print">
           <div className="flex items-center gap-4">
             <div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activePage.replace('-', ' ')}</h1>
               <p className="text-slate-400 text-xs font-bold">{currentUser?.name}</p>
             </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:text-blue-600 cursor-pointer transition-all" onClick={() => setActivePage('profile')}>
                <User size={22} />
              </div>
           </div>
        </header>
        <div className="fade-in-up">{renderContent()}</div>
      </main>
      <MobileNav activePage={activePage} setActivePage={setActivePage} currentUserRole={effectiveRole} notificationCount={pendingCount} onLogout={() => setIsAuthenticated(false)} />
    </div>
  );
};

export default App;