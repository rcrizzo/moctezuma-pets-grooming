import React, { useState } from 'react';
import { Row, Col, Badge, Modal, Form } from 'react-bootstrap';

// Datos simulados de las habitaciones/jaulas
const habitacionesMock = [
  { id: '101', tipo: 'Suite Premium', estado: 'Ocupada', mascota: 'Luna', raza: 'Poodle', salida: '12 Abr 2026' },
  { id: '102', tipo: 'Estándar', estado: 'Disponible', mascota: null, raza: null, salida: null },
  { id: '103', tipo: 'Estándar', estado: 'Limpieza', mascota: null, raza: null, salida: null },
  { id: '104', tipo: 'Suite Premium', estado: 'Ocupada', mascota: 'Max', raza: 'Golden Retriever', salida: '10 Abr 2026' },
  { id: '105', tipo: 'Estándar', estado: 'Ocupada', mascota: 'Boby', raza: 'Pug', salida: '15 Abr 2026' },
  { id: '106', tipo: 'Estándar', estado: 'Disponible', mascota: null, raza: null, salida: null },
];

export default function Hospedaje() {

  const [showModal, setShowModal] = useState(false);
  
  // Función para darle color a cada tarjeta según su estado
  const getEstadoStyles = (estado) => {
    switch(estado) {
      case 'Disponible': return { border: '#10B981', bg: 'rgba(16, 185, 129, 0.05)', text: '#10B981' }; // Verde
      case 'Ocupada': return { border: 'var(--accent)', bg: 'rgba(217, 119, 6, 0.05)', text: 'var(--accent)' }; // Ocre
      case 'Limpieza': return { border: '#3B82F6', bg: 'rgba(59, 130, 246, 0.05)', text: '#3B82F6' }; // Azul
      default: return { border: '#D1D5DB', bg: '#F9FAFB', text: '#6B7280' };
    }
  };

  return (
    <div>
      {/* 1. KPIs de Operación del Hotel */}
      <Row className="mb-4 gx-4">
        <Col md={4}>
          <div className="glass-card p-4 d-flex justify-content-between align-items-center" style={{borderLeft: '4px solid var(--accent)'}}>
            <div>
              <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Ocupación Actual</p>
              <h2 className="fw-bold m-0 mt-1" style={{fontSize: '32px', color: 'var(--text-dark)'}}>50%</h2>
            </div>
            <div style={{fontSize: '32px', opacity: '0.2'}}>🏨</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 d-flex justify-content-between align-items-center" style={{borderLeft: '4px solid #10B981'}}>
            <div>
              <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Check-ins Hoy</p>
              <h2 className="fw-bold m-0 mt-1" style={{fontSize: '32px', color: '#10B981'}}>2</h2>
            </div>
            <div style={{fontSize: '32px', opacity: '0.2'}}>📥</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 d-flex justify-content-between align-items-center" style={{borderLeft: '4px solid #F59E0B'}}>
            <div>
              <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase'}}>Check-outs Hoy</p>
              <h2 className="fw-bold m-0 mt-1" style={{fontSize: '32px', color: '#F59E0B'}}>1</h2>
            </div>
            <div style={{fontSize: '32px', opacity: '0.2'}}>📤</div>
          </div>
        </Col>
      </Row>

      {/* 2. Cabecera del Mapa de Ocupación */}
      <div className="d-flex justify-content-between align-items-end mb-4 mt-5">
        <div>
          <h3 className="fw-bold m-0" style={{fontSize: '22px'}}>Mapa de Habitaciones</h3>
          <p className="text-muted m-0" style={{fontSize: '14px'}}>Control visual de estancias y limpieza.</p>
        </div>
        <div className="d-flex gap-3">
          <button className="btn fw-bold px-4 py-2" style={{backgroundColor: '#F3F4F6', color: 'var(--text-dark)', borderRadius: '8px'}}>
            Ver Calendario
          </button>
          <button onClick={() => setShowModal(true)} className="btn text-white fw-bold px-4 py-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
            + Nuevo Check-in
          </button>
        </div>
      </div>

      {/* 3. Grid de Habitaciones */}
      <Row className="gx-4 gy-4">
        {habitacionesMock.map((hab) => {
          const styles = getEstadoStyles(hab.estado);
          return (
            <Col md={4} lg={4} key={hab.id}>
              <div className="glass-card p-4 h-100" style={{ borderTop: `4px solid ${styles.border}`, backgroundColor: styles.bg }}>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="fw-bold m-0" style={{fontSize: '18px', color: 'var(--text-dark)'}}>Hab. {hab.id}</h4>
                    <span className="text-muted" style={{fontSize: '12px'}}>{hab.tipo}</span>
                  </div>
                  <Badge bg="transparent" style={{color: styles.text, border: `1px solid ${styles.text}`, borderRadius: '20px', padding: '5px 10px'}}>
                    {hab.estado}
                  </Badge>
                </div>

                {hab.estado === 'Ocupada' ? (
                  <div className="mt-3 pt-3" style={{borderTop: '1px solid rgba(0,0,0,0.05)'}}>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div style={{fontSize: '20px'}}>🐕</div>
                      <div>
                        <span className="fw-bold d-block" style={{fontSize: '14px', color: 'var(--text-dark)'}}>{hab.mascota}</span>
                        <span className="text-muted d-block" style={{fontSize: '12px'}}>{hab.raza}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="text-muted fw-bold" style={{fontSize: '11px', textTransform: 'uppercase'}}>Salida:</span>
                      <span className="fw-medium" style={{fontSize: '13px'}}>{hab.salida}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 d-flex justify-content-center align-items-center" style={{borderTop: '1px solid rgba(0,0,0,0.05)', minHeight: '80px'}}>
                    <span className="text-muted" style={{fontSize: '13px', fontStyle: 'italic'}}>
                      {hab.estado === 'Limpieza' ? 'Personal de limpieza asignado' : 'Lista para recibir mascota'}
                    </span>
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>
      {/* Modal Nuevo Check-In */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold" style={{ fontSize: '20px' }}>Check-In de Hospedaje</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <Form>
            <Row className="mb-4 gx-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Huésped (Mascota)</Form.Label>
                  <Form.Control type="text" placeholder="Ej. Max" className="custom-input" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Habitación Asignada</Form.Label>
                  <Form.Select className="custom-input">
                    <option>102 - Estándar</option>
                    <option>106 - Estándar</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4 gx-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Fecha y Hora de Salida</Form.Label>
                  <Form.Control type="datetime-local" className="custom-input" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Dieta Especial / Medicación</Form.Label>
                  <Form.Control type="text" placeholder="Ej. Come 2 veces al día" className="custom-input" />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn px-4 py-2 fw-bold text-muted me-3">Cancelar</button>
              <button type="button" className="btn px-4 py-2 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>Confirmar Check-In</button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}