import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAZEhFZq57IeNsAA_S7WXuQ0lM-HlI0TBg',
  authDomain: 'comp229-f25-example.firebaseapp.com',
  projectId: 'comp229-f25-example',
  storageBucket: 'comp229-f25-example.firebasestorage.app',
  messagingSenderId: '767770729314',
  appId: '1:767770729314:web:bfee349869f73056a9aa3b',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
