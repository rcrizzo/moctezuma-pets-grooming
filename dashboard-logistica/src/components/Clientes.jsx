import React, { useState, useEffect } from 'react';
import { Table, Form, Row, Col, Modal, Spinner, Badge, Card } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, where, serverTimestamp, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  IoSearch, IoAdd, IoPerson, IoPhonePortraitOutline, 
  IoLogoWhatsapp, IoMail, IoCall, IoPaw, IoInformationCircle,
  IoPencil, IoTrash
} from 'react-icons/io5';

export default function Clientes() {
  const [showModal, setShowModal] = useState(false);
  const [showModalPerfil, setShowModalPerfil] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  
  // Estados para Edición
  const [editando, setEditando] = useState(false);
  const [idClienteEdit, setIdClienteEdit] = useState(null);

  // Estados para el perfil seleccionado
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mascotasDelCliente, setMascotasDelCliente] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);

  const estadoInicial = { nombre: '', telefono: '', email: '' };
  const [nuevoCliente, setNuevoCliente] = useState(estadoInicial);

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), where('rol', '==', 'cliente'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaClientes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(listaClientes);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // --- FUNCIONES DE LECTURA ---
  const verPerfil = async (cliente) => {
    setClienteSeleccionado(cliente);
    setShowModalPerfil(true);
    setCargandoMascotas(true);

    try {
      const qMascotas = query(
        collection(db, 'mascotas'), 
        where('dueñoNombre', '==', cliente.nombre)
      );
      const snap = await getDocs(qMascotas);
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMascotasDelCliente(lista);
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
    } finally {
      setCargandoMascotas(false);
    }
  };

  // --- FUNCIONES DE ESCRITURA (CREAR / EDITAR / ELIMINAR) ---
  const handleChange = (e) => setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });

  const prepararEdicion = (cliente) => {
    setNuevoCliente({ nombre: cliente.nombre, telefono: cliente.telefono, email: cliente.email || '' });
    setIdClienteEdit(cliente.id);
    setEditando(true);
    setShowModalPerfil(false); // Cerramos el perfil
    setShowModal(true);        // Abrimos el formulario
  };

  const eliminarCliente = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar a este cliente? Esta acción no se puede deshacer y perderá su acceso a la App.")) {
      try {
        await deleteDoc(doc(db, 'usuarios', id));
        setShowModalPerfil(false);
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("Hubo un error al intentar eliminar el cliente.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (editando) {
        // ACTUALIZAR EXISTENTE
        await updateDoc(doc(db, 'usuarios', idClienteEdit), {
          nombre: nuevoCliente.nombre.trim(),
          telefono: nuevoCliente.telefono.trim(),
          email: nuevoCliente.email.toLowerCase().trim()
        });
      } else {
        // CREAR NUEVO
        await addDoc(collection(db, 'usuarios'), {
          nombre: nuevoCliente.nombre.trim(),
          telefono: nuevoCliente.telefono.trim(),
          email: nuevoCliente.email.toLowerCase().trim(),
          rol: 'cliente',
          hasApp: false,
          fechaRegistroMostrador: serverTimestamp()
        });
      }
      cerrarModalFormulario();
    } catch (error) { 
      console.error(error); 
    } finally { 
      setGuardando(false); 
    }
  };

  const abrirModalNuevo = () => {
    setEditando(false);
    setIdClienteEdit(null);
    setNuevoCliente(estadoInicial);
    setShowModal(true);
  };

  const cerrarModalFormulario = () => {
    setShowModal(false);
    setNuevoCliente(estadoInicial);
    setEditando(false);
    setIdClienteEdit(null);
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (cliente.telefono && cliente.telefono.includes(busqueda))
  );

  return (
    <div className="glass-card">
      <div className="p-4 p-md-5 border-bottom d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border-light)' }}>
        <div>
          <h3 className="fw-bold m-0" style={{fontSize: '20px'}}>Directorio de Clientes</h3>
          <p className="text-muted m-0" style={{fontSize: '14px'}}>Base de datos unificada (App + Mostrador)</p>
        </div>
        <div className="d-flex gap-3">
          <div className="position-relative">
            <IoSearch className="position-absolute" style={{left: '12px', top: '15px', color: '#94A3B8'}} />
            <Form.Control 
              type="text" 
              placeholder="Buscar..." 
              className="custom-input ps-5"
              style={{ width: '250px' }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button onClick={abrirModalNuevo} className="btn text-white fw-bold px-4 py-2 d-flex align-items-center gap-2" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
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
                <th>Contacto</th>
                <th>Estatus App</th>
                <th className="text-end">Ficha</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-placeholder"><IoPerson size={18} /></div>
                      <span className="fw-bold">{cliente.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div className="small">
                      <div className="text-dark fw-medium"><IoCall size={14} className="me-1"/>{cliente.telefono}</div>
                      <div className="text-muted"><IoMail size={14} className="me-1"/>{cliente.email}</div>
                    </div>
                  </td>
                  <td>
                    <Badge bg={cliente.hasApp ? "success" : "secondary"}>
                      {cliente.hasApp ? "Vinculado" : "Sin App"}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <button onClick={() => verPerfil(cliente)} className="btn btn-sm fw-bold" style={{color: 'var(--accent)', backgroundColor: 'rgba(217, 119, 6, 0.1)'}}>
                      Ver Perfil
                    </button>
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
      
      {/* --- MODAL 1: FORMULARIO (NUEVO / EDITAR) --- */}
      <Modal show={showModal} onHide={cerrarModalFormulario} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">{editando ? 'Editar Cliente' : 'Registro de Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Nombre</Form.Label>
              <Form.Control type="text" name="nombre" value={nuevoCliente.nombre} onChange={handleChange} className="custom-input" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Teléfono</Form.Label>
              <Form.Control type="tel" name="telefono" value={nuevoCliente.telefono} onChange={handleChange} className="custom-input" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Email</Form.Label>
              <Form.Control type="email" name="email" value={nuevoCliente.email} onChange={handleChange} className="custom-input" required />
            </Form.Group>
            <button type="submit" className="btn w-100 text-white fw-bold py-3 mt-3" style={{ backgroundColor: 'var(--accent)' }} disabled={guardando}>
              {guardando ? <Spinner size="sm" /> : (editando ? 'Guardar Cambios' : 'Guardar Cliente')}
            </button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL 2: PERFIL DETALLADO --- */}
      <Modal show={showModalPerfil} onHide={() => setShowModalPerfil(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light border-0">
          <Modal.Title className="fw-bold">Expediente del Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {clienteSeleccionado && (
            <div className="d-flex flex-column flex-md-row">
              {/* Columna Izquierda: Info Dueño */}
              <div className="p-4 border-end bg-light" style={{ width: '100%', maxWidth: '300px' }}>
                <div className="text-center mb-4">
                  <div className="mx-auto mb-3" style={{width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
                    <IoPerson size={40} />
                  </div>
                  <h5 className="fw-bold mb-1">{clienteSeleccionado.nombre}</h5>
                  <Badge bg={clienteSeleccionado.hasApp ? "success" : "secondary"}>
                    {clienteSeleccionado.hasApp ? "Usuario App" : "Cliente Local"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <h6 className="fw-bold small text-muted text-uppercase mb-3">Contacto Directo</h6>
                  <a href={`https://wa.me/52${clienteSeleccionado.telefono}`} target="_blank" rel="noreferrer" className="btn btn-success w-100 mb-2 d-flex align-items-center justify-content-center gap-2 fw-bold">
                    <IoLogoWhatsapp size={18} /> WhatsApp
                  </a>
                  <div className="p-3 bg-white rounded border small">
                    <div className="mb-2"><strong>Tel:</strong> {clienteSeleccionado.telefono}</div>
                    <div><strong>Email:</strong> {clienteSeleccionado.email}</div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Mascotas y Actividad */}
              <div className="p-4 flex-grow-1">
                <h6 className="fw-bold d-flex align-items-center gap-2 mb-4">
                  <IoPaw color="var(--accent)"/> Mascotas Registradas
                </h6>

                {cargandoMascotas ? (
                  <div className="text-center py-4"><Spinner size="sm" animation="border" /></div>
                ) : (
                  <Row className="g-3">
                    {mascotasDelCliente.length > 0 ? mascotasDelCliente.map(pet => (
                      <Col key={pet.id} sm={6}>
                        <Card className="border-0 bg-light p-3 rounded-4">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-white p-2 rounded-3 shadow-sm"><IoPaw size={20} color="#64748B" /></div>
                            <div>
                              <div className="fw-bold text-dark">{pet.nombre}</div>
                              <div className="small text-muted">{pet.raza || 'Raza no especificada'}</div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    )) : (
                      <div className="p-4 text-center border rounded-4 border-dashed">
                        <IoInformationCircle size={30} className="text-muted mb-2" />
                        <p className="text-muted small m-0">Este cliente aún no tiene mascotas vinculadas.</p>
                      </div>
                    )}
                  </Row>
                )}

                <hr className="my-4" />
                <h6 className="fw-bold small text-muted text-uppercase mb-3">Acciones Administrativas</h6>
                <div className="d-flex gap-2">
                  <button onClick={() => prepararEdicion(clienteSeleccionado)} className="btn btn-outline-dark btn-sm fw-bold d-flex align-items-center gap-1">
                    <IoPencil size={16} /> Editar Datos
                  </button>
                  <button onClick={() => eliminarCliente(clienteSeleccionado.id)} className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-1">
                    <IoTrash size={16} /> Eliminar Cliente
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .avatar-placeholder { width: 40px; height: 40px; borderRadius: 10px; backgroundColor: #F3F4F6; display: flex; align-items: center; justifyContent: center; color: #64748B; }
        .border-dashed { border-style: dashed !important; }
      `}</style>
    </div>
  );
}