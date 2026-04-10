import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Asegúrate de que la ruta sea correcta a tu firebase.js

export default function Clientes() {
  // Estados de la interfaz
  const [showModal, setShowModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados de Firebase
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estado para el formulario del Modal
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    telefono: '',
    correo: ''
  });

  // 1. ESCUCHAR A FIREBASE EN TIEMPO REAL
  useEffect(() => {
    // Apuntamos a la colección 'clientes'
    const q = query(collection(db, 'clientes'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaClientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(listaClientes);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. FUNCIÓN PARA GUARDAR UN CLIENTE
  const handleGuardarCliente = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setGuardando(true);

    try {
      // Enviamos el objeto a la colección 'clientes' en Firestore
      await addDoc(collection(db, 'clientes'), {
        nombre: nuevoCliente.nombre,
        telefono: nuevoCliente.telefono,
        correo: nuevoCliente.correo,
        mascotas: 'Pendiente de registro', // Valor por defecto
        fechaRegistro: new Date().toLocaleDateString()
      });
      
      // Limpiamos y cerramos
      setNuevoCliente({ nombre: '', telefono: '', correo: '' });
      setShowModal(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Hubo un error al conectar con la base de datos.");
    } finally {
      setGuardando(false);
    }
  };

  // Función para manejar lo que el usuario escribe
  const handleChange = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  // Filtrado local para la barra de búsqueda
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    cliente.telefono?.includes(busqueda)
  );

  return (
    <div className="glass-card">
      <div className="p-4 p-md-5 border-bottom" style={{ borderColor: 'var(--border-light)' }}>
        <Row className="align-items-end gy-3">
          <Col lg={4}>
            <h3 className="fw-bold m-0" style={{fontSize: '20px'}}>Directorio CRM</h3>
            <p className="text-muted m-0" style={{fontSize: '14px'}}>Gestión de dueños e información de contacto.</p>
          </Col>
          <Col lg={8}>
            <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
              <Form.Control 
                type="text" 
                placeholder="🔍 Buscar por nombre o teléfono..." 
                className="custom-input" 
                style={{ width: '300px' }} 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button onClick={() => setShowModal(true)} className="btn text-white fw-bold px-4 py-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
                + Añadir Cliente
              </button>
            </div>
          </Col>
        </Row>
      </div>

      <div className="p-0">
        {cargando ? (
          <div className="text-center py-5">
            <Spinner animation="border" style={{color: 'var(--accent)'}} />
            <p className="text-muted mt-2">Cargando base de datos...</p>
          </div>
        ) : (
          <Table borderless hover responsive className="beauty-table m-0 align-middle">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Contacto</th>
                <th>Mascota(s) Asociada(s)</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                        {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="fw-bold" style={{fontSize: '15px', color: 'var(--text-dark)'}}>{cliente.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span className="d-block fw-medium" style={{fontSize: '14px', color: 'var(--text-dark)'}}>📞 {cliente.telefono}</span>
                    <span className="text-muted" style={{fontSize: '13px'}}>✉️ {cliente.correo}</span>
                  </td>
                  <td>
                    <span className="text-muted" style={{fontSize: '14px'}}>{cliente.mascotas}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm fw-bold me-2 text-muted" style={{backgroundColor: '#F3F4F6'}}>Ver Historial</button>
                    <button className="btn btn-sm fw-bold" style={{color: 'var(--accent)', backgroundColor: 'transparent', border: '1px solid var(--accent)'}}>
                      ✏️ Editar Perfil
                    </button>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">No hay clientes registrados en la base de datos.</td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Añadir Cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold" style={{ fontSize: '20px' }}>Registrar Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <Form onSubmit={handleGuardarCliente}>
            <Row className="mb-4 gx-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Nombre Completo</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombre"
                    value={nuevoCliente.nombre}
                    onChange={handleChange}
                    placeholder="Nombre y Apellidos" 
                    className="custom-input" 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="custom-label">Teléfono Celular</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="telefono"
                    value={nuevoCliente.telefono}
                    onChange={handleChange}
                    placeholder="(123) 456-7890" 
                    className="custom-input" 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4 gx-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="custom-label">Correo Electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    name="correo"
                    value={nuevoCliente.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com" 
                    className="custom-input" 
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-4">
              <button type="button" onClick={() => setShowModal(false)} className="btn px-4 py-2 fw-bold text-muted me-3" disabled={guardando}>Cancelar</button>
              <button type="submit" className="btn px-4 py-2 fw-bold text-white d-flex align-items-center gap-2" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }} disabled={guardando}>
                {guardando ? <Spinner size="sm" /> : 'Guardar Cliente'}
              </button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}