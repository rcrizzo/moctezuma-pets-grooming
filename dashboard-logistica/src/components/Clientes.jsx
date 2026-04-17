import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Modal, Spinner } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query } from 'firebase/firestore';
import { db } from '../firebase';
// Importamos íconos vectoriales
import { IoSearch, IoAdd, IoPerson } from 'react-icons/io5';

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', telefono: '', correo: '' });

  useEffect(() => {
    const q = query(collection(db, 'clientes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaClientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(listaClientes);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await addDoc(collection(db, 'clientes'), nuevoCliente);
      setShowModal(false);
      setNuevoCliente({ nombre: '', telefono: '', correo: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    cliente.telefono.includes(busqueda)
  );

  return (
    <div className="glass-card">
      <div className="p-4 p-md-5 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-light)' }}>
        <div>
          <h3 className="fw-bold m-0" style={{fontSize: '20px'}}>Directorio de Clientes</h3>
          <p className="text-muted m-0" style={{fontSize: '14px'}}>Administración de la base de datos de usuarios registrados.</p>
        </div>
        <div className="d-flex gap-3">
          <div className="position-relative">
            <IoSearch className="position-absolute" style={{left: '12px', top: '15px', color: '#94A3B8'}} />
            <Form.Control 
              type="text" 
              placeholder="Buscar por nombre o teléfono..." 
              className="custom-input"
              style={{ width: '280px', paddingLeft: '35px' }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button onClick={() => setShowModal(true)} className="btn text-white fw-bold px-4 py-2 d-flex align-items-center gap-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
            <IoAdd size={20} /> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="p-0">
        {cargando ? (
          <div className="text-center py-5"><Spinner animation="border" style={{color: 'var(--accent)'}} /></div>
        ) : (
          <Table borderless hover responsive className="beauty-table m-0 align-middle">
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Teléfono Contacto</th>
                <th>Correo Electrónico</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div style={{width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B'}}>
                        <IoPerson size={18} />
                      </div>
                      <span className="fw-bold" style={{fontSize: '15px'}}>{cliente.nombre}</span>
                    </div>
                  </td>
                  <td><span className="fw-medium" style={{fontSize: '14px', color: '#4B5563'}}>{cliente.telefono}</span></td>
                  <td><span className="text-muted" style={{fontSize: '14px'}}>{cliente.correo || 'No registrado'}</span></td>
                  <td className="text-end">
                    <button className="btn btn-sm fw-bold" style={{color: 'var(--accent)', backgroundColor: 'rgba(217, 119, 6, 0.1)'}}>Ver Perfil</button>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No se encontraron clientes.</td></tr>
              )}
            </tbody>
          </Table>
        )}
      </div>
      
      {/* --- MODAL COMPLETO DE CLIENTES --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold" style={{ fontSize: '20px' }}>Nuevo Registro de Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4 gx-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="custom-label">Nombre Completo</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="nombre"
                    value={nuevoCliente.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Juan Pérez" 
                    className="custom-input" 
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4 gx-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="custom-label">Teléfono de Contacto</Form.Label>
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