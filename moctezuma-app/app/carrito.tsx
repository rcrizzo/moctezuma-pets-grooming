// Archivo: app/carrito.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Ruta a firebase.ts
import { useCart } from '../context/CartContext'; // Importamos el carrito

export default function CarritoScreen() {
  const { cartItems, updateQty, removeItem, clearCart, subtotal, total } = useCart();
  const [procesando, setProcesando] = useState(false);

  const handleConfirmarApartado = async () => {
    if (cartItems.length === 0) return Alert.alert("Carrito vacío", "Agrega productos.");
    
    setProcesando(true);
    try {
      const nuevoPedido = {
        clienteId: 'cliente_demo_123',
        clienteNombre: 'Juan Pérez',
        items: cartItems,
        total: total,
        estado: 'Pendiente de Recolección',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'pedidos'), nuevoPedido);

      clearCart(); // Vaciamos el carrito tras comprar
      Alert.alert(
        "¡Pedido Apartado!",
        "Tu lista ha sido enviada a sucursal. Te esperamos para la recolección.",
        [{ text: "Entendido", onPress: () => router.push('/(tabs)/home') }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al procesar tu pedido.");
    } finally {
      setProcesando(false);
    }
  };

  const CartItem = ({ item }: { item: any }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImage}>
        <Ionicons name="cube-outline" size={24} color="#94A3B8" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.itemPrice}>${item.precioVenta.toFixed(2)}</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
          <Ionicons name="remove" size={16} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
          <Ionicons name="add" size={16} color="#0F172A" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={{ marginLeft: 10, padding: 5 }} onPress={() => removeItem(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={procesando}>
          <Ionicons name="arrow-back" size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {cartItems.length > 0 ? (
          cartItems.map((item: any) => <CartItem key={item.id} item={item} />)
        ) : (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Ionicons name="cart-outline" size={80} color="#E2E8F0" />
            <Text style={{ color: '#94A3B8', marginTop: 15, fontSize: 16 }}>Tu carrito está vacío.</Text>
          </View>
        )}

        {cartItems.length > 0 && (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Resumen de Orden</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} items)</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Recolección en sucursal</Text>
                <Text style={styles.summaryValue}>Gratis</Text>
              </View>
              <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 15, marginTop: 5 }]}>
                <Text style={[styles.summaryLabel, { fontWeight: '800', color: '#0F172A' }]}>Total a pagar</Text>
                <Text style={[styles.summaryValue, { fontSize: 18, color: '#D97706' }]}>${total.toFixed(2)}</Text>
              </View>
            </View>

            {/* AVISO IMPORTANTE LOGÍSTICO */}
            <View style={styles.infoAlert}>
              <Ionicons name="information-circle" size={24} color="#D97706" />
              <Text style={{ flex: 1, color: '#92400E', fontSize: 13, lineHeight: 18 }}>
                Al confirmar, apartaremos estos productos por 24 horas. El pago se realiza directamente en mostrador.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.checkoutBtn, (cartItems.length === 0 || procesando) && { opacity: 0.6 }]}
          onPress={handleConfirmarApartado}
          disabled={cartItems.length === 0 || procesando}
        >
          {procesando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.checkoutBtnText}>Confirmar Apartado</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  container: { padding: 20, paddingBottom: 100 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  itemImage: { width: 60, height: 60, backgroundColor: '#E2E8F0', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  itemPrice: { fontSize: 14, color: '#D97706', fontWeight: '600', marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 4, marginLeft: 10 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyText: { paddingHorizontal: 10, fontWeight: '800', fontSize: 14 },
  summaryContainer: { marginTop: 30, padding: 20, backgroundColor: '#F1F5F9', borderRadius: 24 },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { color: '#64748B', fontSize: 14 },
  summaryValue: { color: '#0F172A', fontSize: 14, fontWeight: '600' },
  infoAlert: { flexDirection: 'row', gap: 10, marginTop: 25, padding: 15, backgroundColor: '#FFFBEB', borderRadius: 15, borderWidth: 1, borderColor: '#FEF3C7' },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  checkoutBtn: { backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});