
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';

// These are injected via process.env in the build pipeline
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const perf = typeof window !== 'undefined' ? getPerformance(app) : null;

/**
 * Real-time Firestore Hook Logic
 * This ensures the TikTok Live stage and Director Control stay in perfect sync.
 */
export const subscribeToTemplates = (userId: string, callback: (templates: any[]) => void) => {
  const q = query(collection(db, 'templates'), where('ownerId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(templates);
  });
};

export const subscribeToGameSession = (sessionId: string, callback: (session: any) => void) => {
  return onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const saveTemplate = async (template: any) => {
  const ref = doc(db, 'templates', template.id);
  await setDoc(ref, template, { merge: true });
};

export const updateGameSession = async (sessionId: string, data: any) => {
  const ref = doc(db, 'sessions', sessionId);
  await setDoc(ref, data, { merge: true });
};
