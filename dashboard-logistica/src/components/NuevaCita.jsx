import React, { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Importamos tu conexión a la BD

export default function NuevaCita() {
  // 1. Estado para guardar los datos del formulario
  const [datos, setDatos] = useState({
    cliente: '',
    mascota: '',
    raza: '',
    servicio: 'Baño y Deslanado', // Valor por defecto
    estado: 'Agendado', // Todas las citas nuevas entran como Agendadas
    hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Hora actual
  });

  const [cargando, setCargando] = useState(false);

  // 2. Función para manejar los cambios en los inputs
  const handleChange = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value
    });
  };

  // 3. Función para enviar a Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      // Agregamos el documento a la colección 'citas'
      await addDoc(collection(db, 'citas'), datos);
      alert("🐾 ¡Registro guardado exitosamente en la base de datos!");
      
      // Limpiamos el formulario
      setDatos({ cliente: '', mascota: '', raza: '', servicio: 'Baño y Deslanado', estado: 'Agendado', hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    } catch (error) {
      console.error("Error al guardar: ", error);
      alert("Hubo un error al guardar. Revisa la consola.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="p-4 p-md-5 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
        <h3 className="fw-bold mb-1" style={{fontSize: '20px'}}>Registro Logístico de Mascota</h3>
        <p className="text-muted m-0" style={{fontSize: '14px'}}>Completa el perfil para enviar a la base de datos.</p>
      </div>

      <div className="p-4 p-md-5">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-4 gx-5">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Nombre del Cliente</Form.Label>
                <Form.Control type="text" name="cliente" value={datos.cliente} onChange={handleChange} placeholder="Ej. Juan Pérez" required className="custom-input" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Nombre de la Mascota</Form.Label>
                <Form.Control type="text" name="mascota" value={datos.mascota} onChange={handleChange} placeholder="Ej. Rocky" required className="custom-input" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-5 gx-5">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Raza Específica</Form.Label>
                <Form.Control type="text" name="raza" value={datos.raza} onChange={handleChange} placeholder="Ej. Husky Siberiano" required className="custom-input" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="custom-label">Servicio Principal</Form.Label>
                <Form.Select name="servicio" value={datos.servicio} onChange={handleChange} className="custom-input">
                  <option value="Baño y Deslanado">Baño y Deslanado</option>
                  <option value="Corte Estético">Corte Estético</option>
                  <option value="Spa Completo">Spa Completo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-3 pt-3 border-top" style={{ borderColor: 'var(--border-light)' }}>
            <button type="submit" disabled={cargando} className="btn px-5 py-3 fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '10px' }}>
              {cargando ? 'Guardando...' : 'Guardar Perfil Logístico'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}