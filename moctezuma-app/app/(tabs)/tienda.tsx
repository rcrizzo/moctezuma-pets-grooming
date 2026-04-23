import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase'; // <-- Asegúrate de que la ruta a tu firebase.ts sea correcta

export default function TiendaScreen() {
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // --- CONEXIÓN A FIREBASE EN TIEMPO REAL ---
  useEffect(() => {
    const q = query(collection(db, 'inventario'), orderBy('nombre', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(lista);
      setCargando(false);
    });

    return () => unsub(); // Limpiamos la escucha al salir de la pantalla
  }, []);

  // --- COMPONENTE DE TARJETA ADAPTADO A FIREBASE ---
  const ProductCard = ({ id, name, price, category, stock }: { id: string, name: string, price: number, category: string, stock: number }) => (
    <TouchableOpacity 
      style={[styles.productCard, stock <= 0 && { opacity: 0.6 }]} // Se opaca si no hay stock
      onPress={() => stock > 0 ? router.push(`../producto/${id}`) : null}
      activeOpacity={stock > 0 ? 0.2 : 1}
    >
      <View style={styles.productImagePlaceholder}>
        <Ionicons name="cube-outline" size={40} color="#CBD5E1" />
      </View>
      <Text style={styles.productCategory}>{category.toUpperCase()}</Text>
      <Text style={styles.productName} numberOfLines={2}>{name}</Text>
      
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>${price}</Text>
        
        {stock > 0 ? (
          <View style={styles.addButton}>
            <Ionicons name="chevron-forward" size={18} color="white" />
          </View>
        ) : (
          <View style={[styles.addButton, { backgroundColor: '#EF4444', width: 'auto', paddingHorizontal: 8 }]}>
            <Text style={{color: 'white', fontSize: 10, fontWeight: 'bold'}}>AGOTADO</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Tienda</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => router.push('../carrito')}>
            <Ionicons name="cart-outline" size={26} color="#0F172A" />
            <View style={styles.cartBadge}><Text style={styles.badgeText}>2</Text></View>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#D97706" />
            <Text style={{ marginTop: 10, color: '#64748B' }}>Cargando catálogo...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.productsGrid}>
            {productos.map((prod) => (
              <ProductCard 
                key={prod.id} 
                id={prod.id} 
                name={prod.nombre} 
                // AQUÍ ESTÁ EL TRUCO: Le decimos que busque cualquiera de estos nombres
                price={prod.precioVenta || prod.precio || prod.costo || 0} 
                category={prod.categoria || 'Sin Categoría'} 
                stock={prod.stock || 0}
              />
            ))}
            {productos.length === 0 && (
              <Text style={{ width: '100%', textAlign: 'center', color: '#94A3B8', marginTop: 20 }}>
                No hay productos disponibles por el momento.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Tus estilos se mantienen EXACTAMENTE iguales
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 25, paddingTop: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  cartBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cartBadge: { position: 'absolute', top: -5, right: -5, width: 20, height: 20, backgroundColor: '#D97706', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 40 },
  productCard: { width: '47%', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  productImagePlaceholder: { width: '100%', height: 120, backgroundColor: '#F8FAFC', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  productCategory: { fontSize: 10, fontWeight: '800', color: '#D97706', letterSpacing: 1, marginBottom: 4 },
  productName: { fontSize: 14, fontWeight: '700', color: '#0F172A', height: 40 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  productPrice: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  addButton: { height: 32, backgroundColor: '#0F172A', borderRadius: 10, alignItems: 'center', justifyContent: 'center', minWidth: 32 }
});