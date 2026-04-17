import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYnvhr2nRAYURkBy7VjyZ79T8yC-V9q40",
  authDomain: "moctezuma-pets-grooming.firebaseapp.com",
  projectId: "moctezuma-pets-grooming",
  storageBucket: "moctezuma-pets-grooming.firebasestorage.app",
  messagingSenderId: "1054415556370",
  appId: "1:1054415556370:web:8678b3ff3ab3acd22f2dcb",
  measurementId: "G-KHYGDSNVBH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);