import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYnvhr2nRAYURkBy7VjyZ79T8yC-V9q40",
  authDomain: "moctezuma-pets-grooming.firebaseapp.com",
  projectId: "moctezuma-pets-grooming",
  storageBucket: "moctezuma-pets-grooming.firebasestorage.app",
  messagingSenderId: "1054415556370",
  appId: "1:1054415556370:web:8678b3ff3ab3acd22f2dcb",
  measurementId: "G-KHYGDSNVBH"
};

let app;
let auth;

// Blindaje contra recargas múltiples (Fast Refresh)
if (!getApps().length) {
  // Primera vez que carga la app
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  // Si guardas cambios y el emulador recarga la pantalla
  app = getApp();
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };