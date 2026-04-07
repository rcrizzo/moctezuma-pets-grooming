import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase'; // Asegúrate de que la ruta sea correcta

const estadosFlujo = [
  'Agendado', 'En Baño', 'En Secado', 'Listo para entregar', 'Entregado'
];

export default function LogisticaTable() {
  const [citas, setCitas] = useState([]);

  // 1. Escuchar la base de datos en tiempo real
  useEffect(() => {
    const citasCollection = collection(db, 'citas');
    
    // onSnapshot se ejecuta automáticamente cada vez que los datos cambian en Firebase
    const unsubscribe = onSnapshot(citasCollection, (snapshot) => {
      const datosCitas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCitas(datosCitas);
    });

    // Limpieza al desmontar el componente
    return () => unsubscribe();
  }, []);

  // 2. Función para guardar el cambio en Firebase
  const cambiarEstado = async (idCita, nuevoEstado) => {
    try {
      const citaRef = doc(db, 'citas', idCita);
      await updateDoc(citaRef, {
        estado: nuevoEstado
      });
      // Nota: No necesitamos actualizar el estado 'citas' manualmente aquí, 
      // onSnapshot detectará el cambio en Firebase y lo actualizará por nosotros.
    } catch (error) {
      console.error("Error al actualizar el estado: ", error);
    }
  };

  const obtenerColorEstado = (estado) => {
    switch(estado) {
      case 'Agendado': return '#f8d7da';
      case 'En Baño': return '#cce5ff';
      case 'En Secado': return '#fff3cd';
      case 'Listo para entregar': return '#d4edda';
      case 'Entregado': return '#e2e3e5';
      default: return '#ffffff';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Dashboard Logístico - Moctezuma Pet's</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
        {/* ... (El thead se mantiene igual que antes) ... */}
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '10px' }}>Hora</th>
            <th style={{ padding: '10px' }}>Cliente</th>
            <th style={{ padding: '10px' }}>Mascota</th>
            <th style={{ padding: '10px' }}>Servicio</th>
            <th style={{ padding: '10px' }}>Progreso</th>
          </tr>
        </thead>
        <tbody>
          {citas.length === 0 ? (
             <tr><td colSpan="5" style={{padding: '10px'}}>Cargando citas o no hay citas registradas...</td></tr>
          ) : (
            citas.map((cita) => (
              <tr key={cita.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}><strong>{cita.hora}</strong></td>
                <td style={{ padding: '10px' }}>{cita.cliente}</td>
                <td style={{ padding: '10px' }}>{cita.mascota} <br/><small style={{color: 'gray'}}>{cita.raza}</small></td>
                <td style={{ padding: '10px' }}>{cita.servicio}</td>
                <td style={{ padding: '10px' }}>
                  <select 
                    value={cita.estado}
                    onChange={(e) => cambiarEstado(cita.id, e.target.value)}
                    style={{
                      padding: '8px', borderRadius: '5px', border: '1px solid #ccc',
                      backgroundColor: obtenerColorEstado(cita.estado), fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {estadosFlujo.map(estado => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}