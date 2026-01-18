
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot, doc, setDoc, getDoc, Firestore, Unsubscribe } from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser, 
  Auth 
} from 'firebase/auth';

// Standardized configuration with intelligent defaults
const projectId = process.env.FIREBASE_PROJECT_ID || "cruzpham-trivia-prod";
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

// Resilience check: only initialize if API Key is valid
export const isCloudEnabled = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "REPLACE_WITH_ENV_API_KEY" && firebaseConfig.apiKey !== "undefined";

try {
  if (!getApps().length) {
    if (isCloudEnabled) {
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApps()[0];
  }

  if (app) {
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  console.error("CruzPham Core: Infrastructure Handshake Error", error);
}

export { app, db, auth };
export const googleProvider = new GoogleAuthProvider();

/**
 * Authentication Proxies
 */
export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile 
};

/**
 * Sync User Metadata to Firestore
 */
export const syncUserRecord = async (user: { id: string; username: string; email: string }) => {
  if (!db || !isCloudEnabled) return;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      uid: user.id,
      email: user.email,
      username: user.username,
      lastLogin: Date.now(),
      version: '2.0-secure'
    }, { merge: true });
  } catch (e) {
    console.warn("User sync skipped: persistence check failed.");
  }
};

/**
 * Real-time Data Listeners with Local Fallback
 */
const LOCAL_TEMPLATES = 'cruzpham_local_templates_v2';

export const subscribeToTemplates = (userId: string, callback: (templates: any[]) => void): Unsubscribe => {
  if (db && isCloudEnabled) {
    const q = query(collection(db, 'templates'), where('ownerId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const templates = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      callback(templates);
    });
  } else {
    const sync = () => {
      const stored = localStorage.getItem(LOCAL_TEMPLATES);
      const data = stored ? JSON.parse(stored) : [];
      callback(data.filter((t: any) => t.ownerId === userId || userId === 'guest'));
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }
};

export const subscribeToGameSession = (sessionId: string, callback: (session: any) => void): Unsubscribe => {
  if (db && isCloudEnabled) {
    return onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
      if (doc.exists()) callback(doc.data());
    });
  } else {
    const sync = () => {
      const stored = localStorage.getItem(`session_${sessionId}`);
      if (stored) callback(JSON.parse(stored));
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }
};

export const upsertTemplate = async (template: any) => {
  if (db && isCloudEnabled) {
    const ref = doc(db, 'templates', template.id);
    await setDoc(ref, { ...template, updatedAt: Date.now() }, { merge: true });
  } else {
    const stored = localStorage.getItem(LOCAL_TEMPLATES);
    let data = stored ? JSON.parse(stored) : [];
    const idx = data.findIndex((t: any) => t.id === template.id);
    if (idx > -1) data[idx] = { ...data[idx], ...template, updatedAt: Date.now() };
    else data.push({ ...template, updatedAt: Date.now() });
    localStorage.setItem(LOCAL_TEMPLATES, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  }
};

export const upsertSession = async (sessionId: string, data: any) => {
  if (db && isCloudEnabled) {
    const ref = doc(db, 'sessions', sessionId);
    await setDoc(ref, { ...data, updatedAt: Date.now() }, { merge: true });
  } else {
    localStorage.setItem(`session_${sessionId}`, JSON.stringify({ ...data, updatedAt: Date.now() }));
    window.dispatchEvent(new Event('storage'));
  }
};
