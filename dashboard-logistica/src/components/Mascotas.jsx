import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Spinner, Badge, Modal } from 'react-bootstrap';
// 1. IMPORTANTE: Agregamos deleteDoc a Firebase
import { collection, onSnapshot, addDoc, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
// 2. Agregamos el ícono IoTrash
import { IoSearch, IoPaw, IoPencil, IoTrash } from 'react-icons/io5';

const RAZAS_COMUNES = [
  'Mestizo / Criollo', 'Husky Siberiano', 'Golden Retriever', 'Labrador', 
  'Poodle (Caniche)', 'Pug', 'Bulldog Francés', 'Bulldog Inglés', 
  'Chihuahua', 'Pastor Alemán', 'Bichón Frisé', 'Terrier Escocés', 'Gato Doméstico', 'Gato Persa', 'Golden Retriever', 'Otro'
];

const ETIQUETAS_DISPONIBLES = [
  'Tranquilo', 'Nervioso', 'Agresivo', 'Pelo Largo', 'Pelo Corto', 
  'Alergias', 'Geriátrico', 'Requiere Bozal'
];

export default function Mascotas() {
  const [clientes, setClientes] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [nuevaMascota, setNuevaMascota] = useState({
    dueñoId: '', dueñoNombre: '', nombre: '', raza: '', notas: [] 
  });

  const [showModalEdit, setShowModalEdit] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState(null);

  useEffect(() => {
    const qClientes = query(collection(db, 'clientes'));
    const unsubscribeClientes = onSnapshot(qClientes, (snapshot) => {
      setClientes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qMascotas = query(collection(db, 'mascotas'));
    const unsubscribeMascotas = onSnapshot(qMascotas, (snapshot) => {
      setMascotas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });

    return () => { unsubscribeClientes(); unsubscribeMascotas(); };
  }, []);

  const toggleEtiqueta = (etiqueta, esEdicion = false) => {
    if (esEdicion) {
      const notasActuales = mascotaEditando.notas || [];
      const nuevasNotas = notasActuales.includes(etiqueta)
        ? notasActuales.filter(t => t !== etiqueta)
        : [...notasActuales, etiqueta];
      setMascotaEditando({ ...mascotaEditando, notas: nuevasNotas });
    } else {
      const nuevasNotas = nuevaMascota.notas.includes(etiqueta)
        ? nuevaMascota.notas.filter(t => t !== etiqueta)
        : [...nuevaMascota.notas, etiqueta];
      setNuevaMascota({ ...nuevaMascota, notas: nuevasNotas });
    }
  };

  const handleChangeCrear = (e) => {
    const { name, value } = e.target;
    if (name === 'dueñoId') {
      const clienteSeleccionado = clientes.find(c => c.id === value);
      setNuevaMascota({ ...nuevaMascota, dueñoId: value, dueñoNombre: clienteSeleccionado ? clienteSeleccionado.nombre : '' });
    } else {
      setNuevaMascota({ ...nuevaMascota, [name]: value });
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevaMascota.dueñoId) return alert("Selecciona un dueño.");
    setGuardando(true);
    try {
      await addDoc(collection(db, 'mascotas'), nuevaMascota);
      setNuevaMascota({ dueñoId: '', dueñoNombre: '', nombre: '', raza: '', notas: [] });
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  const abrirModalEdicion = (mascota) => {
    const notasArray = Array.isArray(mascota.notas) ? mascota.notas : (mascota.notas ? mascota.notas.split(',') : []);
    setMascotaEditando({ ...mascota, notas: notasArray });
    setShowModalEdit(true);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    setGuardandoEdicion(true);
    try {
      const mascotaRef = doc(db, 'mascotas', mascotaEditando.id);
      await updateDoc(mascotaRef, {
        nombre: mascotaEditando.nombre,
        raza: mascotaEditando.raza,
        notas: mascotaEditando.notas
      });
      setShowModalEdit(false);
    } catch (error) {
      console.error("Error actualizando: ", error);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // --- NUEVA FUNCIÓN: ELIMINAR MASCOTA ---
  const handleEliminar = async () => {
    // Pedimos confirmación nativa del navegador por seguridad
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar el perfil de ${mascotaEditando.nombre}? Esta acción no se puede deshacer.`);
    
    if (confirmar) {
      setGuardandoEdicion(true);
      try {
        await deleteDoc(doc(db, 'mascotas', mascotaEditando.id));
        setShowModalEdit(false);
      } catch (error) {
        console.error("Error al eliminar la mascota: ", error);
      } finally {
        setGuardandoEdicion(false);
      }
    }
  };

  const mascotasFiltradas = mascotas.filter(m => 
    m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    (m.dueñoNombre && m.dueñoNombre.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <Row className="gx-4">
      <Col md={5} lg={4}>
        <div className="glass-card p-4 h-100">
          <h4 className="fw-bold mb-1" style={{fontSize: '18px'}}>Registro de Perfil</h4>
          <p className="text-muted mb-4" style={{fontSize: '13px'}}>Añade una nueva mascota al sistema.</p>
          
          <Form onSubmit={handleCrear}>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Dueño (Cliente)</Form.Label>
              <Form.Select name="dueñoId" value={nuevaMascota.dueñoId} onChange={handleChangeCrear} className="custom-input" required>
                <option value="">Selecciona un cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Nombre</Form.Label>
              <Form.Control type="text" name="nombre" value={nuevaMascota.nombre} onChange={handleChangeCrear} placeholder="Ej. Rocky" className="custom-input" required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Raza</Form.Label>
              <Form.Select name="raza" value={nuevaMascota.raza} onChange={handleChangeCrear} className="custom-input" required>
                <option value="">Selecciona raza...</option>
                {RAZAS_COMUNES.map(raza => <option key={raza} value={raza}>{raza}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="custom-label mb-2">Etiquetas de Comportamiento</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {ETIQUETAS_DISPONIBLES.map(tag => {
                  const isSelected = nuevaMascota.notas.includes(tag);
                  return (
                    <Badge 
                      key={tag} 
                      bg={isSelected ? 'warning' : 'light'} 
                      text={isSelected ? 'dark' : 'secondary'}
                      className="border"
                      style={{ cursor: 'pointer', padding: '6px 10px', fontWeight: isSelected ? '700' : '500' }}
                      onClick={() => toggleEtiqueta(tag, false)}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            </Form.Group>

            <button type="submit" className="btn w-100 py-3 fw-bold text-white mt-2 d-flex justify-content-center align-items-center gap-2" style={{ backgroundColor: 'var(--accent)', borderRadius: '10px' }} disabled={guardando}>
              {guardando ? <Spinner size="sm" /> : 'Guardar Perfil'}
            </button>
          </Form>
        </div>
      </Col>

      <Col md={7} lg={8}>
        <div className="glass-card p-4 p-md-5 h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold m-0" style={{fontSize: '18px'}}>Base de Datos</h4>
            <div className="position-relative">
              <IoSearch className="position-absolute" style={{left: '12px', top: '15px', color: '#94A3B8'}} />
              <Form.Control type="text" placeholder="Buscar..." className="custom-input" style={{ width: '250px', paddingLeft: '35px' }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
          </div>

          {cargando ? (
            <div className="text-center py-5"><Spinner animation="border" style={{color: 'var(--accent)'}} /></div>
          ) : (
            <Row className="gy-3">
              {mascotasFiltradas.map((mascota) => {
                const notasArray = Array.isArray(mascota.notas) ? mascota.notas : (mascota.notas ? mascota.notas.split(',') : []);
                
                return (
                  <Col md={6} key={mascota.id}>
                    <div className="p-3 rounded-3" style={{ border: '1px solid var(--border-light)' }}>
                      <div className="d-flex gap-3">
                        <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <IoPaw size={24} color="#64748B" />
                        </div>
                        <div>
                          <h5 className="fw-bold m-0" style={{fontSize: '15px'}}>{mascota.nombre}</h5>
                          <p className="text-muted m-0" style={{fontSize: '13px'}}>{mascota.raza} • Dueño: {mascota.dueñoNombre}</p>
                          <div className="mt-2 d-flex flex-wrap gap-1">
                            {notasArray.map((nota, index) => (
                              <Badge key={index} bg="light" text="dark" className="border" style={{fontSize: '10px'}}>{nota.trim()}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-top d-flex justify-content-between">
                        <button onClick={() => abrirModalEdicion(mascota)} className="btn btn-sm fw-bold text-muted d-flex align-items-center gap-1" style={{fontSize: '12px'}}>
                          <IoPencil /> Editar Datos
                        </button>
                        <button className="btn btn-sm fw-bold" style={{color: 'var(--accent)', fontSize: '12px'}}>Ver Carnet</button>
                      </div>
                    </div>
                  </Col>
                );
              })}
              {mascotasFiltradas.length === 0 && <div className="text-center py-5 text-muted w-100">No se encontraron mascotas.</div>}
            </Row>
          )}
        </div>
      </Col>

      <Modal show={showModalEdit} onHide={() => setShowModalEdit(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-light)' }}>
          <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ fontSize: '18px' }}>
            <IoPencil color="var(--accent)" /> Editar Perfil de Mascota
          </Modal.Title>
        </Modal.Header>
        {mascotaEditando && (
          <Modal.Body className="p-4">
            <Form onSubmit={handleEditar}>
              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Dueño (No editable)</Form.Label>
                <Form.Control type="text" value={mascotaEditando.dueñoNombre} className="custom-input bg-light" disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Nombre</Form.Label>
                <Form.Control type="text" value={mascotaEditando.nombre} onChange={(e) => setMascotaEditando({...mascotaEditando, nombre: e.target.value})} className="custom-input" required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="custom-label">Raza</Form.Label>
                <Form.Select value={mascotaEditando.raza} onChange={(e) => setMascotaEditando({...mascotaEditando, raza: e.target.value})} className="custom-input" required>
                  {RAZAS_COMUNES.map(raza => <option key={raza} value={raza}>{raza}</option>)}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="custom-label mb-2">Etiquetas</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {ETIQUETAS_DISPONIBLES.map(tag => {
                    const isSelected = (mascotaEditando.notas || []).includes(tag);
                    return (
                      <Badge 
                        key={tag} 
                        bg={isSelected ? 'warning' : 'light'} 
                        text={isSelected ? 'dark' : 'secondary'}
                        className="border"
                        style={{ cursor: 'pointer', padding: '6px 10px', fontWeight: isSelected ? '700' : '500' }}
                        onClick={() => toggleEtiqueta(tag, true)}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </Form.Group>

              {/* FOOTER DEL MODAL ACTUALIZADO CON BOTÓN ELIMINAR */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button 
                  type="button" 
                  onClick={handleEliminar} 
                  className="btn text-danger fw-bold d-flex align-items-center gap-1 px-3" 
                  disabled={guardandoEdicion}
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}
                >
                  <IoTrash /> Eliminar
                </button>
                
                <div className="d-flex gap-2">
                  <button type="button" onClick={() => setShowModalEdit(false)} className="btn text-muted fw-bold" disabled={guardandoEdicion}>Cancelar</button>
                  <button type="submit" className="btn fw-bold text-white" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }} disabled={guardandoEdicion}>
                    {guardandoEdicion ? <Spinner size="sm" /> : 'Actualizar'}
                  </button>
                </div>
              </div>
            </Form>
          </Modal.Body>
        )}
      </Modal>

    </Row>
  );
}