// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDAa0DFAwVW9-kCoaocd1ot1SUvsQQHRWQ",
  authDomain: "mandi-59606.firebaseapp.com",
  projectId: "mandi-59606",
  storageBucket: "mandi-59606.firebasestorage.app",
  messagingSenderId: "359295821144",
  appId: "1:359295821144:web:cbf1057d3e2f7b1304b12d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
