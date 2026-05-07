import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function HomeScreen() {
  const [userName, setUserName] = useState('Usuario');
  const [proximoEvento, setProximoEvento] = useState<any>(null);
  const [misMascotas, setMisMascotas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarInformacion = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
      const userSnap = await getDocs(qUser);
      
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        setUserName(userDoc.data().nombre?.split(' ')[0] || 'Usuario');
        const dId = userDoc.id;

        // CARGAR MASCOTAS
        const qM = query(collection(db, 'mascotas'), where('duenoId', '==', dId));
        const mSnap = await getDocs(qM);
        setMisMascotas(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // CARGAR CITAS
        const qG = query(collection(db, 'grooming'), where('duenoId', '==', dId));
        const qV = query(collection(db, 'consultas'), where('dueñoId', '==', dId));
        const qH = query(collection(db, 'hospedaje'), where('dueñoId', '==', dId));

        const [snapG, snapV, snapH] = await Promise.all([getDocs(qG), getDocs(qV), getDocs(qH)]);

        let todas: any[] = [];
        snapG.forEach(d => todas.push({ ...d.data(), id: d.id, cat: 'Grooming', icon: 'cut' }));
        snapV.forEach(d => todas.push({ ...d.data(), id: d.id, cat: 'Veterinaria', icon: 'medical' }));
        snapH.forEach(d => todas.push({ ...d.data(), id: d.id, cat: 'Hospedaje', icon: 'bed' }));

        if (todas.length > 0) {
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          const citasProcesadas = todas.map(cita => {
            let fechaFinal = new Date(0);

            const fStr = cita.fecha || cita.fechaCita || cita.fechaIngreso;
            if (fStr && typeof fStr === 'string' && fStr.includes('-')) {
              const [y, m, d] = fStr.split('-').map(Number);
              fechaFinal = new Date(y, m - 1, d);
              
              const hStr = cita.hora || cita.horario || cita.horaCita;
              if (hStr && hStr !== 'Pendiente') {
                const match = hStr.match(/(\d+):(\d+)\s(AM|PM)/i);
                if (match) {
                  let [, hh, mm, ampm] = match;
                  let h = parseInt(hh);
                  if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
                  if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
                  fechaFinal.setHours(h, parseInt(mm), 0, 0);
                }
              }
            } else if (cita.fechaTimestamp?.toDate) {
              fechaFinal = cita.fechaTimestamp.toDate();
            }
            return { ...cita, fechaReal: fechaFinal };
          });

          const futuras = citasProcesadas
            .filter(c => c.fechaReal >= hoy)
            .sort((a, b) => a.fechaReal.getTime() - b.fechaReal.getTime());

          if (futuras.length > 0) {
            const top = futuras[0];
            setProximoEvento({
              id: top.id,
              titulo: top.servicio || top.tipo || 'Cita Programada',
              mascota: top.mascotaNombre || top.nombre || top.mascota || 'Tu mascota',
              fecha: top.fechaReal,
              hora: top.hora || top.horario || top.horaCita || 'Pendiente',
              categoria: top.cat,
              icono: top.icon
            });
          } else {
            setProximoEvento(null);
          }
        } else {
          setProximoEvento(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { cargarInformacion(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cargarInformacion();
  }, []);

  const getDia = (f: Date) => f.getDate().toString().padStart(2, '0');
  const getMes = (f: Date) => ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'][f.getMonth()];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D97706" colors={['#D97706']} />
        }
      >
        
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>¡Hola, {userName}! 👋</Text>
            <Text style={styles.subWelcome}>¿Cómo están tus peludos hoy?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notificaciones')}>
            <Ionicons name="notifications-outline" size={24} color="#0F172A" />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próxima Cita</Text>
          {cargando ? (
            <ActivityIndicator color="#D97706" style={{ marginTop: 20 }} />
          ) : proximoEvento ? (
            <TouchableOpacity style={styles.eventCard} activeOpacity={0.9} onPress={() => router.push('/citas')}>
              <View style={styles.eventMain}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>{getDia(proximoEvento.fecha)}</Text>
                  <Text style={styles.dateMonth}>{getMes(proximoEvento.fecha)}</Text>
                </View>
                
                <View style={styles.eventDetails}>
                  <View style={styles.tagRow}>
                    <View style={styles.categoryTag}>
                      <Ionicons name={proximoEvento.icono} size={12} color="#D97706" />
                      <Text style={styles.categoryText}>{proximoEvento.categoria}</Text>
                    </View>
                    <View style={styles.timeTag}>
                      <Ionicons name="time-outline" size={12} color="#64748B" />
                      <Text style={styles.timeText}>{proximoEvento.hora}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.eventTitle} numberOfLines={1}>{proximoEvento.titulo}</Text>
                  <Text style={styles.eventPet}>Mascota: <Text style={{fontWeight: '700', color: '#FFFFFF'}}>{proximoEvento.mascota}</Text></Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.emptyCard, { marginBottom: 35 }]}>
              <Ionicons name="calendar-outline" size={32} color="#CBD5E1" />
              <Text style={styles.emptyText}>No tienes citas agendadas próximamente</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Servicios</Text>
        <View style={styles.grid}>
          <ServiceItem icon="cut" label="Estética" color="#FEF3C7" onPress={() => router.push({ pathname: '/agendar', params: { servicio: 'grooming' } })} />
          <ServiceItem icon="medical" label="Veterinaria" color="#E0F2FE" onPress={() => router.push({ pathname: '/agendar', params: { servicio: 'veterinaria' } })} />
          <ServiceItem icon="bed" label="Hospedaje" color="#DCFCE7" onPress={() => router.push({ pathname: '/agendar', params: { servicio: 'hospedaje' } })} />
          <ServiceItem icon="cart" label="Tienda" color="#F1F5F9" onPress={() => router.push('/tienda')} />
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitleNoMargin}>Mis Mascotas</Text>
            <TouchableOpacity onPress={() => router.push('/perfil')}><Text style={styles.viewAll}>Ver todas</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
            {misMascotas.map(m => (
              <TouchableOpacity key={m.id} style={styles.petCard} onPress={() => router.push({ pathname: '/carnet', params: { petId: m.id } })}>
                <View style={styles.petAvatar}>
                  <Text style={{fontSize: 30}}>{m.tipo === 'Gato' || m.tipo === 'gato' ? '🐱' : '🐶'}</Text>
                </View>
                <Text style={styles.petName}>{m.nombre}</Text>
                <Text style={styles.petRaza} numberOfLines={1}>{m.raza || 'Mestizo'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ServiceItem = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: color }]}>
      <Ionicons name={icon} size={28} color="#0F172A" />
    </View>
    <Text style={styles.gridLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  welcome: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  subWelcome: { fontSize: 14, color: '#64748B', marginTop: 4 },
  notifBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  dot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFF' },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginLeft: 25, marginBottom: 15 },
  sectionTitleNoMargin: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  viewAll: { color: '#D97706', fontWeight: '700', fontSize: 14 },
  eventCard: { marginHorizontal: 25, backgroundColor: '#0F172A', borderRadius: 28, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 35 },
  eventMain: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 20, alignItems: 'center', minWidth: 65 },
  dateDay: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  dateMonth: { fontSize: 10, fontWeight: '800', color: '#D97706' },
  eventDetails: { flex: 1, marginLeft: 20 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  categoryTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '800', color: '#B45309', textTransform: 'uppercase' },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 10, fontWeight: '800', color: '#CBD5E1' },
  eventTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  eventPet: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  emptyCard: { marginHorizontal: 25, padding: 30, backgroundColor: '#F8FAFC', borderRadius: 28, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 10, fontSize: 14, fontWeight: '600' },
  bookBtn: { marginTop: 15, backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  bookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 15, marginBottom: 25 },
  gridItem: { width: '47%', alignItems: 'center', padding: 15 },
  iconBox: { width: '100%', height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gridLabel: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  petsScroll: { paddingLeft: 25, paddingRight: 10 },
  petCard: { width: 130, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 24, marginRight: 15, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  petAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 10, elevation: 2 },
  petName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  petRaza: { fontSize: 11, color: '#64748B', marginTop: 2 },
  addPetCard: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  addPetText: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginTop: 5 }
});