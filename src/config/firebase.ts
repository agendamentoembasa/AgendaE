import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD3l-c_t5SDbdtEVIY8qtXVHkNe-3IbGCE",
  authDomain: "agendae-cc5a0.firebaseapp.com",
  projectId: "agendae-cc5a0",
  storageBucket: "agendae-cc5a0.applestorage.app",
  messagingSenderId: "579470178443",
  appId: "1:579470178443:web:305832a3c9c123688efc8e",
  measurementId: "G-3BHBR26LR9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  // Initialize Firestore with persistence
  const { enableIndexedDbPersistence } = require('firebase/firestore');
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
}

export { auth, db };