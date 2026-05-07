import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dashboardId, setDashboardId] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const unsubUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) {
        setDashboardId(snap.docs[0].id);
      }
    });

    return () => unsubUser();
  }, []);

  useEffect(() => {
    if (!dashboardId) return;

    const qNotif = query(
      collection(db, 'notificaciones'),
      where('duenoId', '==', dashboardId),
      orderBy('createdAt', 'desc')
    );

    const unsubNotif = onSnapshot(qNotif, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotificaciones(lista);
      setCargando(false);
    });

    return () => unsubNotif();
  }, [dashboardId]);

  const marcarComoLeida = async (id: string, leida: boolean) => {
    if (leida) return;
    try {
      await updateDoc(doc(db, 'notificaciones', id), {
        leida: true
      });
    } catch (error) {
      console.error("Error al actualizar notificación:", error);
    }
  };

  const getConfigTipo = (tipo: string) => {
    switch (tipo) {
      case 'grooming': return { icon: 'cut', color: '#D97706', bg: '#FEF3C7' };
      case 'veterinaria': return { icon: 'medical', color: '#0284C7', bg: '#E0F2FE' };
      case 'hospedaje': return { icon: 'bed', color: '#059669', bg: '#DCFCE7' };
      case 'tienda': return { icon: 'cart', color: '#7C3AED', bg: '#EDE9FE' };
      case 'sistema': return { icon: 'information-circle', color: '#475569', bg: '#F1F5F9' };
      default: return { icon: 'notifications', color: '#64748B', bg: '#F8FAFC' };
    }
  };

  const getTiempoTranscurrido = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Reciente';
    const ahora = new Date();
    const fecha = timestamp.toDate();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDias = Math.floor(diffHrs / 24);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHrs < 24) return `Hace ${diffHrs} h`;
    return `Hace ${diffDias} d`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Notificaciones</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {cargando ? (
          <ActivityIndicator color="#D97706" size="large" style={{ marginTop: 50 }} />
        ) : notificaciones.length > 0 ? (
          notificaciones.map((notif) => {
            const config = getConfigTipo(notif.tipo);
            return (
              <TouchableOpacity 
                key={notif.id} 
                style={[styles.notifCard, !notif.leida && styles.notifCardUnread]}
                onPress={() => marcarComoLeida(notif.id, notif.leida)}
                activeOpacity={0.8}
              >
                {!notif.leida && <View style={styles.unreadDot} />}
                
                <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon as any} size={20} color={config.color} />
                </View>
                
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !notif.leida && styles.textUnread]}>
                      {notif.titulo}
                    </Text>
                    <Text style={styles.notifTime}>{getTiempoTranscurrido(notif.createdAt)}</Text>
                  </View>
                  <Text style={styles.notifMsg}>{notif.mensaje}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={50} color="#CBD5E1" />
            <Text style={styles.emptyText}>No tienes notificaciones nuevas.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  container: { padding: 20, paddingBottom: 40 },
  notifCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  notifCardUnread: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
  unreadDot: { position: 'absolute', top: 16, left: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', zIndex: 10 },
  iconBox: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  notifContent: { flex: 1, justifyContent: 'center' },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#475569', marginRight: 10 },
  textUnread: { color: '#0F172A', fontWeight: '800' },
  notifTime: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  notifMsg: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 15, color: '#64748B', fontWeight: '600' }
});