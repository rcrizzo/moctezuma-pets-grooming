import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';

const CATEGORIAS = ['Todas', 'Salud', 'Higiene', 'Alimento', 'Accesorios', 'Farmacia'];

export default function TiendaScreen() {
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  useEffect(() => {
    // Escucha dinámica: Si es 'Todas' trae todo, si no, filtra por el campo 'categoria'
    const baseQuery = collection(db, 'inventario');
    const q = categoriaActiva === 'Todas' 
      ? query(baseQuery, orderBy('nombre', 'asc'))
      : query(baseQuery, where('categoria', '==', categoriaActiva), orderBy('nombre', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(lista);
      setCargando(false);
    });

    return () => unsub();
  }, [categoriaActiva]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Tienda</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('/carrito')}>
          <Ionicons name="cart" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* Selector de Categorías */}
      <View style={{ marginBottom: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 25 }}>
          {CATEGORIAS.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setCategoriaActiva(cat)}
              style={[styles.catBtn, categoriaActiva === cat && styles.catBtnActive]}
            >
              <Text style={[styles.catText, categoriaActiva === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {cargando ? (
        <ActivityIndicator color="#D97706" size="large" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.productCard} 
              onPress={() => router.push(`/producto/${item.id}`)}
              disabled={item.stock <= 0}
            >
              <View style={styles.imagePlaceholder}>
                <Ionicons name="cube-outline" size={40} color="#CBD5E1" />
                {item.stock <= 5 && item.stock > 0 && <Badge text="Pocas piezas" color="#EF4444" />}
                {item.stock <= 0 && <Badge text="Agotado" color="#64748B" />}
              </View>
              <Text style={styles.catLabel}>{item.categoria}</Text>
              <Text style={styles.prodName} numberOfLines={1}>{item.nombre}</Text>
              <Text style={styles.prodPrice}>${item.precioVenta.toFixed(2)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const Badge = ({ text, color }: { text: string, color: string }) => (
  <View style={[styles.badge, { backgroundColor: color }]}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
cartBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  catBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', marginRight: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  catBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  catText: { fontWeight: '700', color: '#64748B' },
  catTextActive: { color: '#FFFFFF' },
  grid: { paddingHorizontal: 20, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  imagePlaceholder: { width: '100%', height: 120, backgroundColor: '#F8FAFC', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  catLabel: { fontSize: 10, fontWeight: '800', color: '#D97706', textTransform: 'uppercase' },
  prodName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginTop: 4 },
  prodPrice: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  badge: { position: 'absolute', bottom: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' }
});