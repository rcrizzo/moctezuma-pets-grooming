import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase'; 

export default function SignupScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegistro = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Por favor llena todos los campos.');
    }
    if (password.length < 8) {
      return Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres.');
    }

    setCargando(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const correoLimpio = email.toLowerCase().trim();

      const q = query(collection(db, 'usuarios'), where('email', '==', correoLimpio));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docExistente = querySnapshot.docs[0];
        await updateDoc(doc(db, 'usuarios', docExistente.id), {
          uid: user.uid,
          hasApp: true,
          fechaRegistroApp: serverTimestamp(),
          nombre: nombre.trim() 
        });
      } else {
        await setDoc(doc(db, 'usuarios', user.uid), {
          uid: user.uid,
          email: correoLimpio,
          nombre: nombre.trim(),
          rol: 'cliente',
          hasApp: true,
          fechaRegistroApp: serverTimestamp()
        });
      }

      router.replace('/(tabs)/home');

    } catch (error: any) {
      console.error("Error en el registro:", error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Este correo ya tiene una contraseña registrada. Intenta iniciar sesión.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'El formato del correo no es válido.');
      } else {
        Alert.alert('Error', 'Hubo un problema al crear tu cuenta. Inténtalo más tarde.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={cargando}>
            <Ionicons name="arrow-back" size={28} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a la familia Moctezuma y dale lo mejor a tu mascota.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Ej. Juan Pérez" 
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  value={nombre}
                  onChangeText={setNombre}
                  editable={!cargando}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="tu@correo.com" 
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!cargando}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Mínimo 8 caracteres" 
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!cargando}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} disabled={cargando}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, cargando && { opacity: 0.7 }]}
              onPress={handleRegistro}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Comenzar ahora</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()} disabled={cargando}>
              <Text style={styles.footerLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40, flexGrow: 1 },
  backButton: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  header: { marginBottom: 35 },
  title: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24 },
  form: { flex: 1 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 15, height: 60 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#0F172A', height: '100%' },
  eyeIcon: { padding: 10 },
  primaryButton: { backgroundColor: '#D97706', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#D97706', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, fontWeight: '800', color: '#D97706' }
});