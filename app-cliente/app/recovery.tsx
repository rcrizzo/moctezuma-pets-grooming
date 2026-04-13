import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function RecoveryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recuperar Acceso</Text>
          <Text style={styles.subtitle}>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput 
              style={styles.input} 
              placeholder="correo@ejemplo.com" 
              keyboardType="email-address" 
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => {
              alert('Correo enviado. Revisa tu bandeja de entrada.');
              router.back();
            }}
          >
            <Text style={styles.primaryButtonText}>Enviar Enlace</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 32, paddingTop: 80 },
  header: { marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  subtitle: { color: '#64748B', marginTop: 10, fontSize: 16, lineHeight: 24 },
  formContainer: { gap: 24, width: '100%' },
  inputGroup: { gap: 10 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', letterSpacing: 1 },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    fontSize: 16,
  },
  primaryButton: { backgroundColor: '#D97706', paddingVertical: 18, borderRadius: 14, marginTop: 30, alignItems: 'center' }, // Botón Oro Ámbar
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17, letterSpacing: -0.2 },
  backButton: { alignItems: 'center', marginTop: 30 },
  backText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
});