import React, { useState } from 'react';
import { Row, Col, Badge, Modal, Form } from 'react-bootstrap';

const turnosMock = {
  pendientes: [
    { id: 1, mascota: 'Rocky', raza: 'Husky', servicio: 'Deslanado Profundo', hora: '12:00 PM', estilista: 'Ana' }
  ],
  enProceso: [
    { id: 2, mascota: 'Luna', raza: 'Poodle', servicio: 'Corte de Raza', hora: '10:30 AM', estilista: 'Carlos', fase: 'En Secado' },
    { id: 3, mascota: 'Boby', raza: 'Pug', servicio: 'Baño Básico', hora: '11:00 AM', estilista: 'Ana', fase: 'En Tina' }
  ],
  listos: [
    { id: 4, mascota: 'Max', raza: 'Golden Ret.', servicio: 'Baño y Corte', hora: '09:00 AM', estilista: 'Carlos' }
  ]
};

export default function Grooming() {

  const [showModal, setShowModal] = useState(false);

  const TarjetaMascota = ({ data, color, bg }) => (
    <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: bg, border: `1px solid ${color}`, borderLeft: `4px solid ${color}` }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="fw-bold m-0" style={{ fontSize: '15px', color: 'var(--text-dark)' }}>{data.mascota}</h5>
        <span className="text-muted" style={{ fontSize: '12px' }}>{data.hora}</span>
      </div>
      <p className="text-muted m-0 mb-2" style={{ fontSize: '13px' }}>{data.raza} • {data.servicio}</p>
      <div className="d-flex justify-content-between align-items-center">
        <span className="badge text-dark" style={{ backgroundColor: '#E5E7EB', fontSize: '11px' }}>✂️ {data.estilista}</span>
        {data.fase && <span className="fw-bold" style={{ fontSize: '11px', color }}>{data.fase}</span>}
      </div>
    </div>
  );

  return (
    <div className="glass-card">
      <div className="p-4 p-md-5 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-light)' }}>
        <div>
          <h3 className="fw-bold m-0" style={{ fontSize: '20px' }}>Estación de Grooming</h3>
          <p className="text-muted m-0" style={{ fontSize: '14px' }}>Flujo de trabajo en tiempo real de la estética.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn text-white fw-bold px-4 py-2"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}
        >
          + Asignar Turno
        </button>
      </div>

      <div className="p-4 p-md-5" style={{ backgroundColor: '#F9FAFB' }}>
        <Row className="gx-4">
          {/* Columna: Por Iniciar */}
          <Col md={4}>
            <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px' }}>📥 Por Iniciar ({turnosMock.pendientes.length})</h6>
            {turnosMock.pendientes.map(turno => <TarjetaMascota key={turno.id} data={turno} color="#6B7280" bg="#FFFFFF" />)}
          </Col>

          {/* Columna: En Proceso */}
          <Col md={4}>
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px', color: 'var(--accent)' }}>⏳ En Proceso ({turnosMock.enProceso.length})</h6>
            {turnosMock.enProceso.map(turno => <TarjetaMascota key={turno.id} data={turno} color="var(--accent)" bg="rgba(217, 119, 6, 0.05)" />)}
          </Col>

          {/* Columna: Listos / Para Entrega */}
          <Col md={4}>
            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '12px', letterSpacing: '1px', color: '#10B981' }}>✅ Listos ({turnosMock.listos.length})</h6>
            {turnosMock.listos.map(turno => <TarjetaMascota key={turno.id} data={turno} color="#10B981" bg="rgba(16, 185, 129, 0.05)" />)}
          </Col>
        </Row>
      </div>
      {/* Modal Asignar Turno */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold" style={{ fontSize: '20px' }}>Asignar Nuevo Turno</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <Form>
            <Row className="mb-4 gx-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Mascota (Buscar cliente)</Form.Label>
                  <Form.Control type="text" placeholder="Ej. Rocky (Juan Pérez)" className="custom-input" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Servicio a Realizar</Form.Label>
                  <Form.Select className="custom-input">
                    <option>Baño Básico</option>
                    <option>Deslanado Profundo</option>
                    <option>Corte de Raza</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4 gx-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Estilista Asignado</Form.Label>
                  <Form.Select className="custom-input">
                    <option>Ana</option>
                    <option>Carlos</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Hora Estimada</Form.Label>
                  <Form.Control type="time" className="custom-input" />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn px-4 py-2 fw-bold text-muted me-3">Cancelar</button>
              <button type="button" className="btn px-4 py-2 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>Crear Turno</button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}