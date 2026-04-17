import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext'; 
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="notificaciones" options={{ presentation: 'modal' }} />
          <Stack.Screen name="agendar" />
          <Stack.Screen name="carrito" />
        </Stack>
      </CartProvider>
    </ThemeProvider>
  );
}