import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export default function CarnetScreen() {
  const { petId } = useLocalSearchParams(); // Recibimos el ID si viene desde Home
  const [loading, setLoading] = useState(true);
  const [misMascotas, setMisMascotas] = useState<any[]>([]);
  const [mascotaSel, setMascotaSel] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'vacunas' | 'parasitos'>('vacunas');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Buscamos todas las mascotas del usuario en tiempo real
    // Nota: Usamos la lógica de dashboardId que ya sincronizamos en Home
    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    
    const unsubMascotas = onSnapshot(qUser, (userSnap) => {
      if (!userSnap.empty) {
        const dId = userSnap.docs[0].id;
        const qM = query(collection(db, 'mascotas'), where('duenoId', '==', dId));
        
        onSnapshot(qM, (petSnap) => {
          const lista = petSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setMisMascotas(lista);
          
          // 2. Si venimos de Home con un petId, seleccionamos esa mascota
          if (petId) {
            const encontrada = lista.find(p => p.id === petId);
            if (encontrada) setMascotaSel(encontrada);
          } else if (lista.length > 0 && !mascotaSel) {
            setMascotaSel(lista[0]); // Por defecto la primera
          }
          setLoading(false);
        });
      }
    });

    return () => unsubMascotas();
  }, [petId]);

  if (loading) {
    return (
      <View style={styles.centered}><ActivityIndicator color="#D97706" size="large" /></View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Carnet Digital</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SELECTOR DE MASCOTAS (Burbujas) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
          {misMascotas.map((pet) => (
            <TouchableOpacity 
              key={pet.id} 
              onPress={() => setMascotaSel(pet)}
              style={[styles.petBubble, mascotaSel?.id === pet.id && styles.petBubbleActive]}
            >
              <Text style={{fontSize: 24}}>{pet.tipo === 'Gato' ? '🐱' : '🐶'}</Text>
              <Text style={[styles.petBubbleName, mascotaSel?.id === pet.id && styles.petBubbleNameActive]}>
                {pet.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {mascotaSel ? (
          <View style={styles.content}>
            {/* FICHA TÉCNICA TIPO PASAPORTE */}
            <View style={styles.idCard}>
              <View style={styles.idCardHeader}>
                <Ionicons name="paw" size={20} color="#FFFFFF" />
                <Text style={styles.idCardTitle}>MOCTEZUMA PET ID</Text>
              </View>
              
              <View style={styles.idCardBody}>
                <View style={styles.idPhotoBox}>
                  <Text style={{fontSize: 40}}>{mascotaSel.tipo === 'Gato' ? '🐱' : '🐶'}</Text>
                </View>
                
                <View style={styles.idInfoGrid}>
                  <InfoItem label="NOMBRE" value={mascotaSel.nombre} />
                  <InfoItem label="RAZA" value={mascotaSel.raza} />
                  <RowInfo>
                    <InfoItem label="EDAD" value={mascotaSel.edad || 'N/A'} />
                    <InfoItem label="PESO" value={mascotaSel.peso || 'N/A'} />
                  </RowInfo>
                  <InfoItem label="COLOR" value={mascotaSel.colorMascota || 'N/A'} />
                </View>
              </View>
            </View>

            {/* TABS DE LA CARTILLA */}
            <View style={styles.tabContainer}>
              <TabBtn active={activeTab === 'vacunas'} label="VACUNAS" onPress={() => setActiveTab('vacunas')} />
              <TabBtn active={activeTab === 'parasitos'} label="DESPARASITACIÓN" onPress={() => setActiveTab('parasitos')} />
            </View>

            {/* TABLA DE REGISTROS MÉDICOS */}
            <View style={styles.recordsTable}>
              <View style={styles.tableHead}>
                <Text style={styles.th}>FECHA</Text>
                <Text style={[styles.th, {flex: 2}]}>PRODUCTO / DOSIS</Text>
                <Text style={styles.th}>FIRMA</Text>
              </View>
              
              {/* Aquí mapearemos los carnets reales que "sellas" en el Dashboard */}
              <View style={styles.tableBody}>
                <Text style={styles.emptyMsg}>No hay registros recientes para {mascotaSel.nombre}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noData}>
            <Ionicons name="alert-circle-outline" size={50} color="#CBD5E1" />
            <Text style={styles.noDataText}>No tienes mascotas registradas aún.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-componentes para el Carnet
const InfoItem = ({ label, value }: any) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
  </View>
);

const RowInfo = ({ children }: any) => (
  <View style={{ flexDirection: 'row', gap: 20 }}>{children}</View>
);

const TabBtn = ({ active, label, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
    <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 25, paddingTop: 10, marginBottom: 15 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  
  selectorScroll: { paddingLeft: 25, paddingBottom: 10, gap: 15 },
  petBubble: { alignItems: 'center', padding: 12, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#F1F5F9', minWidth: 80 },
  petBubbleActive: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  petBubbleName: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 5 },
  petBubbleNameActive: { color: '#D97706' },

  content: { padding: 25 },
  
  // DISEÑO DE PASAPORTE
  idCard: { backgroundColor: '#0F172A', borderRadius: 28, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  idCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1E293B', paddingVertical: 12, paddingHorizontal: 20 },
  idCardTitle: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  idCardBody: { flexDirection: 'row', padding: 20, gap: 20 },
  idPhotoBox: { width: 90, height: 110, backgroundColor: '#FFFFFF', borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#334155' },
  idInfoGrid: { flex: 1, gap: 10 },
  infoItem: { marginBottom: 2 },
  infoLabel: { fontSize: 8, fontWeight: '800', color: '#D97706' },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', textTransform: 'uppercase' },

  tabContainer: { flexDirection: 'row', marginTop: 30, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 3, borderBottomColor: '#D97706' },
  tabBtnText: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  tabBtnTextActive: { color: '#0F172A' },

  recordsTable: { marginTop: 20, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  tableHead: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 12 },
  th: { flex: 1, fontSize: 10, fontWeight: '800', color: '#64748B', textAlign: 'center' },
  tableBody: { padding: 30, alignItems: 'center' },
  emptyMsg: { color: '#94A3B8', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },

  noData: { alignItems: 'center', marginTop: 100 },
  noDataText: { color: '#64748B', marginTop: 10, fontWeight: '600' }
});