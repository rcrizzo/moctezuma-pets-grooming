import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const generarProximosDias = () => {
  const fechas = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    fechas.push(date);
  }
  return fechas;
};

const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

// --- CATÁLOGOS IDÉNTICOS AL DASHBOARD ---
const NIVELES_NUDOS = [
  'Ninguno / Cepillado Normal', 
  'Leve (Superficiales, 10-20%)', 
  'Moderado (Frecuentes, 30-50%)', 
  'Severo (Compactos, 60-80%)', 
  'Crítico (Rastas, 90-100%)'
];

const PRECIOS_BASE: any = {
  'Pelo Largo': {
    'Mini': { 'Baño': 280, 'Grooming': 380 },
    'Chico': { 'Baño': 300, 'Grooming': 400 },
    'Mediano': { 'Baño': 380, 'Grooming': 480 },
    'Grande': { 'Baño': 450, 'Grooming': 580 },
    'Gigante': { 'Baño': 600, 'Grooming': 700 }
  },
  'Pelo Corto': {
    'Mini': { 'Baño': 200, 'Grooming': 250 }, 
    'Chico': { 'Baño': 250, 'Grooming': 300 },
    'Mediano': { 'Baño': 300, 'Grooming': 350 },
    'Grande': { 'Baño': 350, 'Grooming': 400 },
    'Gigante': { 'Baño': 450, 'Grooming': 500 }
  }
};

export default function AgendarScreen() {
  const { servicio } = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [userName, setUserName] = useState(''); // Nombre real del dueño

  // --- ESTADOS DE DATOS ---
  const [misMascotas, setMisMascotas] = useState<any[]>([]);
  const [mascotaSel, setMascotaSel] = useState<any | null>(null);
  
  // Grooming
  const [tipoServicioGrooming, setTipoServicioGrooming] = useState('Baño Básico');
  const [nivelNudosIndex, setNivelNudosIndex] = useState(0); // Guardamos el número
  const [extraGrooming, setExtraGrooming] = useState<string[]>([]);
  
  // Vet y Hospedaje
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [notasAdicionales, setNotasAdicionales] = useState('');
  const [guiaAlimentacion, setGuiaAlimentacion] = useState('');
  const [socializacion, setSocializacion] = useState('Amigable');

  // Calendario
  const [fechasDisponibles] = useState(generarProximosDias());
  const [fechaSel, setFechaSel] = useState<Date>(fechasDisponibles[0]);
  const [horaSel, setHoraSel] = useState('10:00 AM');

  // --- OBTENER DATOS ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qUser = query(collection(db, 'usuarios'), where('uid', '==', user.uid));
    const unsubUser = onSnapshot(qUser, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setUserName(data.nombre || 'Usuario');
        
        const qMascotas = query(collection(db, 'mascotas'), where('duenoId', '==', snap.docs[0].id));
        onSnapshot(qMascotas, (petSnap) => {
          setMisMascotas(petSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
      }
    });

    return () => unsubUser();
  }, []);

  // --- COTIZADOR EXACTO AL DEL DASHBOARD ---
  const calcularPrecio = () => {
    if (servicio !== 'grooming' || !mascotaSel) return 0;
    
    const talla = mascotaSel.talla || 'Mediano';
    const tipoPelo = mascotaSel.tipoPelo || 'Corto';
    const tipoTarifa = tipoServicioGrooming.includes('Baño Básico') ? 'Baño' : 'Grooming';
    
    // Obtener precio base
    const precioBase = PRECIOS_BASE[tipoPelo]?.[talla]?.[tipoTarifa] || 350;
    
    // Calcular recargo por nudos (0%, 10%, 30%, 60%, 100%)
    const recargos = [0, 0.10, 0.30, 0.60, 1.00];
    const recargoMonto = precioBase * recargos[nivelNudosIndex];
    
    return precioBase + recargoMonto + (extraGrooming.length * 50);
  };

  // --- ENVIAR CITA AL DASHBOARD ---
  const handleAgendar = async () => {
    if (!mascotaSel) return;
    setProcesando(true);

    try {
      // 1. Preparar Timestamp y Fechas String
      const [horaStr, minutoStr, ampm] = horaSel.match(/(\d+):(\d+)\s(AM|PM)/)!.slice(1);
      let hours = parseInt(horaStr);
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const fechaTimestamp = new Date(fechaSel);
      fechaTimestamp.setHours(hours, parseInt(minutoStr), 0, 0);
      
      // Fecha en formato texto (YYYY-MM-DD) para que el Dashboard la lea
      const fechaString = fechaSel.toISOString().split('T')[0];

      if (servicio === 'grooming') {
        await addDoc(collection(db, 'grooming'), {
          duenoNombre: userName, // Grooming usa duenoNombre
          mascotaId: mascotaSel.id,
          mascotaNombre: mascotaSel.nombre,
          servicio: tipoServicioGrooming,
          fecha: fechaString, // String vital
          horario: horaSel,
          instrucciones: notasAdicionales,
          estado: 'Pendiente',
          nivelNudos: nivelNudosIndex, // El dashboard espera el número (0-4)
          precioCalculado: calcularPrecio(),
          fechaRegistro: new Date().toISOString(),
          fechaTimestamp: Timestamp.fromDate(fechaTimestamp)
        });
      } 
      else if (servicio === 'veterinaria') {
        await addDoc(collection(db, 'consultas'), { // VET USA CONSULTAS
          dueñoNombre: userName, // Vet usa dueñoNombre con Ñ
          mascotaId: mascotaSel.id,
          mascotaNombre: mascotaSel.nombre,
          tipo: 'Consulta General',
          sintomas: sintomas,
          notas: notasAdicionales,
          fechaCita: fechaString, // Campo exacto del dashboard
          horaCita: horaSel, // Campo exacto
          estado: 'Pendiente',
          fechaTimestamp: Timestamp.fromDate(fechaTimestamp),
          createdAt: serverTimestamp()
        });
      } 
      else if (servicio === 'hospedaje') {
        const nextDay = new Date(fechaSel);
        nextDay.setDate(nextDay.getDate() + 1);
        
        await addDoc(collection(db, 'hospedaje'), {
          dueñoNombre: userName, // Con Ñ
          mascotaId: mascotaSel.id,
          mascotaNombre: mascotaSel.nombre,
          fechaIngreso: fechaString,
          fechaSalida: nextDay.toISOString().split('T')[0],
          guiaAlimentacion: guiaAlimentacion,
          nivelSocializacion: socializacion,
          pertenencias: notasAdicionales, // Las notas van a pertenencias
          notas: '',
          habitacion: 'Sin Asignar', // Campo clave inicial
          estado: 'Pendiente',
          createdAt: serverTimestamp()
        });
      }

      Alert.alert("¡Cita Agendada!", "Tu solicitud fue registrada y se refleja en el panel.", [
        { text: "Ver mis citas", onPress: () => router.replace('/(tabs)/citas') }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No pudimos agendar la cita.");
    } finally {
      setProcesando(false);
    }
  };

  const ProgressHeader = () => {
    const steps = [1, 2, 3, 4];
    return (
      <View style={styles.progressWrapper}>
        <View style={styles.progressLineBase} />
        <View style={[styles.progressLineFill, { width: `${((step - 1) / 3) * 100}%` }]} />
        <View style={styles.nodesContainer}>
          {steps.map((s) => (
            <View key={s} style={[styles.node, step >= s && styles.nodeActive]}>
              <Text style={[styles.nodeText, step >= s && styles.nodeTextActive]}>{s}</Text>
              <Text style={[styles.nodeLabel, step === s && styles.nodeLabelActive]}>
                {s === 1 ? 'Mascota' : s === 2 ? 'Detalles' : s === 3 ? 'Fecha' : 'Revisar'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMascota = () => (
    <View style={styles.fadeContainer}>
      <Text style={styles.stepTitle}>¿A quién vamos a atender?</Text>
      
      {misMascotas.length === 0 ? (
        <Text style={{color: '#94A3B8', marginTop: 20}}>No tienes mascotas registradas. Ve a tu perfil para agregar una.</Text>
      ) : (
        misMascotas.map((pet) => (
          <TouchableOpacity 
            key={pet.id} 
            style={[styles.petCard, mascotaSel?.id === pet.id && styles.petCardActive]}
            onPress={() => { setMascotaSel(pet); setStep(2); }}
          >
            <View style={styles.petIcon}>
              <Text style={{fontSize: 22}}>{pet.tipo === 'Gato' || pet.tipo === 'gato' ? '🐱' : '🐶'}</Text>
            </View>
            <Text style={[styles.petName, mascotaSel?.id === pet.id && styles.petNameActive]}>{pet.nombre}</Text>
            {mascotaSel?.id === pet.id && <Ionicons name="checkmark-circle" size={24} color="#D97706" />}
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderDetalles = () => {
    if (servicio === 'grooming') return (
      <View style={styles.fadeContainer}>
        <Text style={styles.stepTitle}>Personaliza el servicio</Text>
        
        <Text style={styles.inputLabel}>TIPO DE SERVICIO</Text>
        <View style={styles.row}>
          {['Baño Básico', 'Corte de Pelo (Estilismo)'].map(s => (
            <TouchableOpacity key={s} style={[styles.smallTab, tipoServicioGrooming === s && styles.smallTabActive]} onPress={() => setTipoServicioGrooming(s)}>
              <Text style={[styles.smallTabText, tipoServicioGrooming === s && styles.smallTabTextActive]}>{s === 'Baño Básico' ? 'Solo Baño' : 'Baño y Corte'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, {marginTop: 20}]}>NIVEL DE NUDOS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10}}>
          {NIVELES_NUDOS.map((n, idx) => (
            <TouchableOpacity key={idx} style={[styles.nudosBtn, nivelNudosIndex === idx && styles.nudosBtnActive]} onPress={() => setNivelNudosIndex(idx)}>
              <Text style={[styles.nudosText, nivelNudosIndex === idx && styles.nudosTextActive]}>{n.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.inputLabel, {marginTop: 15}]}>EXTRAS</Text>
        {['Corte de Uñas', 'Limpieza de Oídos', 'Shampoo Medicado'].map(extra => (
          <TouchableOpacity 
            key={extra} 
            style={styles.checkOption}
            onPress={() => setExtraGrooming(prev => prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra])}
          >
            <Ionicons name={extraGrooming.includes(extra) ? "checkbox" : "square-outline"} size={24} color="#D97706" />
            <Text style={styles.checkText}>{extra}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.inputLabel, {marginTop: 15}]}>INSTRUCCIONES / NOTAS</Text>
        <TextInput 
          style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
          placeholder="Corte tipo osito, no tocar bigotes..." 
          placeholderTextColor="#94A3B8" 
          multiline
          value={notasAdicionales}
          onChangeText={setNotasAdicionales}
        />
      </View>
    );

    if (servicio === 'veterinaria') return (
      <View style={styles.fadeContainer}>
        <Text style={styles.stepTitle}>Reporte de Triage</Text>
        <Text style={styles.inputLabel}>SÍNTOMAS OBSERVADOS</Text>
        <View style={styles.tagsContainer}>
          {['Fiebre', 'Vómito', 'Letargo', 'Tos', 'Poca Hambre', 'Piel/Alergia'].map(s => (
            <TouchableOpacity 
              key={s} 
              style={[styles.tag, sintomas.includes(s) && styles.tagActive]}
              onPress={() => setSintomas(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])}
            >
              <Text style={[styles.tagText, sintomas.includes(s) && styles.tagTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.inputLabel, {marginTop: 20}]}>MOTIVO DE CONSULTA</Text>
        <TextInput 
          style={styles.textArea} 
          placeholder="Escribe aquí el motivo o detalles..." 
          multiline 
          placeholderTextColor="#94A3B8" 
          value={notasAdicionales}
          onChangeText={setNotasAdicionales}
        />
      </View>
    );

    if (servicio === 'hospedaje') return (
      <View style={styles.fadeContainer}>
        <Text style={styles.stepTitle}>Logística de Estancia</Text>
        <Text style={styles.inputLabel}>GUÍA DE ALIMENTACIÓN</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: 2 tazas de ProPlan al día (8am y 6pm)" 
          placeholderTextColor="#94A3B8" 
          value={guiaAlimentacion}
          onChangeText={setGuiaAlimentacion}
        />
        
        <Text style={[styles.inputLabel, {marginTop: 20}]}>NIVEL DE SOCIALIZACIÓN</Text>
        <View style={styles.row}>
          {['Amigable', 'Reactivo', 'Miedoso'].map(s => (
            <TouchableOpacity key={s} style={[styles.smallTab, socializacion === s && styles.smallTabActive]} onPress={() => setSocializacion(s)}>
              <Text style={[styles.smallTabText, socializacion === s && styles.smallTabTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={[styles.inputLabel, {marginTop: 20}]}>PERTENENCIAS / NOTAS</Text>
        <TextInput 
          style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
          placeholder="Cobija azul, juguetes..." 
          placeholderTextColor="#94A3B8" 
          multiline
          value={notasAdicionales}
          onChangeText={setNotasAdicionales}
        />
      </View>
    );
  };

  const renderFecha = () => (
    <View style={styles.fadeContainer}>
      <Text style={styles.stepTitle}>Selecciona el horario</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 30}}>
        {fechasDisponibles.map((d, index) => {
          const isSelected = fechaSel.getDate() === d.getDate();
          return (
            <TouchableOpacity 
              key={index} 
              style={[styles.dateBox, isSelected && styles.dateBoxActive]}
              onPress={() => setFechaSel(d)}
            >
              <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>{d.getDate()}</Text>
              <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>{meses[d.getMonth()]}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={styles.timeGrid}>
        {['10:00 AM', '11:00 AM', '01:00 PM', '04:00 PM', '06:00 PM'].map(t => (
          <TouchableOpacity 
            key={t} 
            style={[styles.timeSlot, horaSel === t && {borderColor: '#D97706', backgroundColor: '#FFFBEB'}]}
            onPress={() => setHoraSel(t)}
          >
            <Text style={[styles.timeSlotText, horaSel === t && {color: '#D97706'}]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} disabled={procesando}>
          <Ionicons name="close" size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Cita</Text>
        <View style={{width: 28}} />
      </View>

      <ProgressHeader />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {step === 1 && renderMascota()}
        {step === 2 && renderDetalles()}
        {step === 3 && renderFecha()}
        {step === 4 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.stepTitle}>Resumen de Solicitud</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>SERVICIO: <Text style={styles.summaryValue}>{servicio === 'grooming' ? tipoServicioGrooming.toUpperCase() : servicio?.toString().toUpperCase()}</Text></Text>
              <Text style={styles.summaryLabel}>PACIENTE: <Text style={styles.summaryValue}>{mascotaSel?.nombre}</Text></Text>
              <Text style={styles.summaryLabel}>FECHA: <Text style={styles.summaryValue}>{fechaSel.getDate()} de {meses[fechaSel.getMonth()]}, {horaSel}</Text></Text>
              
              {servicio === 'grooming' && (
                <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                  <Text style={[styles.summaryLabel, { color: '#0F172A' }]}>PRECIO APROXIMADO:</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#D97706' }}>
                    ${calcularPrecio().toFixed(2)}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 5 }}>
                    *Cálculo basado en tamaño ({mascotaSel?.talla || 'Mediano'}), pelo ({mascotaSel?.tipoPelo || 'Corto'}) y nudos.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.mainButton, (!mascotaSel && step === 1 || procesando) && {opacity: 0.5}]}
          onPress={() => {
            if (step < 4) setStep(step + 1);
            else handleAgendar();
          }}
          disabled={procesando || (!mascotaSel && step === 1)}
        >
          {procesando ? (
             <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.mainButtonText}>{step === 4 ? 'Confirmar y Agendar' : 'Siguiente Paso'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  progressWrapper: { height: 70, justifyContent: 'center', paddingHorizontal: 40, marginBottom: 20 },
  progressLineBase: { height: 3, backgroundColor: '#F1F5F9', width: '100%', position: 'absolute', left: 40 },
  progressLineFill: { height: 3, backgroundColor: '#D97706', position: 'absolute', left: 40 },
  nodesContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  node: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  nodeActive: { borderColor: '#D97706', backgroundColor: '#D97706' },
  nodeText: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  nodeTextActive: { color: '#FFFFFF' },
  nodeLabel: { position: 'absolute', top: 35, fontSize: 10, fontWeight: '700', color: '#94A3B8', width: 60, textAlign: 'center' },
  nodeLabelActive: { color: '#0F172A' },
  scrollBody: { padding: 25, paddingBottom: 100 },
  fadeContainer: { flex: 1 },
  stepTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 25 },
  petCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 15 },
  petCardActive: { borderColor: '#D97706', backgroundColor: '#FFFBEB' },
  petIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  petName: { fontSize: 17, fontWeight: '700', color: '#64748B', flex: 1 },
  petNameActive: { color: '#0F172A' },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 12 },
  checkOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  checkText: { marginLeft: 12, fontSize: 16, color: '#0F172A', fontWeight: '600' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  tagActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  tagText: { color: '#64748B', fontWeight: '700' },
  tagTextActive: { color: '#FFFFFF' },
  input: { backgroundColor: '#F8FAFC', borderRadius: 15, padding: 18, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 15, padding: 18, fontSize: 15, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0', height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  smallTab: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  smallTabActive: { backgroundColor: '#D97706', borderColor: '#D97706' },
  smallTabText: { fontWeight: '700', color: '#64748B' },
  smallTabTextActive: { color: '#FFFFFF' },
  nudosBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  nudosBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  nudosText: { fontWeight: '700', color: '#64748B' },
  nudosTextActive: { color: '#FFFFFF' },
  dateBox: { width: 65, height: 85, borderRadius: 20, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  dateBoxActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  dateNum: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  dateNumActive: { color: '#FFFFFF' },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  dateMonthActive: { color: '#94A3B8' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeSlot: { width: '48%', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  timeSlotText: { fontWeight: '700', color: '#0F172A' },
  summaryCard: { backgroundColor: '#F8FAFC', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10 },
  summaryValue: { color: '#0F172A', fontSize: 16 },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  mainButton: { backgroundColor: '#D97706', paddingVertical: 18, borderRadius: 18, alignItems: 'center', shadowColor: '#D97706', shadowOpacity: 0.2, shadowRadius: 10 },
  mainButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 }
});