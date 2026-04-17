import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

export default function RecoveryScreen() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSendLink = () => {
    // Simulación de envío. Aquí irá la función de Firebase sendPasswordResetEmail
    setIsSent(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0F172A" />
        </TouchableOpacity>

        {!isSent ? (
          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <Ionicons name="key-outline" size={40} color="#D97706" />
            </View>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace para restablecerla.
            </Text>

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
              />
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, !email && { opacity: 0.6 }]}
              onPress={handleSendLink}
              disabled={!email}
            >
              <Text style={styles.primaryButtonText}>Enviar enlace</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={[styles.iconWrapper, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-circle" size={50} color="#10B981" />
            </View>
            <Text style={[styles.title, { textAlign: 'center' }]}>¡Enlace Enviado!</Text>
            <Text style={[styles.subtitle, { textAlign: 'center' }]}>
              Revisa tu bandeja de entrada o la carpeta de spam en {email}.
            </Text>
            <TouchableOpacity 
              style={[styles.primaryButton, { width: '100%', marginTop: 20 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40 },
  backButton: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  content: { flex: 1, marginTop: 20 },
  iconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 15 },
  subtitle: { fontSize: 16, color: '#64748B', lineHeight: 24, marginBottom: 35 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 15, height: 60, marginBottom: 25 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#0F172A', height: '100%' },
  primaryButton: { backgroundColor: '#0F172A', height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});