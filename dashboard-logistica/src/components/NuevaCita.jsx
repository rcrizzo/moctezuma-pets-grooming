import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

export default function NuevaCita() {
  return (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Cabecera del formulario con padding amplio */}
      <div className="p-4 p-md-5 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="fw-bold mb-1" style={{fontSize: '20px'}}>Registro Logístico de Mascota</h3>
        <p className="text-muted m-0" style={{fontSize: '14px'}}>Completa el perfil para automatizar los tiempos de agenda.</p>
      </div>

      {/* Cuerpo del formulario con Grid estructurado */}
      <div className="p-4 p-md-5">
        <Form>
          <Row className="mb-4 gx-5"> {/* gx-5 da un margen lateral inmenso entre columnas */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Nombre del Cliente</Form.Label>
                <Form.Control type="text" placeholder="Ej. Juan Pérez" className="custom-input" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Nombre de la Mascota</Form.Label>
                <Form.Control type="text" placeholder="Ej. Rocky" className="custom-input" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5 gx-5">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Raza Específica</Form.Label>
                <Form.Control type="text" placeholder="Ej. Husky Siberiano" className="custom-input" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Etiqueta de Comportamiento</Form.Label>
                <Form.Select className="custom-input">
                  <option>Tranquilo (Estándar)</option>
                  <option>Nervioso con secadora (+30 min)</option>
                  <option>Difícil de bañar (+45 min)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
            <button type="button" className="btn px-4 py-3 fw-bold text-muted" style={{ backgroundColor: 'transparent' }}>
              Cancelar
            </button>
            <button type="submit" className="btn px-5 py-3 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '10px' }}>
              Guardar Perfil Logístico
            </button>
          </div>
        </Form>
      </div>

    </div>
  );
}