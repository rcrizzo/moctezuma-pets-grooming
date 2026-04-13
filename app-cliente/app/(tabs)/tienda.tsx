import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TiendaScreen() {
  const ProductCard = ({ id, name, price, category }: { id: string, name: string, price: string, category: string }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => router.push(`../producto/${id}`)}
    >
      <View style={styles.productImagePlaceholder}>
        <Ionicons name="image-outline" size={40} color="#CBD5E1" />
      </View>
      <Text style={styles.productCategory}>{category}</Text>
      <Text style={styles.productName}>{name}</Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>{price}</Text>
        <View style={styles.addButton}>
          <Ionicons name="chevron-forward" size={18} color="white" />
        </View>
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

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.productsGrid}>
          <ProductCard id="1" name="Croquetas Premium Adulto" price="$850.00" category="ALIMENTO" />
          <ProductCard id="2" name="Shampoo Antipulgas" price="$210.00" category="HIGIENE" />
          <ProductCard id="3" name="Correa de Piel Gold" price="$340.00" category="ACCESORIOS" />
          <ProductCard id="4" name="Snacks Dentales" price="$120.00" category="ALIMENTO" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  addButton: { width: 32, height: 32, backgroundColor: '#0F172A', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }
});