import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC019dSsE2ElPDRPDyccVabYJLm7pWOM3U",
  authDomain: "nizam-traineereferralsys-2518b.firebaseapp.com",
  projectId: "nizam-traineereferralsys-2518b",
  storageBucket: "nizam-traineereferralsys-2518b.firebasestorage.app",
  messagingSenderId: "487619882628",
  appId: "1:487619882628:web:97f7e980dc98c861bc9cd1",
  measurementId: "G-JCY1QLJRBC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);