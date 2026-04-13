import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function CarnetScreen() {
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'vacunas' | 'parasitos'>('vacunas');

  // --- DATOS DE MASCOTAS (Ficha Técnica) ---
  const misMascotas = [
    { id: '1', nombre: 'Boby', raza: 'French Poodle', edad: '4 años', peso: '4.9 Kg', icono: '🐩', color: '#FEF3C7' },
    { id: '2', nombre: 'Rocky', raza: 'Husky Siberiano', edad: '2 años', peso: '22.5 Kg', icono: '🐕', color: '#E0F2FE' },
    { id: '3', nombre: 'Luna', raza: 'Golden Retriever', edad: '1 año', peso: '18.2 Kg', icono: '🐕‍🦺', color: '#FCE7F3' },
  ];

  // --- COMPONENTES DE LA CARTILLA REALISTA ---
  const VaccineSticker = ({ name, color }: { name: string, color: string }) => (
    <View style={[styles.sticker, { borderLeftColor: color }]}>
      <Text style={styles.stickerText}>{name}</Text>
      <View style={styles.barcodeRow}>
        <Ionicons name="barcode-outline" size={14} color="#94A3B8" />
        <Text style={styles.stickerSerial}>Lote: 84729A</Text>
      </View>
    </View>
  );

  const StampSignature = ({ name }: { name: string }) => (
    <View style={styles.stampContainer}>
      <Text style={styles.stampSignature}>MVZ. {name}</Text>
      <Text style={styles.stampCedula}>Ced. Prof. 11536014</Text>
    </View>
  );

  // --- VISTA 1: SELECCIÓN DE MASCOTA (PORTADA) ---
  if (!mascotaSeleccionada) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.selectionContainer}>
          <Text style={styles.mainTitle}>Mis Mascotas</Text>
          <Text style={styles.mainSubtitle}>Selecciona un perfil para consultar su carnet digital.</Text>

          {misMascotas.map((pet) => (
            <TouchableOpacity 
              key={pet.id} 
              style={styles.petProfileCard}
              onPress={() => setMascotaSeleccionada(pet)}
            >
              <View style={[styles.petImageCircle, { backgroundColor: pet.color }]}>
                <Text style={{ fontSize: 40 }}>{pet.icono}</Text>
              </View>
              <View style={styles.petInfoText}>
                <Text style={styles.petNameTitle}>{pet.nombre}</Text>
                <Text style={styles.petBreedText}>{pet.raza}</Text>
                <View style={styles.petStatsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.statText}>{pet.edad}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="fitness-outline" size={14} color="#64748B" />
                    <Text style={styles.statText}>{pet.peso}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- VISTA 2: CARTILLA DETALLADA (EL "LIBRO") ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMascotaSeleccionada(null)}>
          <Ionicons name="arrow-back" size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cartilla de {mascotaSeleccionada.nombre}</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.tabsWrapper}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'vacunas' && styles.tabBtnActive]}
          onPress={() => setActiveTab('vacunas')}
        >
          <Text style={[styles.tabText, activeTab === 'vacunas' && styles.tabTextActive]}>VACUNACIÓN</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'parasitos' && styles.tabBtnActive]}
          onPress={() => setActiveTab('parasitos')}
        >
          <Text style={[styles.tabText, activeTab === 'parasitos' && styles.tabTextActive]}>PARÁSITOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.bookletContent}>
        <View style={styles.tableHeader}>
          <Text style={styles.thText}>FECHA</Text>
          <Text style={[styles.thText, { flex: 2 }]}>{activeTab === 'vacunas' ? 'VACUNA' : 'PRODUCTO'}</Text>
          <Text style={styles.thText}>PRÓXIMA</Text>
          <Text style={styles.thText}>FIRMA</Text>
        </View>

        {/* Ejemplo de registro basado en tus fotos */}
        <View style={styles.tableRow}>
          <Text style={styles.tdTextDate}>25/OCT/24</Text>
          <View style={{ flex: 2, paddingRight: 10 }}>
            <VaccineSticker name={activeTab === 'vacunas' ? "Peek N-RB" : "Nexgard Spectra"} color="#D97706" />
          </View>
          <Text style={styles.tdTextDate}>25/OCT/25</Text>
          <View style={styles.tdFirma}>
            <StampSignature name="López S." />
          </View>
        </View>

        {/* Marca de agua de fondo */}
        <View style={styles.watermarkContainer} pointerEvents="none">
          <Ionicons name="paw" size={150} color="rgba(241, 245, 249, 0.4)" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  selectionContainer: { padding: 25 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  mainSubtitle: { fontSize: 15, color: '#64748B', marginBottom: 30, lineHeight: 22 },
  
  // Tarjetas de Selección
  petProfileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  petImageCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginRight: 20 },
  petInfoText: { flex: 1 },
  petNameTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  petBreedText: { fontSize: 14, color: '#64748B', marginTop: 2 },
  petStatsRow: { flexDirection: 'row', marginTop: 10, gap: 15 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  // Estilos de la Cartilla (Vista Libro)
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  tabsWrapper: { flexDirection: 'row', paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#D97706' },
  tabText: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  tabTextActive: { color: '#D97706' },

  bookletContent: { padding: 15, paddingBottom: 40 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 5 },
  thText: { flex: 1, color: '#FFFFFF', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tdTextDate: { flex: 1, fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center', alignSelf: 'center' },
  tdFirma: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  sticker: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 5, borderRadius: 6, padding: 6 },
  stickerText: { fontSize: 11, fontWeight: '800', color: '#0F172A' },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  stickerSerial: { fontSize: 7, color: '#94A3B8' },

  stampContainer: { alignItems: 'center' },
  stampSignature: { fontSize: 10, fontWeight: '700', color: '#1E3A8A', fontStyle: 'italic' },
  stampCedula: { fontSize: 7, color: '#64748B' },
  watermarkContainer: { position: 'absolute', top: 100, left: 0, right: 0, alignItems: 'center', zIndex: -1 }
});