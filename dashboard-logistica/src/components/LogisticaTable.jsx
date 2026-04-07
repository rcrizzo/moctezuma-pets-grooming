import React, { useState } from 'react';
import { Table, Form } from 'react-bootstrap';

const citasFalsas = [
  { id: 1, cliente: 'Carlos Ruiz', mascota: 'Rocky', raza: 'Husky Siberiano', servicio: 'Baño y Deslanado', estado: 'Agendado', hora: '12:00 PM' },
  { id: 2, cliente: 'Lucía Méndez', mascota: 'Luna', raza: 'Poodle', servicio: 'Corte Estético', estado: 'Aprobado', hora: '02:30 PM' }
];

export default function LogisticaTable() {
  const [citas, setCitas] = useState(citasFalsas);

  const alternarAprobado = (idCita, estadoActual) => {
    const nuevoEstado = estadoActual === 'Agendado' ? 'Aprobado' : 'Agendado';
    setCitas(citas.map(cita => cita.id === idCita ? { ...cita, estado: nuevoEstado } : cita));
  };

  return (
    <div className="glass-card">
      <div className="p-4 p-md-5"> {/* Padding generoso dentro de la tarjeta */}
        
        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h3 className="fw-bold mb-1" style={{fontSize: '20px'}}>Citas Programadas</h3>
            <p className="text-muted m-0" style={{fontSize: '14px'}}>Gestiona las solicitudes de los clientes en tiempo real.</p>
          </div>
          <button className="btn text-white fw-bold px-4 py-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
            + Nueva Solicitud
          </button>
        </div>

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
                {/* Columna Mascota */}
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
                
                {/* Columna Servicio */}
                <td>
                  <span className="fw-semibold d-block mb-1" style={{color: 'var(--text-dark)'}}>{cita.servicio}</span>
                  <span className="text-muted d-flex align-items-center gap-1" style={{fontSize: '13px'}}>
                    🕒 {cita.hora}
                  </span>
                </td>

                {/* Columna Progreso/Switch */}
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Check 
                      type="switch" 
                      id={`switch-${cita.id}`}
                      checked={cita.estado === 'Aprobado'}
                      onChange={() => alternarAprobado(cita.id, cita.estado)}
                      style={{ transform: 'scale(1.2)' }} /* Hace el switch un poco más grande */
                    />
                    <span className="fw-bold" style={{
                      color: cita.estado === 'Aprobado' ? 'var(--accent)' : 'var(--text-muted)',
                      fontSize: '14px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      backgroundColor: cita.estado === 'Aprobado' ? 'rgba(217, 119, 6, 0.1)' : '#F3F4F6'
                    }}>
                      {cita.estado}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}