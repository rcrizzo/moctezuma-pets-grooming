import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// @ts-ignore: TypeScript lee los tipos web, pero esta función sí existe en el bundle de React Native
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDYnvhr2nRAYURkBy7VjyZ79T8yC-V9q40",
  authDomain: "moctezuma-pets-grooming.firebaseapp.com",
  projectId: "moctezuma-pets-grooming",
  storageBucket: "moctezuma-pets-grooming.firebasestorage.app",
  messagingSenderId: "1054415556370",
  appId: "1:1054415556370:web:8678b3ff3ab3acd22f2dcb",
  measurementId: "G-KHYGDSNVBH"
};

// Inicialización básica
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Inicializamos Auth con la persistencia correcta para el celular
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});