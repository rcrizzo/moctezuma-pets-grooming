import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function AgendarScreen() {
  const { servicio } = useLocalSearchParams();
  const [step, setStep] = useState(1);

  // --- ESTADOS DE DATOS ---
  const [mascota, setMascota] = useState<string | null>(null);
  const [extraGrooming, setExtraGrooming] = useState<string[]>([]);
  const [sintomas, setSintomas] = useState<string[]>([]);
  const [socializacion, setSocializacion] = useState('Amigable');
  const [fotosWhatsApp, setFotosWhatsApp] = useState(true);

  // --- COMPONENTE: BARRA DE PROGRESO ---
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

  // --- PASO 1: SELECCIÓN DE MASCOTA ---
  const renderMascota = () => (
    <View style={styles.fadeContainer}>
      <Text style={styles.stepTitle}>¿A quién vamos a atender?</Text>
      {['Rocky', 'Boby', 'Luna'].map((name) => (
        <TouchableOpacity 
          key={name} 
          style={[styles.petCard, mascota === name && styles.petCardActive]}
          onPress={() => { setMascota(name); setStep(2); }}
        >
          <View style={styles.petIcon}><Text style={{fontSize: 22}}>{name === 'Luna' ? '🐩' : '🐕'}</Text></View>
          <Text style={[styles.petName, mascota === name && styles.petNameActive]}>{name}</Text>
          {mascota === name && <Ionicons name="checkmark-circle" size={24} color="#D97706" />}
        </TouchableOpacity>
      ))}
    </View>
  );

  // --- PASO 2: DETALLES TÉCNICOS ---
  const renderDetalles = () => {
    if (servicio === 'grooming') return (
      <View style={styles.fadeContainer}>
        <Text style={styles.stepTitle}>Personaliza el servicio</Text>
        <Text style={styles.inputLabel}>ADITIVOS Y EXTRAS</Text>
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
        <Text style={[styles.inputLabel, {marginTop: 20}]}>NOTAS ADICIONALES</Text>
        <TextInput style={styles.textArea} placeholder="Escribe aquí cualquier detalle relevante..." multiline placeholderTextColor="#94A3B8" />
      </View>
    );

    if (servicio === 'hospedaje') return (
      <View style={styles.fadeContainer}>
        <Text style={styles.stepTitle}>Logística de Estancia</Text>
        <Text style={styles.inputLabel}>GUÍA DE ALIMENTACIÓN</Text>
        <TextInput style={styles.input} placeholder="Ej: 2 tazas de ProPlan al día (8am y 6pm)" placeholderTextColor="#94A3B8" />
        
        <Text style={[styles.inputLabel, {marginTop: 20}]}>NIVEL DE SOCIALIZACIÓN</Text>
        <View style={styles.row}>
          {['Amigable', 'Reactivo', 'Miedoso'].map(s => (
            <TouchableOpacity key={s} style={[styles.smallTab, socializacion === s && styles.smallTabActive]} onPress={() => setSocializacion(s)}>
              <Text style={[styles.smallTabText, socializacion === s && styles.smallTabTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // --- PASO 3: CALENDARIO ---
  const renderFecha = () => (
    <View style={styles.fadeContainer}>
      <Text style={styles.stepTitle}>Selecciona el horario</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 30}}>
        {[15, 16, 17, 18, 19, 20].map(d => (
          <View key={d} style={[styles.dateBox, d === 15 && styles.dateBoxActive]}>
            <Text style={[styles.dateNum, d === 15 && styles.dateNumActive]}>{d}</Text>
            <Text style={[styles.dateMonth, d === 15 && styles.dateMonthActive]}>ABR</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.timeGrid}>
        {['09:00 AM', '11:00 AM', '01:00 PM', '04:00 PM'].map(t => (
          <TouchableOpacity key={t} style={styles.timeSlot}><Text style={styles.timeSlotText}>{t}</Text></TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
          <Ionicons name="close" size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Cita</Text>
        <View style={{width: 28}} />
      </View>

      <ProgressHeader />

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {step === 1 && renderMascota()}
        {step === 2 && renderDetalles()}
        {step === 3 && renderFecha()}
        {step === 4 && (
          <View style={styles.fadeContainer}>
            <Text style={styles.stepTitle}>Resumen de Solicitud</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>SERVICIO: <Text style={styles.summaryValue}>{servicio?.toString().toUpperCase()}</Text></Text>
              <Text style={styles.summaryLabel}>PACIENTE: <Text style={styles.summaryValue}>{mascota}</Text></Text>
              <Text style={styles.summaryLabel}>FECHA: <Text style={styles.summaryValue}>15 de Abril, 11:00 AM</Text></Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.mainButton, (!mascota && step === 1) && {opacity: 0.5}]}
          onPress={() => step < 4 ? setStep(step + 1) : router.back()}
        >
          <Text style={styles.mainButtonText}>{step === 4 ? 'Enviar Solicitud' : 'Siguiente Paso'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  
  // Barra de Progreso
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
  
  // Elementos de Formulario
  petCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1.5, borderColor: '#F1F5F9', marginBottom: 15 },
  petCardActive: { borderColor: '#D97706', backgroundColor: '#FFFBEB' },
  petIcon: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  petName: { fontSize: 17, fontWeight: '700', color: '#64748B' },
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