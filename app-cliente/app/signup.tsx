import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SignUpScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete al ecosistema Moctezuma Center.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOMBRE COMPLETO</Text>
            <TextInput style={styles.input} placeholder="Juan Pérez" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TELÉFONO CELULAR</Text>
            <TextInput style={styles.input} placeholder="(222) 123-4567" keyboardType="phone-pad" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput style={styles.input} placeholder="correo@ejemplo.com" keyboardType="email-address" placeholderTextColor="#94A3B8" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput style={styles.input} placeholder="Mínimo 8 caracteres" secureTextEntry placeholderTextColor="#94A3B8" />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.primaryButtonText}>Registrarme</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingHorizontal: 32, paddingTop: 60, paddingBottom: 60 },
  header: { marginBottom: 40 },
  title: { fontSize: 30, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
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
  primaryButton: { backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 14, marginTop: 35, alignItems: 'center' }, // Botón Deep Slate
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 17, letterSpacing: -0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#64748B', fontSize: 15 },
  footerLink: { color: '#D97706', fontWeight: '700', fontSize: 15 } // Link Oro Ámbar
});