import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CitasScreen() {
  const ServiceCard = ({ title, desc, icon, routeParam }: { title: string, desc: string, icon: any, routeParam: string }) => (
    <TouchableOpacity 
      style={styles.serviceCard} 
      onPress={() => router.push({ pathname: '/agendar', params: { servicio: routeParam } })}
    >
      <View style={styles.serviceIconBg}>
        <Ionicons name={icon} size={28} color="#D97706" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Mis Citas</Text>

        {/* 1. La cita activa del usuario */}
        <Text style={styles.sectionHeader}>PRÓXIMA CITA</Text>
        <View style={styles.activeAppointmentCard}>
          <View style={styles.activeHeader}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeDay}>15</Text>
              <Text style={styles.dateBadgeMonth}>MAR</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.activeTitle}>Corte de Raza y Baño</Text>
              <Text style={styles.activeSub}>Mascota: Boby</Text>
            </View>
          </View>
          <View style={styles.activeFooter}>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.infoText}>12:00 PM - 02:00 PM</Text>
            </View>
            <TouchableOpacity style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Reprogramar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Apartados atractivos para agendar */}
        <Text style={styles.sectionHeader}>AGENDAR NUEVO SERVICIO</Text>
        
        <ServiceCard 
          title="Grooming & Estética" 
          desc="Baños, cortes de raza, spa y limpieza dental." 
          icon="cut" 
          routeParam="grooming"
        />
        
        <ServiceCard 
          title="Consulta Veterinaria" 
          desc="Revisiones, vacunas y atención médica." 
          icon="medical" 
          routeParam="veterinaria"
        />
        
        <ServiceCard 
          title="Hospedaje Canino" 
          desc="Estadías con cuidado 24/7 y reportes diarios." 
          icon="bed" 
          routeParam="hospedaje"
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 40 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 25 },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 12, marginTop: 10 },
  
  activeAppointmentCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 35, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  activeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dateBadge: { backgroundColor: '#FEF3C7', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 16, alignItems: 'center' },
  dateBadgeDay: { color: '#D97706', fontSize: 20, fontWeight: '800' },
  dateBadgeMonth: { color: '#B45309', fontSize: 12, fontWeight: '700' },
  activeTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  activeSub: { fontSize: 14, color: '#64748B', marginTop: 4 },
  activeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  cancelBtnText: { color: '#0F172A', fontSize: 12, fontWeight: '700' },

  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  serviceIconBg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  serviceTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  serviceDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
});