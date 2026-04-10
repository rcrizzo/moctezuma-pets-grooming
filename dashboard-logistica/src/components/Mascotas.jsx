import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

export default function Mascotas() {
  return (
    <Row className="gx-4">
      {/* Columna Izquierda: Formulario de Alta */}
      <Col md={5} lg={4}>
        <div className="glass-card p-4 h-100">
          <h4 className="fw-bold mb-1" style={{fontSize: '18px'}}>Registro de Perfil</h4>
          <p className="text-muted mb-4" style={{fontSize: '13px'}}>Añade una nueva mascota al sistema.</p>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Dueño (Cliente Registrado)</Form.Label>
              <Form.Control type="text" placeholder="Ej. Juan Pérez" className="custom-input" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Nombre de la Mascota</Form.Label>
              <Form.Control type="text" placeholder="Ej. Rocky" className="custom-input" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Raza</Form.Label>
              <Form.Select className="custom-input">
                <option>Seleccionar raza...</option>
                <option>Husky Siberiano</option>
                <option>Golden Retriever</option>
                <option>Pug</option>
                <option>Poodle</option>
                <option>Mestizo / Criollo</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="custom-label">Notas Logísticas / Comportamiento</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Alergias, agresividad, nerviosismo..." className="custom-input" />
            </Form.Group>

            <button type="submit" className="btn w-100 py-3 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '10px' }}>
              Guardar Perfil
            </button>
          </Form>
        </div>
      </Col>

      {/* Columna Derecha: Directorio Rápido */}
      <Col md={7} lg={8}>
        <div className="glass-card p-4 h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold m-0" style={{fontSize: '18px'}}>Base de Datos de Mascotas</h4>
            <Form.Control type="text" placeholder="🔍 Buscar por nombre o chip..." className="custom-input" style={{ width: '250px' }} />
          </div>

          {/* Grilla de Tarjetas de Mascotas */}
          <Row className="gy-3">
            {[1, 2, 3, 4].map((item) => (
              <Col md={6} key={item}>
                <div className="p-3 rounded-3" style={{ border: '1px solid var(--border-light)' }}>
                  <div className="d-flex gap-3">
                    <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>🐕</div>
                    <div>
                      <h5 className="fw-bold m-0" style={{fontSize: '15px'}}>Rocky</h5>
                      <p className="text-muted m-0" style={{fontSize: '13px'}}>Husky • Dueño: Juan P.</p>
                      <div className="mt-2 d-flex gap-2">
                        <span className="badge bg-light text-dark border">Tranquilo</span>
                        <span className="badge bg-light text-dark border">Pelo Largo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Col>
    </Row>
  );
}