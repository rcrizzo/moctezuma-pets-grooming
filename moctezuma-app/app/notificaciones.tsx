import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificacionesScreen() {
  const NotifItem = ({ title, desc, time, type }: { title: string, desc: string, time: string, type: 'check' | 'alert' | 'info' }) => (
    <View style={styles.notifItem}>
      <View style={[styles.iconBox, type === 'check' ? styles.bgSuccess : type === 'alert' ? styles.bgAlert : styles.bgInfo]}>
        <Ionicons 
          name={type === 'check' ? "checkmark-circle" : type === 'alert' ? "warning" : "information-circle"} 
          size={24} 
          color={type === 'check' ? "#10B981" : type === 'alert' ? "#D97706" : "#3B82F6"} 
        />
      </View>
      <View style={{flex: 1}}>
        <View style={styles.notifRow}>
          <Text style={styles.notifTitle}>{title}</Text>
          <Text style={styles.notifTime}>{time}</Text>
        </View>
        <Text style={styles.notifDesc}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity><Text style={styles.clearAll}>Limpiar</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <NotifItem 
          type="check" 
          title="Cita Confirmada" 
          desc="Tu cita de Grooming para Boby mañana a las 10:00 AM ha sido confirmada." 
          time="Hace 5m" 
        />
        <NotifItem 
          type="alert" 
          title="Recordatorio de Vacunación" 
          desc="Boby necesita su refuerzo de Rabia en los próximos 3 días. ¡Agenda hoy!" 
          time="Hace 2h" 
        />
        <NotifItem 
          type="info" 
          title="Pedido Apartado" 
          desc="Tus croquetas ya están listas para recoger en sucursal." 
          time="Ayer" 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  backBtn: { padding: 5 },
  clearAll: { color: '#64748B', fontWeight: '600', fontSize: 14 },
  container: { padding: 20 },
  notifItem: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  iconBox: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  bgSuccess: { backgroundColor: '#ECFDF5' },
  bgAlert: { backgroundColor: '#FFFBEB' },
  bgInfo: { backgroundColor: '#EFF6FF' },
  notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  notifTime: { fontSize: 12, color: '#94A3B8' },
  notifDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 }
});