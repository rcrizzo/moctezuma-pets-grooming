import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* CABECERA CON SALUDO Y NOTIFICACIONES */}
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <Text style={styles.welcomeText}>Hola de nuevo,</Text>
          <Text style={styles.userName}>Juan Pérez 👋</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notificaciones')}>
          <Ionicons name="notifications-outline" size={28} color="#0F172A" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* CARD DE ESTADO: Recordatorio importante */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>PRÓXIMO EVENTO</Text>
            <Text style={styles.statusTitle}>Refuerzo de Rabia</Text>
            <Text style={styles.statusPet}>Paciente: Boby • En 3 días</Text>
          </View>
          <TouchableOpacity style={styles.statusAction} onPress={() => router.push('/(tabs)/carnet')}>
            <Text style={styles.statusActionText}>Ver Carnet</Text>
          </TouchableOpacity>
        </View>

        {/* ACCESOS RÁPIDOS */}
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(tabs)/citas')}>
            <View style={[styles.quickIcon, {backgroundColor: '#FEF3C7'}]}>
              <Ionicons name="calendar" size={24} color="#D97706" />
            </View>
            <Text style={styles.quickLabel}>Citas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(tabs)/tienda')}>
            <View style={[styles.quickIcon, {backgroundColor: '#E0F2FE'}]}>
              <Ionicons name="cart" size={24} color="#0284C7" />
            </View>
            <Text style={styles.quickLabel}>Tienda</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => router.push('/(tabs)/carnet')}>
            <View style={[styles.quickIcon, {backgroundColor: '#F1F5F9'}]}>
              <Ionicons name="medical" size={24} color="#0F172A" />
            </View>
            <Text style={styles.quickLabel}>Salud</Text>
          </TouchableOpacity>
        </View>

        {/* SECCIÓN MIS MASCOTAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Mascotas</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/carnet')}>
            <Text style={styles.seeMore}>Gestionar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petList}>
          {['Boby', 'Rocky', 'Luna'].map((name) => (
            <TouchableOpacity key={name} style={styles.petCircleCard} onPress={() => router.push('/(tabs)/carnet')}>
              <View style={styles.petAvatar}><Text style={{fontSize: 26}}>{name === 'Luna' ? '🐩' : '🐕'}</Text></View>
              <Text style={styles.petName}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 25, 
    paddingTop: 20,
    paddingBottom: 15
  },
  greetingSection: { flex: 1 },
  welcomeText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  
  iconBtn: { 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  notifBadge: { 
    position: 'absolute', 
    top: 14, 
    right: 14, 
    width: 10, 
    height: 10, 
    backgroundColor: '#EF4444', 
    borderRadius: 5, 
    borderWidth: 2, 
    borderColor: '#FFFFFF' 
  },
  
  container: { paddingHorizontal: 25, paddingTop: 10 },
  
  statusCard: { backgroundColor: '#0F172A', borderRadius: 28, padding: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5, marginTop: 10 },
  statusInfo: { marginBottom: 5 },
  statusLabel: { color: '#D97706', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  statusTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  statusPet: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  statusAction: { backgroundColor: '#D97706', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 15 },
  statusActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  quickGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 35 },
  quickItem: { alignItems: 'center', width: '30%' },
  quickIcon: { width: 65, height: 65, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  seeMore: { color: '#D97706', fontWeight: '700' },
  petList: { flexDirection: 'row' },
  petCircleCard: { alignItems: 'center', marginRight: 20 },
  petAvatar: { width: 75, height: 75, borderRadius: 37.5, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  petName: { fontSize: 14, fontWeight: '700', color: '#1E293B' }
});