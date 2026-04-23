import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
    }

    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Correo o contraseña incorrectos. Verifica tus datos.');
      } else {
        Alert.alert('Error', 'Hubo un problema al iniciar sesión. Inténtalo más tarde.');
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
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}><Text style={styles.logoText}>🐾</Text></View>
            <Text style={styles.title}>Moctezuma Pet's Grooming</Text>
            <Text style={styles.subtitle}>Inicia sesión para gestionar las citas de tu mascota.</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
              <TextInput 
                style={styles.input} 
                placeholder="ejemplo@correo.com" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                editable={!cargando}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                secureTextEntry 
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                editable={!cargando}
              />
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/recovery')} disabled={cargando}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryButton, cargando && { opacity: 0.7 }]} 
              onPress={handleLogin}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')} disabled={cargando}>
              <Text style={styles.footerLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 20 },
  header: { alignItems: 'center', marginBottom: 50 },
  logoContainer: { width: 80, height: 80, backgroundColor: '#FEF3C7', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#FDE68A' },
  logoText: { fontSize: 44, color: '#D97706' },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { color: '#64748B', marginTop: 10, textAlign: 'center', lineHeight: 22 },
  formContainer: { gap: 24, width: '100%' },
  inputGroup: { gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 1 },
  input: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', color: '#0F172A', fontSize: 16 },
  forgotButton: { alignItems: 'flex-end', marginTop: 8 },
  forgotText: { color: '#D97706', fontWeight: '700', fontSize: 14 },
  primaryButton: { backgroundColor: '#D97706', paddingVertical: 18, borderRadius: 14, marginTop: 30, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17, letterSpacing: -0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 50 },
  footerText: { color: '#64748B', fontSize: 15 },
  footerLink: { color: '#D97706', fontWeight: '700', fontSize: 15 }
});