import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CarritoScreen() {
  const CartItem = ({ name, price, qty }: { name: string, price: string, qty: number }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImage}><Ionicons name="cube-outline" size={24} color="#94A3B8" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemPrice}>{price}</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity style={styles.qtyBtn}><Ionicons name="remove" size={16} color="#0F172A" /></TouchableOpacity>
        <Text style={styles.qtyText}>{qty}</Text>
        <TouchableOpacity style={styles.qtyBtn}><Ionicons name="add" size={16} color="#0F172A" /></TouchableOpacity>
      </View>
    </View>
  );

  const handleConfirmarApartado = () => {
    // Aquí a futuro irá la conexión a Firebase para mandar el pedido al dashboard web
    Alert.alert(
      "¡Pedido Apartado!",
      "Tu lista ha sido enviada al sistema de la sucursal. Te esperamos en mostrador para la entrega y el pago.",
      [{ text: "Entendido", onPress: () => router.replace('/(tabs)/tienda') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#0F172A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <CartItem name="Croquetas Premium Adulto" price="$850.00" qty={1} />
        <CartItem name="Shampoo Antipulgas" price="$210.00" qty={2} />
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumen del Pedido</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>$1,270.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontWeight: '800', color: '#0F172A' }]}>Total a Pagar en Local</Text>
            <Text style={[styles.summaryValue, { fontWeight: '800', color: '#D97706' }]}>$1,270.00</Text>
          </View>
        </View>

        <View style={styles.infoAlert}>
          <Ionicons name="storefront" size={20} color="#D97706" />
          <Text style={styles.infoAlertText}>
            Tus productos quedarán apartados en nuestro sistema. Podrás recogerlos y realizar el pago directamente en el mostrador de la sucursal.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleConfirmarApartado}>
          <Ionicons name="checkmark-circle" size={22} color="white" />
          <Text style={styles.primaryButtonText}>Confirmar Apartado</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { padding: 25 },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20 },
  itemImage: { width: 50, height: 50, backgroundColor: '#FFFFFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  itemPrice: { fontSize: 14, color: '#D97706', fontWeight: '600', marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 4 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { paddingHorizontal: 10, fontWeight: '800', fontSize: 14 },
  summaryContainer: { marginTop: 30, padding: 20, backgroundColor: '#F1F5F9', borderRadius: 24 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#64748B', fontSize: 14 },
  summaryValue: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  infoAlert: { flexDirection: 'row', gap: 10, marginTop: 25, padding: 15, backgroundColor: '#FFFBEB', borderRadius: 15, borderWidth: 1, borderColor: '#FEF3C7' },
  infoAlertText: { flex: 1, fontSize: 13, color: '#B45309', lineHeight: 18 },
  footer: { padding: 25, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  primaryButton: { backgroundColor: '#D97706', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryButtonText: { color: 'white', fontWeight: '800', fontSize: 16 }
});