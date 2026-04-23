// Archivo: app/producto/[id].tsx
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Ruta a firebase.ts
import { useCart } from '../../context/CartContext'; // Importamos el carrito

export default function DetalleProducto() {
  const { id } = useLocalSearchParams();
  const [cantidad, setCantidad] = useState(1);
  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  const { addToCart } = useCart(); // Extraemos la función de agregar

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'inventario', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProducto({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error al obtener producto:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchProducto();
  }, [id]);

  if (cargando) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D97706" />
        <Text style={{ marginTop: 10, color: '#64748B' }}>Cargando detalles...</Text>
      </SafeAreaView>
    );
  }

  if (!producto) return <SafeAreaView style={styles.safeArea}><Text>Error</Text></SafeAreaView>;

  const precioReal = producto.precioVenta || producto.precio || producto.costo || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Ionicons name="image-outline" size={120} color="#CBD5E1" />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>{(producto.categoria || 'PRODUCTO').toUpperCase()}</Text>
          <Text style={styles.title}>{producto.nombre}</Text>
          <Text style={styles.price}>${precioReal.toFixed(2)}</Text>

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {producto.descripcion || 'Sin descripción disponible para este producto.'}
          </Text>

          <Text style={styles.sectionTitle}>Cantidad</Text>
          <View style={styles.selectorContainer}>
            <View style={styles.counter}>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setCantidad(c => c > 1 ? c - 1 : 1)}>
                <Ionicons name="remove" size={20} color="#0F172A" />
              </TouchableOpacity>
              <Text style={{ paddingHorizontal: 15, fontWeight: '800', fontSize: 16 }}>{cantidad}</Text>
              <TouchableOpacity style={styles.counterBtn} onPress={() => setCantidad(c => c + 1)}>
                <Ionicons name="add" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#64748B', fontWeight: '600' }}>En stock: {producto.stock || 0}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
        <TouchableOpacity 
          style={[styles.addBtn, producto.stock <= 0 && { backgroundColor: '#94A3B8' }]}
          disabled={producto.stock <= 0}
          onPress={() => {
            addToCart(producto, cantidad, precioReal); // <-- ¡Agregamos a la memoria global!
            router.back(); 
          }}
        >
          <Text style={styles.addBtnText}>
            {producto.stock > 0 ? `Agregar al Carrito - $${(precioReal * cantidad).toFixed(2)}` : 'Producto Agotado'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  shareBtn: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  imageContainer: { width: '100%', height: 300, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  infoContainer: { padding: 25 },
  category: { color: '#D97706', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 10 },
  price: { fontSize: 22, fontWeight: '700', color: '#D97706', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 30, marginBottom: 10 },
  description: { fontSize: 15, color: '#64748B', lineHeight: 24 },
  selectorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 5 },
  counterBtn: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center' },
  addBtn: { backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});