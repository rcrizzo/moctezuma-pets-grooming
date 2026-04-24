// Archivo: app/carrito.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, query, where, getDocs } from 'firebase/firestore'; // Importes añadidos: doc, getDoc
import { auth, db } from '../firebase';
import { useCart } from '../context/CartContext';

export default function CarritoScreen() {
  const { cartItems, updateQty, removeItem, clearCart, subtotal, total } = useCart();
  const [procesando, setProcesando] = useState(false);

  const handleConfirmarApartado = async () => {
    if (cartItems.length === 0) return Alert.alert("Carrito vacío", "Agrega productos.");

    setProcesando(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión.");
        setProcesando(false);
        return;
      }

      // Obtenemos tu nombre real de la base de datos
      // Obtenemos tu nombre real buscando el campo 'uid'
      const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
      const userSnap = await getDocs(qUser);

      const nombreReal = !userSnap.empty ? userSnap.docs[0].data().nombre : "Usuario App";

      const nuevoPedido = {
        clienteId: user.uid,
        clienteNombre: nombreReal, // ¡Aparecerá correctamente en el Dashboard!
        items: cartItems.map((item: any) => ({
          id: item.id,
          nombre: item.nombre,
          precioVenta: item.precioVenta,
          qty: item.qty
        })),
        total: total,
        estado: 'Pendiente de Recolección',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'pedidos'), nuevoPedido);

      clearCart();
      Alert.alert(
        "¡Pedido Apartado!",
        "Tus productos han sido reservados. Puedes pasar a recogerlos y pagar en mostrador.",
        [{ text: "OK", onPress: () => router.replace('/(tabs)/home') }]
      );

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No pudimos procesar tu pedido.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Carrito</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={{ color: '#64748B', fontWeight: '600' }}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {cartItems.map((item: any) => (
          <View key={item.id} style={styles.cartItem}>
            <View style={styles.itemImage}>
              <Ionicons name="cube-outline" size={30} color="#94A3B8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemPrice}>${item.precioVenta.toFixed(2)}</Text>
            </View>
            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn}>
                <Ionicons name="remove" size={18} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn}>
                <Ionicons name="add" size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {cartItems.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumen de Apartado</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Gestión de inventario</Text>
              <Text style={styles.summaryValue}>Gratis</Text>
            </View>
            <View style={[styles.summaryRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
              <Text style={[styles.summaryLabel, { color: '#0F172A', fontWeight: '800' }]}>Total a pagar</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#D97706' }}>${total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
        <TouchableOpacity
          style={[styles.confirmBtn, procesando && { opacity: 0.7 }]}
          onPress={handleConfirmarApartado}
          disabled={procesando}
        >
          {procesando ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Confirmar Apartado</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
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
  confirmBtn: { backgroundColor: '#10B981', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});