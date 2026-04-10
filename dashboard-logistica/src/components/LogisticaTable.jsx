import React, { useState, useEffect } from 'react';
import { Table, Form, Spinner } from 'react-bootstrap';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Importamos tu conexión

export default function LogisticaTable() {
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 1. Escuchar la base de datos en tiempo real
  useEffect(() => {
    // Obtenemos las citas (idealmente podrías ordenarlas por hora después)
    const q = query(collection(db, 'citas'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datosCitas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCitas(datosCitas);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Actualizar el estado en la nube al mover el switch
  const alternarAprobado = async (idCita, estadoActual) => {
    const nuevoEstado = estadoActual === 'Agendado' ? 'Aprobado' : 'Agendado';
    try {
      const citaRef = doc(db, 'citas', idCita);
      await updateDoc(citaRef, { estado: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  return (
    <div className="glass-card">
      <div className="p-4 p-md-5">
        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h3 className="fw-bold mb-1" style={{fontSize: '20px'}}>Citas Programadas</h3>
            <p className="text-muted m-0" style={{fontSize: '14px'}}>Gestiona las solicitudes sincronizadas desde Firebase.</p>
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{color: 'var(--accent)'}} />
            <p className="text-muted mt-3">Sincronizando con la nube...</p>
          </div>
        ) : (
          <Table borderless hover responsive className="beauty-table m-0">
            <thead>
              <tr>
                <th>Detalles de Mascota</th>
                <th>Servicio / Horario</th>
                <th>Estado Logístico</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>
                    <div className="d-flex align-items-center gap-4">
                      <div style={{width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
                        🐕
                      </div>
                      <div>
                        <span className="fw-bold d-block" style={{fontSize: '16px', color: 'var(--text-dark)'}}>{cita.mascota}</span>
                        <span className="text-muted d-block" style={{fontSize: '14px'}}>{cita.raza} • Dueño: {cita.cliente}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="fw-semibold d-block mb-1" style={{color: 'var(--text-dark)'}}>{cita.servicio}</span>
                    <span className="text-muted d-flex align-items-center gap-1" style={{fontSize: '13px'}}>
                      🕒 {cita.hora}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <Form.Check 
                        type="switch" 
                        id={`switch-${cita.id}`}
                        checked={cita.estado === 'Aprobado'}
                        onChange={() => alternarAprobado(cita.id, cita.estado)}
                        style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      />
                      <span className="fw-bold" style={{
                        color: cita.estado === 'Aprobado' ? 'var(--accent)' : 'var(--text-muted)',
                        fontSize: '14px', padding: '6px 12px', borderRadius: '20px',
                        backgroundColor: cita.estado === 'Aprobado' ? 'rgba(217, 119, 6, 0.1)' : '#F3F4F6',
                        transition: 'all 0.3s ease'
                      }}>
                        {cita.estado}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {citas.length === 0 && (
                <tr><td colSpan="3" className="text-center py-5 text-muted">Aún no hay citas registradas en la base de datos.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}