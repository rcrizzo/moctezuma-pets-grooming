import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; // Ajusta la ruta

export default function PerfilScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</Text>
  );

  const ProfileOption = ({ icon, title, value, onPress, isSwitch = false }: any) => (
    <TouchableOpacity 
      style={[styles.optionRow, { borderBottomColor: colors.border }]} 
      onPress={onPress} 
      disabled={isSwitch}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.accent + '15' }]}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
        {value && <Text style={[styles.optionValue, { color: colors.subtext }]}>{value}</Text>}
      </View>
      {isSwitch ? (
        <Switch 
          value={isDark} 
          onValueChange={toggleTheme} 
          trackColor={{ false: "#E2E8F0", true: colors.accent }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
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
              <Text style={[styles.avatarText, { color: colors.background }]}>JP</Text>
            </View>
            <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.accent, borderColor: colors.background }]}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>Juan Pérez</Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]}>juanperez@moctezuma.com</Text>
        </View>

        {/* GRUPOS DE OPCIONES */}
        <SectionTitle title="GESTIÓN DE CUENTA" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ProfileOption icon="person-outline" title="Información Personal" value="Roberto • (222) 123 4567" />
          <ProfileOption icon="lock-closed-outline" title="Seguridad" value="Contraseña actualizada" />
        </View>

        <SectionTitle title="PREFERENCIAS" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ProfileOption icon="language-outline" title="Idioma" value="Español (México)" />
          <ProfileOption icon="moon-outline" title="Modo Oscuro" isSwitch={true} />
          <ProfileOption icon="options-outline" title="Unidades" value="Métrico (Kg)" />
        </View>

        <SectionTitle title="SOPORTE" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ProfileOption icon="help-circle-outline" title="Centro de Ayuda" />
          <ProfileOption icon="document-text-outline" title="Privacidad y Legal" />
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.errorBg }]}
          onPress={() => router.replace('/')}
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
  editBadge: { position: 'absolute', bottom: 5, right: 5, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 15 },
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