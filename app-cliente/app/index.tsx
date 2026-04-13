import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}><Text style={styles.logoText}>🐾</Text></View>
          <Text style={styles.title}>Moctezuma</Text>
          <Text style={styles.subtitle}>Inicia sesión para gestionar las citas de tu mascota.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput style={styles.input} placeholder="ejemplo@correo.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput style={styles.input} placeholder="••••••••" secureTextEntry placeholderTextColor="#94A3B8" />
          </View>

          <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/recovery')}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* LA LLAVE MAGICA: Esto te lleva a tus Tabs */}
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')}>
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerLink}>Regístrate aquí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  header: { alignItems: 'center', marginBottom: 50 },
  logoContainer: { width: 80, height: 80, backgroundColor: '#FEF3C7', borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#FDE68A' },
  logoText: { fontSize: 44, color: '#D97706' },
  title: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
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