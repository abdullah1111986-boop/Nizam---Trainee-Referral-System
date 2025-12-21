import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * إعدادات مشروع Firebase
 */
const firebaseConfig = {
  apiKey: "AIzaSyC019dSsE2ElPDRPDyccVabYJLm7pWOM3U",
  authDomain: "nizam-traineereferralsys-2518b.firebaseapp.com",
  projectId: "nizam-traineereferralsys-2518b",
  storageBucket: "nizam-traineereferralsys-2518b.firebasestorage.app",
  messagingSenderId: "487619882628",
  appId: "1:487619882628:web:97f7e980dc98c861bc9cd1",
  measurementId: "G-JCY1QLJRBC"
};

// تهيئة تطبيق Firebase (Singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * تصدير نسخة Firestore
 * يتم تمرير 'app' لضمان أن Firestore يستخدم الإعدادات الصحيحة والنسخة المهيأة
 */
export const db = getFirestore(app);

/**
 * تهيئة التحليلات بشكل آمن
 */
export const analytics = typeof window !== 'undefined'
  ? isSupported().then((supported) => (supported ? getAnalytics(app) : null))
  : Promise.resolve(null);
