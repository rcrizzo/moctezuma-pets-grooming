import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Iconos estándar de Expo

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#D97706', // Oro Ámbar
      tabBarInactiveTintColor: '#94A3B8',
      tabBarStyle: styles.tabBar,
      tabBarLabelStyle: styles.tabBarLabel,
    }}>
      <Tabs.Screen name="home" options={{
        title: 'Inicio',
        tabBarIcon: ({ color }) => <Ionicons name="home-sharp" size={24} color={color} />,
      }} />
      
      <Tabs.Screen name="citas" options={{
        title: 'Citas',
        tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
      }} />

      {/* BOTÓN CENTRAL: CARNET */}
      <Tabs.Screen name="carnet" options={{
        title: '',
        tabBarIcon: ({ focused }) => (
          <View style={[styles.centralButton, focused && styles.centralButtonActive]}>
            <Ionicons name="medical" size={30} color="white" />
          </View>
        ),
      }} />

      <Tabs.Screen name="tienda" options={{
        title: 'Tienda',
        tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
      }} />

      <Tabs.Screen name="perfil" options={{
        title: 'Perfil',
        tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 90,
    paddingTop: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  tabBarLabel: { fontSize: 11, fontWeight: '700' },
  centralButton: {
    width: 64,
    height: 64,
    backgroundColor: '#0F172A', // Deep Slate del logo
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Lo hace sobresalir
    shadowColor: '#0F172A',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  centralButtonActive: {
    backgroundColor: '#D97706', // Cambia a Oro cuando está activo
  }
});