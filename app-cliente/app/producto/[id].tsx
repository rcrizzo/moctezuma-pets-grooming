import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function DetalleProducto() {
  const { id } = useLocalSearchParams();
  const [cantidad, setCantidad] = useState(1);

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
          <Ionicons name="image" size={120} color="#E2E8F0" />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>ALIMENTO PREMIUM</Text>
          <Text style={styles.title}>Croquetas Adulto Raza Mediana</Text>
          <Text style={styles.price}>$850.00 MXN</Text>
          
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            Fórmula balanceada con proteínas de alta calidad para mantener la masa muscular y energía de tu mascota. Contiene omegas para un pelaje brillante.
          </Text>

          <View style={styles.selectorContainer}>
            <Text style={styles.sectionTitle}>Cantidad</Text>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => cantidad > 1 && setCantidad(cantidad - 1)} style={styles.counterBtn}>
                <Ionicons name="remove" size={20} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.countText}>{cantidad}</Text>
              <TouchableOpacity onPress={() => setCantidad(cantidad + 1)} style={styles.counterBtn}>
                <Ionicons name="add" size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('../carrito')}>
          <Ionicons name="cart" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Añadir al Carrito</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
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
  countText: { paddingHorizontal: 15, fontSize: 16, fontWeight: '800', color: '#0F172A' },
  footer: { padding: 25, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  primaryButton: { backgroundColor: '#0F172A', paddingVertical: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryButtonText: { color: 'white', fontWeight: '800', fontSize: 16 }
});