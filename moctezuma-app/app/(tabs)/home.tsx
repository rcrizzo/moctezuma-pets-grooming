import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function HomeScreen() {
  const [userName, setUserName] = useState('Usuario');
  const [dashboardId, setDashboardId] = useState<string | null>(null);
  const [proximoEvento, setProximoEvento] = useState<any>(null);
  const [misMascotas, setMisMascotas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Sincronización con el ID del Dashboard
    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const unsubUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) {
        const userDoc = snap.docs[0];
        const data = userDoc.data();
        const primerNombre = data.nombre ? data.nombre.split(' ')[0] : 'Usuario';
        setUserName(primerNombre);
        setDashboardId(userDoc.id); 
      }
    });

    return () => unsubUser();
  }, []);

  useEffect(() => {
    if (!dashboardId) return; 

    // 2. Escuchar Mascotas (Asegurando que los campos existan)
    const qMascotas = query(collection(db, 'mascotas'), where('duenoId', '==', dashboardId));
    const unsubMascotas = onSnapshot(qMascotas, (snap) => {
      const lista = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setMisMascotas(lista);
    });

    // 3. Próximo Evento
    const hoy = new Date();
    const qGrooming = query(
      collection(db, 'grooming'),
      where('duenoId', '==', dashboardId),
      where('fechaTimestamp', '>=', hoy),
      orderBy('fechaTimestamp', 'asc'),
      limit(1)
    );

    const unsubGrooming = onSnapshot(qGrooming, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setProximoEvento({
          titulo: data.servicio || 'Servicio de Estética',
          mascota: data.mascotaNombre,
          fecha: data.fechaTimestamp?.toDate(),
        });
      } else {
        setProximoEvento(null);
      }
      setCargando(false);
    });

    return () => {
      unsubMascotas();
      unsubGrooming();
    };
  }, [dashboardId]);

  const formatearFecha = (fecha: Date) => {
    if (!fecha) return '';
    const diff = Math.ceil((fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.greetingSection}>
          <Text style={styles.welcomeText}>Hola de nuevo,</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notificaciones')}>
          <Ionicons name="notifications-outline" size={28} color="#0F172A" />
          <View style={styles.notifBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* PROXIMO EVENTO */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>PRÓXIMO EVENTO</Text>
            {cargando ? (
              <ActivityIndicator color="#D97706" style={{ alignSelf: 'flex-start', marginVertical: 10 }} />
            ) : proximoEvento ? (
              <>
                <Text style={styles.statusTitle}>{proximoEvento.titulo}</Text>
                <Text style={styles.statusPet}>
                  {proximoEvento.mascota} • {formatearFecha(proximoEvento.fecha)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.statusTitle}>Sin pendientes</Text>
                <Text style={styles.statusPet}>¡Todo al día con tus mascotas!</Text>
              </>
            )}
          </View>
          <TouchableOpacity style={styles.statusAction} onPress={() => router.push('/citas')}>
            <Text style={styles.statusActionText}>{proximoEvento ? 'Ver Detalles' : 'Agendar Ahora'}</Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORÍAS 2x2 */}
        <View style={styles.categoryGrid}>
          <CategoryCard icon="cut" label="Estética" color="#FEF3C7" iconColor="#D97706" route="/agendar" param="grooming" />
          <CategoryCard icon="medkit" label="Veterinaria" color="#E0F2FE" iconColor="#0284C7" route="/agendar" param="veterinaria" />
          <CategoryCard icon="home" label="Hospedaje" color="#ECFDF5" iconColor="#10B981" route="/agendar" param="hospedaje" />
          <CategoryCard icon="cart" label="Tienda" color="#F8FAFC" iconColor="#475569" route="/tienda" />
        </View>

        {/* MIS MASCOTAS (Renderizado Corregido) */}
        <Text style={styles.sectionTitle}>Mis Mascotas</Text>
        {misMascotas.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsScroll}>
            {misMascotas.map((pet) => (
              <TouchableOpacity 
                key={pet.id} 
                style={styles.petCard} 
                onPress={() => router.push({ pathname: '/carnet', params: { petId: pet.id } })}
              >
                <View style={styles.petIconContainer}>
                   <Text style={{fontSize: 32}}>{pet.tipo === 'Gato' || pet.tipo === 'gato' ? '🐱' : '🐶'}</Text>
                </View>
                <View style={styles.petTextContainer}>
                  <Text style={styles.petName} numberOfLines={1}>{pet.nombre || 'Sin nombre'}</Text>
                  <Text style={styles.petInfo} numberOfLines={1}>{pet.raza || 'Mascota'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPetsContainer}>
            <Ionicons name="paw-outline" size={40} color="#CBD5E1" />
            <Text style={styles.noPetsText}>Aún no tienes mascotas asignadas</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const CategoryCard = ({ icon, label, color, iconColor, route, param }: any) => (
  <TouchableOpacity 
    style={styles.catCard} 
    onPress={() => router.push({ pathname: route, params: param ? { servicio: param } : {} })}
  >
    <View style={[styles.catIconBox, { backgroundColor: color }]}>
      <Ionicons name={icon} size={26} color={iconColor} />
    </View>
    <Text style={styles.catCardLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 10, marginBottom: 20 },
  greetingSection: { flex: 1 },
  welcomeText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  iconBtn: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  notifBadge: { position: 'absolute', top: 14, right: 14, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFFFFF' },
  statusCard: { backgroundColor: '#0F172A', padding: 25, borderRadius: 30, marginHorizontal: 25, marginBottom: 30 },
  statusInfo: { marginBottom: 5 },
  statusLabel: { color: '#D97706', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  statusTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  statusPet: { color: '#94A3B8', fontSize: 14, marginTop: 4 },
  statusAction: { backgroundColor: '#D97706', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 15 },
  statusActionText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 25, justifyContent: 'space-between', marginBottom: 30 },
  catCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 10 },
  catIconBox: { width: 55, height: 55, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  catCardLabel: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginLeft: 25, marginBottom: 15 },
  petsScroll: { paddingLeft: 25, paddingRight: 10 },
  
  // TARJETA DE MASCOTA MEJORADA
  petCard: { 
    width: 150, 
    backgroundColor: '#F8FAFC', 
    padding: 15, 
    borderRadius: 28, 
    marginRight: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    justifyContent: 'center'
  },
  petIconContainer: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  petTextContainer: { alignItems: 'center', width: '100%' },
  petName: { fontSize: 17, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  petInfo: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '500' },

  noPetsContainer: { marginHorizontal: 25, padding: 40, borderRadius: 24, backgroundColor: '#F8FAFC', borderStyle: 'dashed', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center' },
  noPetsText: { color: '#64748B', fontWeight: '600', marginTop: 10, textAlign: 'center' }
});