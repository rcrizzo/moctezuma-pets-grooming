import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function CitasScreen() {
  const [proximaCita, setProximaCita] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Encontrar el dashboardId del usuario
    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const unsubUser = onSnapshot(qUser, (userSnap) => {
      if (!userSnap.empty) {
        const dashboardId = userSnap.docs[0].id;

        // 2. Buscar la cita más cercana (ej. en la colección 'grooming')
        const hoy = new Date();
        const qCitas = query(
          collection(db, 'grooming'),
          where('duenoId', '==', dashboardId),
          where('fechaTimestamp', '>=', hoy),
          orderBy('fechaTimestamp', 'asc'),
          limit(1)
        );

        onSnapshot(qCitas, (citaSnap) => {
          if (!citaSnap.empty) {
            const data = citaSnap.docs[0].data();
            setProximaCita({
              id: citaSnap.docs[0].id,
              titulo: data.servicio || 'Servicio de Estética',
              mascota: data.mascotaNombre || 'Tu mascota',
              fecha: data.fechaTimestamp?.toDate(),
            });
          } else {
            setProximaCita(null);
          }
          setCargando(false);
        });
      }
    });

    return () => unsubUser();
  }, []);

  // Utilidades para extraer Día, Mes y Hora de la fecha real de Firebase
  const getDia = (fecha: Date) => fecha ? fecha.getDate().toString().padStart(2, '0') : '--';
  const getMes = (fecha: Date) => {
    if (!fecha) return '---';
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[fecha.getMonth()];
  };
  const getHoraFormat = (fecha: Date) => {
    if (!fecha) return '--:--';
    return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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

        {/* 1. La cita activa del usuario (Dinámica) */}
        <Text style={styles.sectionHeader}>PRÓXIMA CITA</Text>
        
        {cargando ? (
          <View style={[styles.activeAppointmentCard, { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }]}>
            <ActivityIndicator size="large" color="#D97706" />
          </View>
        ) : proximaCita ? (
          <View style={styles.activeAppointmentCard}>
            <View style={styles.activeHeader}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeDay}>{getDia(proximaCita.fecha)}</Text>
                <Text style={styles.dateBadgeMonth}>{getMes(proximaCita.fecha)}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.activeTitle}>{proximaCita.titulo}</Text>
                <Text style={styles.activeSub}>Mascota: {proximaCita.mascota}</Text>
              </View>
            </View>
            <View style={styles.activeFooter}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>{getHoraFormat(proximaCita.fecha)}</Text>
              </View>
              <TouchableOpacity style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Reprogramar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.activeAppointmentCard, { alignItems: 'center', paddingVertical: 30 }]}>
            <Ionicons name="calendar-clear-outline" size={40} color="#CBD5E1" style={{ marginBottom: 10 }} />
            <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 14 }}>No tienes citas próximas agendadas.</Text>
          </View>
        )}

        {/* 2. Apartados atractivos para agendar (Intactos) */}
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