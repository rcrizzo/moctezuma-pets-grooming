import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';

export default function PerfilScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  // GUARDAR DATOS DEL USUARIO Y GENERAR INICIALES DINÁMICAS
  const [userData, setUserData] = useState({ nombre: 'Usuario', email: '', telefono: '' });
  const [iniciales, setIniciales] = useState('U');

  // TRAER DATOS DEL USUARIO EN TIEMPO REAL
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const unsubUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        
        const nombreReal = data.nombre || 'Usuario';
        
        setUserData({
          nombre: nombreReal,
          email: data.email || user.email || '',
          telefono: data.telefono || 'Sin teléfono'
        });

        const partesNombre = nombreReal.trim().split(' ');
        if (partesNombre.length >= 2) {
          setIniciales((partesNombre[0][0] + partesNombre[1][0]).toUpperCase());
        } else {
          setIniciales(partesNombre[0][0].toUpperCase());
        }
      }
    });

    return () => unsubUser();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</Text>
  );

  const ProfileOption = ({ icon, title, value, onPress, isSwitch = false }: any) => (
    <TouchableOpacity 
      style={[styles.optionRow, { borderBottomColor: colors.border }]} 
      onPress={onPress} 
      disabled={isSwitch || !onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.accent + '15' }]}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
        {value ? <Text style={[styles.optionValue, { color: colors.subtext }]}>{value}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch 
          value={isDark} 
          onValueChange={toggleTheme} 
          trackColor={{ false: "#E2E8F0", true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      ) : (
        onPress && <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Perfil</Text>

        {/* CABECERA */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.text, borderColor: colors.surface }]}>
              <Text style={[styles.avatarText, { color: colors.background }]}>{iniciales}</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{userData.nombre}</Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]}>{userData.email}</Text>
        </View>

        {/* GRUPO DE OPCIONES */}
        <SectionTitle title="CONFIGURACIÓN DE CUENTA" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ProfileOption 
            icon="person-outline" 
            title="Información Personal" 
            value={`${userData.nombre.split(' ')[0]} • ${userData.telefono}`} 
          />
          <ProfileOption 
            icon="moon-outline" 
            title="Modo Oscuro" 
            isSwitch={true} 
          />
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.errorBg }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={styles.versionInfo}>
          <Text style={[styles.versionText, { color: colors.subtext }]}>Moctezuma Pet's Grooming v1.0.2</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 120 },
  screenTitle: { fontSize: 30, fontWeight: '900', marginBottom: 35 },
  userCard: { alignItems: 'center', marginBottom: 40 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', borderWidth: 5 },
  avatarText: { fontSize: 44, fontWeight: '900' },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 15, textAlign: 'center' },
  userEmail: { fontSize: 15, marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 15, marginLeft: 5 },
  group: { borderRadius: 28, paddingHorizontal: 20, paddingVertical: 5, marginBottom: 30, borderWidth: 1 },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  optionTitle: { fontSize: 16, fontWeight: '700' },
  optionValue: { fontSize: 12, marginTop: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 20, borderRadius: 22, marginTop: 10 },
  logoutText: { fontSize: 17, fontWeight: '800' },
  versionInfo: { alignItems: 'center', marginTop: 40 },
  versionText: { fontSize: 12, fontWeight: '600' }
});