import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext'; // Ajusta la ruta

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notificaciones" options={{ presentation: 'modal' }} />
        <Stack.Screen name="agendar" />
        <Stack.Screen name="carrito" />
      </Stack>
    </ThemeProvider>
  );
}