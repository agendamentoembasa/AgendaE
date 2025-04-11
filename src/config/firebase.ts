import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

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

// Initialize Firestore with persistence
const db = initializeFirestore(app, {
  cache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export { auth, db };