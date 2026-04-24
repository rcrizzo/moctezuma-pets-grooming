import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // <--- Esto desactiva el título superior para TODOS los tabs
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: Platform.OS === 'ios' ? 90 : 70,
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Inicio', 
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> 
        }} 
      />
      
      <Tabs.Screen 
        name="citas" 
        options={{ 
          title: 'Citas', 
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> 
        }} 
      />
      
      {/* TAB CENTRAL */}
      <Tabs.Screen
        name="carnet"
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.highlightedBtn, { backgroundColor: focused ? '#D97706' : '#0F172A' }]}>
              {/* Cambia "paw" por el ícono que elijas de la lista de abajo */}
              <Ionicons name="paw" size={28} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      <Tabs.Screen 
        name="tienda" 
        options={{ 
          title: 'Tienda', 
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} /> 
        }} 
      />

      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: 'Perfil', 
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  highlightedBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 5,
  },
});