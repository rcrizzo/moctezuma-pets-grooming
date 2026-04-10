import React, { useState } from 'react';
import { Row, Col, Badge, Modal, Form, Table } from 'react-bootstrap';

// Datos simulados de expedientes clínicos
const expedientesMock = [
  { id: 1, mascota: 'Rocky', raza: 'Husky', dueño: 'Juan Pérez', ultimaVisita: '2026-04-05', motivo: 'Vacunación Triple', estado: 'Sano' },
  { id: 2, mascota: 'Luna', raza: 'Poodle', dueño: 'Lucía Méndez', ultimaVisita: '2026-03-20', motivo: 'Control de Alergia', estado: 'En Tratamiento' },
  { id: 3, mascota: 'Kira', raza: 'Terrier Escocés', dueño: 'Roberto', ultimaVisita: '2026-04-08', motivo: 'Cirugía Menor', estado: 'Recuperación' }
];

export default function Veterinaria() {

  const [showModal, setShowModal] = useState(false);

  const [busqueda, setBusqueda] = useState('');

  const getBadgeStyle = (estado) => {
    switch(estado) {
      case 'Sano': return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
      case 'En Tratamiento': return { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
      case 'Recuperación': return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' };
      default: return { bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <div>
      {/* 1. Acciones Rápidas y Estadísticas Médicas */}
      <Row className="mb-4 gx-4">
        <Col md={8}>
          <div className="glass-card p-4 h-100 d-flex align-items-center justify-content-between">
            <div>
              <h4 className="fw-bold m-0" style={{fontSize: '18px'}}>Expedientes Clínicos</h4>
              <p className="text-muted m-0" style={{fontSize: '14px'}}>Gestión de historial médico y consultas preventivas.</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn text-white fw-bold px-4 py-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
              + Nueva Consulta
            </button>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 h-100 text-center">
            <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Vacunas Pendientes (Semana)</p>
            <h2 className="fw-bold m-0 text-accent" style={{fontSize: '32px'}}>14</h2>
          </div>
        </Col>
      </Row>

      {/* 2. Buscador y Lista de Pacientes */}
      <div className="glass-card">
        <div className="p-4 p-md-5 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-light)' }}>
          <h3 className="fw-bold m-0" style={{fontSize: '20px'}}>Directorio de Pacientes</h3>
          <Form.Control 
            type="text" 
            placeholder="🔍 Buscar mascota o dueño..." 
            className="custom-input"
            style={{ width: '350px' }}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="p-0">
          <Table borderless hover responsive className="beauty-table m-0">
            <thead>
              <tr>
                <th>Paciente / Dueño</th>
                <th>Última Consulta</th>
                <th>Motivo Médico</th>
                <th>Estado de Salud</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expedientesMock.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>
                        🐾
                      </div>
                      <div>
                        <span className="fw-bold d-block" style={{fontSize: '15px'}}>{exp.mascota}</span>
                        <span className="text-muted d-block" style={{fontSize: '13px'}}>{exp.raza} • {exp.dueño}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="fw-medium" style={{fontSize: '14px', color: 'var(--text-dark)'}}>{exp.ultimaVisita}</span>
                  </td>
                  <td>
                    <span className="text-muted" style={{fontSize: '14px'}}>{exp.motivo}</span>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: getBadgeStyle(exp.estado).bg,
                      color: getBadgeStyle(exp.estado).color,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {exp.estado}
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm fw-bold" style={{color: 'var(--accent)'}}>Ver Historial</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      {/* Modal Nueva Consulta */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold" style={{ fontSize: '20px' }}>Registrar Nueva Consulta</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <Form>
            <Row className="mb-4 gx-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Paciente</Form.Label>
                  <Form.Control type="text" placeholder="Nombre de la mascota..." className="custom-input" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Tipo de Consulta</Form.Label>
                  <Form.Select className="custom-input">
                    <option>Revisión General</option>
                    <option>Vacunación</option>
                    <option>Emergencia</option>
                    <option>Seguimiento Médico</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="custom-label">Motivo de la Visita / Síntomas</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Describa brevemente los síntomas..." className="custom-input" />
            </Form.Group>
            <div className="d-flex justify-content-end mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn px-4 py-2 fw-bold text-muted me-3">Cancelar</button>
              <button type="button" className="btn px-4 py-2 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>Ingresar Paciente</button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}