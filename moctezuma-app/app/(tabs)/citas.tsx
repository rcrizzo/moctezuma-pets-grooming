import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function CitasScreen() {
  const [listaCitas, setListaCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // ESTADOS TEMPORALES
  const [rawG, setRawG] = useState<any[]>([]);
  const [rawV, setRawV] = useState<any[]>([]);
  const [rawH, setRawH] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const unsubUser = onSnapshot(qUser, (userSnap) => {
      if (!userSnap.empty) {
        const dashboardId = userSnap.docs[0].id;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // GROOMING
        const qG = query(
          collection(db, 'grooming'),
          where('duenoId', '==', dashboardId),
          where('fechaTimestamp', '>=', hoy),
          orderBy('fechaTimestamp', 'asc')
        );
        const unsubG = onSnapshot(qG, (s) => setRawG(s.docs.map(d => ({ 
            id: d.id, ...d.data(), cat: 'Grooming', icon: 'cut', color: '#D97706', bgColor: '#FEF3C7' 
        }))));

        // VETERINARIA
        const qV = query(
          collection(db, 'consultas'),
          where('duenoId', '==', dashboardId),
          where('fechaTimestamp', '>=', hoy),
          orderBy('fechaTimestamp', 'asc')
        );
        const unsubV = onSnapshot(qV, (s) => setRawV(s.docs.map(d => ({ 
            id: d.id, ...d.data(), cat: 'Veterinaria', icon: 'medical', color: '#0284C7', bgColor: '#E0F2FE' 
        }))));

        // HOSPEDAJE
        const qH = query(
          collection(db, 'hospedaje'),
          where('duenoId', '==', dashboardId),
          where('fechaTimestamp', '>=', hoy),
          orderBy('fechaTimestamp', 'asc')
        );
        const unsubH = onSnapshot(qH, (s) => setRawH(s.docs.map(d => ({ 
            id: d.id, ...d.data(), cat: 'Hospedaje', icon: 'bed', color: '#059669', bgColor: '#DCFCE7' 
        }))));

        return () => { unsubG(); unsubV(); unsubH(); };
      }
    });

    return () => unsubUser();
  }, []);

  useEffect(() => {
    const todas = [...rawG, ...rawV, ...rawH];
    
    // ORDENAR DE FORMA ASCENDENTE
    todas.sort((a, b) => (a.fechaTimestamp?.seconds || 0) - (b.fechaTimestamp?.seconds || 0));
    
    setListaCitas(todas);
    setCargando(false);
  }, [rawG, rawV, rawH]);

  const getDia = (ts: any) => ts?.toDate ? ts.toDate().getDate().toString().padStart(2, '0') : '--';
  const getMes = (ts: any) => {
    if (!ts?.toDate) return '---';
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[ts.toDate().getMonth()];
  };
  const getHoraFormat = (cita: any) => {
    return cita.hora || cita.horario || cita.horaCita || 'Pendiente';
  };

  const ServiceCard = ({ title, desc, icon, routeParam }: any) => (
    <TouchableOpacity 
      style={styles.serviceCard} 
      onPress={() => router.push({ pathname: '/agendar', params: { servicio: routeParam } })}
    >
      <View style={styles.serviceIconBg}>
        <Ionicons name={icon} size={24} color="#D97706" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Mis Citas</Text>

        <Text style={styles.sectionHeader}>PRÓXIMOS APARTADOS</Text>
        
        {cargando ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#D97706" />
          </View>
        ) : listaCitas.length > 0 ? (
          listaCitas.map((cita) => (
            <View key={cita.id} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.dateBadge, { backgroundColor: cita.bgColor }]}>
                  <Text style={[styles.dateBadgeDay, { color: cita.color }]}>{getDia(cita.fechaTimestamp)}</Text>
                  <Text style={[styles.dateBadgeMonth, { color: cita.color }]}>{getMes(cita.fechaTimestamp)}</Text>
                </View>
                
                <View style={styles.cardInfo}>
                  <View style={styles.tagRow}>
                    <View style={[styles.catTag, { backgroundColor: cita.bgColor }]}>
                      <Ionicons name={cita.icon} size={10} color={cita.color} />
                      <Text style={[styles.catTagText, { color: cita.color }]}>{cita.cat}</Text>
                    </View>
                    <Text style={styles.timeLabel}>{getHoraFormat(cita)}</Text>
                  </View>
                  <Text style={styles.cardTitle}>{cita.servicio || cita.tipo || 'Servicio Moctezuma'}</Text>
                  <Text style={styles.cardPet}>Mascota: <Text style={{fontWeight: '700', color: '#0F172A'}}>{cita.mascotaNombre || cita.mascota || 'Tu mascota'}</Text></Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: cita.estado === 'Pendiente' ? '#F59E0B' : '#10B981' }]} />
                  <Text style={styles.statusText}>{cita.estado || 'Agendado'}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={40} color="#CBD5E1" style={{ marginBottom: 10 }} />
            <Text style={styles.emptyText}>No tienes citas próximas agendadas.</Text>
          </View>
        )}

        <Text style={[styles.sectionHeader, { marginTop: 20 }]}>AGENDAR NUEVO SERVICIO</Text>
        
        <ServiceCard 
          title="Grooming & Estética" 
          desc="Baños, cortes de raza y spa." 
          icon="cut" 
          routeParam="grooming"
        />
        
        <ServiceCard 
          title="Consulta Veterinaria" 
          desc="Revisiones y atención médica." 
          icon="medical" 
          routeParam="veterinaria"
        />
        
        <ServiceCard 
          title="Hospedaje Canino" 
          desc="Estadías con cuidado 24/7." 
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
  sectionHeader: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 15 },
  loaderContainer: { paddingVertical: 40, alignItems: 'center' },
  
  // TARJETA DE CITA LISTA
  appointmentCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { width: 55, height: 65, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dateBadgeDay: { fontSize: 20, fontWeight: '800' },
  dateBadgeMonth: { fontSize: 10, fontWeight: '700', marginTop: -2 },
  cardInfo: { flex: 1, marginLeft: 15 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  catTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  catTagText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  timeLabel: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  cardPet: { fontSize: 12, color: '#64748B', marginTop: 2 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#475569', textTransform: 'capitalize' },
  reproBtn: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  reproBtnText: { color: '#475569', fontSize: 11, fontWeight: '700' },

  emptyContainer: { alignItems: 'center', paddingVertical: 40, backgroundColor: '#FFFFFF', borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', fontWeight: '600', fontSize: 13 },

  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  serviceIconBg: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  serviceTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  serviceDesc: { fontSize: 12, color: '#64748B' },
});