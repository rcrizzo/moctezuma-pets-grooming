import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Table, Spinner, Badge } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { IoHome, IoSearch, IoAdd, IoEye, IoBed, IoRestaurant, IoCalendarOutline, IoCheckmarkDone, IoTrash, IoNotifications, IoCloseCircle, IoAlertCircle } from 'react-icons/io5';

// --- CATÁLOGOS ---
const TIPOS_HABITACION = ['Corral General', 'Jaula Individual', 'Suite Premium', 'Área de Gatos'];
const NIVELES_SOCIALIZACION = ['Amigable', 'Reactivo', 'Miedoso'];

export default function Hospedaje() {
  const [mascotas, setMascotas] = useState([]);
  const [dueños, setDueños] = useState([]); // <-- NUEVO: Estado para lista de dueños
  const [estancias, setEstancias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Modales
  const [showModalSolicitud, setShowModalSolicitud] = useState(false);
  const [showModalAprobar, setShowModalAprobar] = useState(false);
  const [showModalFicha, setShowModalFicha] = useState(false);

  const estadoInicial = {
    mascotaId: '', mascotaNombre: '', dueñoNombre: '', 
    fechaIngreso: '', fechaSalida: '', 
    guiaAlimentacion: '', 
    nivelSocializacion: 'Amigable', 
    pertenencias: '', notas: '', 
    habitacion: 'Sin Asignar', 
    estado: 'Pendiente' 
  };

  const [nuevaSolicitud, setNuevaSolicitud] = useState(estadoInicial);
  const [solicitudActiva, setSolicitudActiva] = useState(null);

  useEffect(() => {
    // 1. Escuchar Mascotas y extraer lista de Dueños
    const unsubMascotas = onSnapshot(query(collection(db, 'mascotas')), (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMascotas(docs);
      
      // Extraemos la lista única de dueños
      const uniqueOwners = Array.from(new Set(docs.map(m => m.dueñoNombre || m.duenoNombre).filter(Boolean)));
      setDueños(uniqueOwners.sort());
    });

    const qEstancias = query(collection(db, 'hospedaje'), orderBy('createdAt', 'desc'));
    const unsubEstancias = onSnapshot(qEstancias, (snap) => {
      setEstancias(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });

    return () => { unsubMascotas(); unsubEstancias(); };
  }, []);

  // --- MANEJADORES DUEÑO -> MASCOTA ---
  const handleCambioDueño = (nombreDueño) => {
    setNuevaSolicitud({ ...nuevaSolicitud, dueñoNombre: nombreDueño, mascotaId: '', mascotaNombre: '' });
  };

  const handleCambioMascota = (mascotaId) => {
    const pet = mascotas.find(m => m.id === mascotaId);
    setNuevaSolicitud({ ...nuevaSolicitud, mascotaId: mascotaId, mascotaNombre: pet?.nombre || '' });
  };

  // --- ACCIONES ---
  const crearSolicitudManual = async (e) => {
    e.preventDefault();
    if (!nuevaSolicitud.mascotaId) return alert("Selecciona un huésped");
    try {
      await addDoc(collection(db, 'hospedaje'), {
        ...nuevaSolicitud,
        createdAt: serverTimestamp()
      });
      setShowModalSolicitud(false);
      setNuevaSolicitud(estadoInicial);
    } catch (err) { console.error(err); }
  };

  const aprobarReserva = async (e) => {
    e.preventDefault();
    try {
      // Al cambiar el estado a 'Hospedado', el Resumen lo detectará automáticamente
      await updateDoc(doc(db, 'hospedaje', solicitudActiva.id), {
        habitacion: solicitudActiva.habitacion,
        estado: 'Hospedado',
        aprobadoAt: serverTimestamp()
      });
      setShowModalAprobar(false);
    } catch (err) { console.error(err); }
  };

  const rechazarReserva = async (id) => {
    if(window.confirm("¿Estás seguro de rechazar esta solicitud de hospedaje? Se notificará al cliente.")){
      await updateDoc(doc(db, 'hospedaje', id), { estado: 'Rechazado' });
      setShowModalAprobar(false);
    }
  };

  const darDeAlta = async (id) => {
    if (window.confirm("¿Confirmas la salida de la mascota?")) {
      await updateDoc(doc(db, 'hospedaje', id), { estado: 'Finalizado', salidaReal: serverTimestamp() });
      setShowModalFicha(false);
    }
  };

  // Filtros rápidos
  const solicitudes = estancias.filter(e => e.estado === 'Pendiente');
  const huespedes = estancias.filter(e => e.estado === 'Hospedado');
  const fechaHoy = new Date().toISOString().split('T')[0];

  const colorSocializacion = (nivel) => {
    if(nivel === 'Amigable') return 'success';
    if(nivel === 'Reactivo') return 'danger';
    return 'info'; 
  };

  // 0. PANTALLA DE CARGA
  if (cargando) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '70vh' }}>
        <Spinner animation="border" style={{ color: '#F59E0B' }} />
        <p className="text-muted mt-3 fw-bold">Cargando logística del hotel...</p>
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. DASHBOARD SUPERIOR */}
      <Row className="mb-4 gx-3">
        <Col md={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid #F59E0B'}}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Solicitudes App</p>
                <h2 className="fw-bold m-0 text-warning">{solicitudes.length} Pendientes</h2>
              </div>
              <div className="p-3 bg-light rounded-circle"><IoNotifications size={28} color="#F59E0B" /></div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid var(--accent)'}}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Ocupación Actual</p>
                <h2 className="fw-bold m-0" style={{color: 'var(--accent)'}}>{huespedes.length} Huéspedes</h2>
              </div>
              <div className="p-3 bg-light rounded-circle"><IoHome size={28} color="var(--accent)" /></div>
            </div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid #10B981'}}>
             <button onClick={() => setShowModalSolicitud(true)} className="btn text-white fw-bold d-flex align-items-center justify-content-center gap-2 w-100 h-100 py-3" style={{backgroundColor: '#10B981', borderRadius: '10px', fontSize: '15px'}}>
              <IoAdd size={22} /> Ingreso Manual (Mostrador)
            </button>
          </div>
        </Col>
      </Row>

      {/* 2. BANDEJA DE ENTRADA (SOLICITUDES DE LA APP) */}
      <h5 className="fw-bold mb-3 mt-2 d-flex align-items-center gap-2">
        <IoNotifications color="#F59E0B" /> Bandeja de Solicitudes (App)
      </h5>
      <Row className="mb-5 gx-3">
        {solicitudes.length > 0 ? solicitudes.map(sol => (
          <Col md={6} lg={4} key={sol.id}>
            <div className="glass-card p-4 h-100" style={{borderTop: `4px solid ${sol.nivelSocializacion === 'Reactivo' ? '#EF4444' : '#3B82F6'}`}}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="fw-bold m-0">{sol.mascotaNombre}</h5>
                <Badge bg={colorSocializacion(sol.nivelSocializacion)}>{sol.nivelSocializacion}</Badge>
              </div>
              <p className="text-muted small mb-3">Dueño: {sol.dueñoNombre}</p>
              <div className="bg-light p-2 rounded mb-3 small">
                <strong>Fechas:</strong> {sol.fechaIngreso} al {sol.fechaSalida}
              </div>
              <button 
                onClick={() => {
                  // MEJORA: Pre-selecciona Jaula Individual si es Reactivo
                  const habitacionSugerida = sol.nivelSocializacion === 'Reactivo' ? 'Jaula Individual' : 'Corral General';
                  setSolicitudActiva({...sol, habitacion: habitacionSugerida}); 
                  setShowModalAprobar(true);
                }} 
                className="btn btn-dark w-100 fw-bold"
              >
                Evaluar y Asignar
              </button>
            </div>
          </Col>
        )) : (
          <Col><p className="text-muted fst-italic ms-2">No hay solicitudes nuevas de hospedaje por el momento.</p></Col>
        )}
      </Row>

      {/* 3. CONTROL DE HABITACIONES (HUÉSPEDES ACTIVOS) */}
      <div className="glass-card mb-4">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold m-0 d-flex align-items-center gap-2"><IoBed color="var(--accent)"/> Huéspedes en Instalaciones</h5>
          <div className="position-relative">
            <IoSearch className="position-absolute" style={{left: '12px', top: '12px', color: '#94A3B8'}} />
            <Form.Control type="text" placeholder="Buscar..." className="custom-input ps-5" style={{width: '250px'}} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>

        <Table borderless hover responsive className="beauty-table m-0 align-middle">
          <thead>
            <tr>
              <th>Huésped</th>
              <th>Habitación</th>
              <th>Socialización</th>
              <th>Salida Programada</th>
              <th className="text-end">Ficha</th>
            </tr>
          </thead>
          <tbody>
            {huespedes.filter(h => h.mascotaNombre?.toLowerCase().includes(busqueda.toLowerCase())).map((huesped) => (
              <tr key={huesped.id}>
                <td>
                  <span className="fw-bold d-block">{huesped.mascotaNombre}</span>
                  <small className="text-muted">{huesped.dueñoNombre}</small>
                </td>
                <td><Badge bg="secondary">{huesped.habitacion}</Badge></td>
                <td><Badge bg={colorSocializacion(huesped.nivelSocializacion)} style={{fontSize: '10px'}}>{huesped.nivelSocializacion}</Badge></td>
                <td>
                  <strong className={huesped.fechaSalida === fechaHoy ? 'text-danger' : 'text-dark'}>
                    {huesped.fechaSalida} {huesped.fechaSalida === fechaHoy && '(Hoy)'}
                  </strong>
                </td>
                <td className="text-end">
                  <button onClick={() => {setSolicitudActiva(huesped); setShowModalFicha(true);}} className="btn btn-sm btn-light border p-2">
                    <IoEye size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {huespedes.length === 0 && (
              <tr><td colSpan="5" className="text-center py-5 text-muted">Habitaciones vacías.</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* --- MODAL 1: APROBAR SOLICITUD DE LA APP --- */}
      <Modal show={showModalAprobar} onHide={() => setShowModalAprobar(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light"><Modal.Title className="fw-bold">Evaluar Solicitud de Reserva</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {solicitudActiva && (
            <Form onSubmit={aprobarReserva}>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-white border rounded h-100">
                    <h6 className="fw-bold text-muted small mb-3">DATOS DE LA APP</h6>
                    <p className="m-0 mb-1"><strong>Paciente:</strong> {solicitudActiva.mascotaNombre}</p>
                    <p className="m-0 mb-1"><strong>Fechas:</strong> {solicitudActiva.fechaIngreso} - {solicitudActiva.fechaSalida}</p>
                    <p className="m-0 mt-2"><strong>Socialización:</strong> <Badge bg={colorSocializacion(solicitudActiva.nivelSocializacion)}>{solicitudActiva.nivelSocializacion}</Badge></p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded h-100" style={{backgroundColor: '#F8FAFC'}}>
                    <h6 className="fw-bold text-muted small mb-2 d-flex align-items-center gap-1"><IoRestaurant/> GUÍA DE ALIMENTACIÓN</h6>
                    <p className="m-0 text-dark small">{solicitudActiva.guiaAlimentacion || 'Sin instrucciones específicas.'}</p>
                  </div>
                </Col>
              </Row>

              <hr />
              <h6 className="fw-bold text-primary mb-3">Asignación de Logística</h6>
              <Form.Group className="mb-4">
                <Form.Label className="custom-label">Seleccionar Habitación (Sujeto a disponibilidad y comportamiento)</Form.Label>
                <Form.Select 
                  value={solicitudActiva.habitacion} 
                  onChange={e => setSolicitudActiva({...solicitudActiva, habitacion: e.target.value})} 
                  className="custom-input" style={{borderColor: 'var(--accent)', borderWidth: '2px'}}
                >
                  {TIPOS_HABITACION.map(h => <option key={h} value={h}>{h}</option>)}
                </Form.Select>
                {solicitudActiva.nivelSocializacion === 'Reactivo' && (
                  <Form.Text className="text-danger fw-bold mt-2 d-block"><IoAlertCircle size={18} className="me-1"/> Se recomienda Jaula Individual por seguridad.</Form.Text>
                )}
              </Form.Group>

              <div className="d-flex justify-content-between pt-2">
                <button type="button" onClick={() => rechazarReserva(solicitudActiva.id)} className="btn btn-outline-danger d-flex align-items-center gap-2 fw-bold">
                  <IoCloseCircle size={20} /> Rechazar
                </button>
                <button type="submit" className="btn text-white fw-bold px-5" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
                  <IoCheckmarkDone size={20} className="me-2"/> Confirmar y Hospedar
                </button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* --- MODAL 2: NUEVA SOLICITUD MANUAL (Mostrador) --- */}
      <Modal show={showModalSolicitud} onHide={() => setShowModalSolicitud(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold">Ingreso Manual (Recepción)</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={crearSolicitudManual}>
            
            {/* LÓGICA DUEÑO -> MASCOTA INTEGRADA */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="custom-label">Dueño (Cliente)</Form.Label>
                <Form.Select 
                  value={nuevaSolicitud.dueñoNombre} 
                  onChange={e => handleCambioDueño(e.target.value)} 
                  className="custom-input" required
                >
                  <option value="">Seleccionar dueño...</option>
                  {dueños.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="custom-label">Mascota</Form.Label>
                <Form.Select 
                  value={nuevaSolicitud.mascotaId} 
                  onChange={e => handleCambioMascota(e.target.value)} 
                  className="custom-input" required
                  disabled={!nuevaSolicitud.dueñoNombre}
                >
                  <option value="">Seleccionar huésped...</option>
                  {mascotas
                    .filter(m => (m.dueñoNombre || m.duenoNombre) === nuevaSolicitud.dueñoNombre)
                    .map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)
                  }
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}><Form.Label className="custom-label">Ingreso</Form.Label><Form.Control type="date" onChange={e => setNuevaSolicitud({...nuevaSolicitud, fechaIngreso: e.target.value})} className="custom-input" required /></Col>
              <Col md={6}><Form.Label className="custom-label">Salida</Form.Label><Form.Control type="date" onChange={e => setNuevaSolicitud({...nuevaSolicitud, fechaSalida: e.target.value})} className="custom-input" required /></Col>
            </Row>

            <Row className="mb-3">
               <Col md={4}>
                <Form.Label className="custom-label">Comportamiento</Form.Label>
                <Form.Select onChange={e => setNuevaSolicitud({...nuevaSolicitud, nivelSocializacion: e.target.value})} className="custom-input">
                  {NIVELES_SOCIALIZACION.map(n => <option key={n} value={n}>{n}</option>)}
                </Form.Select>
              </Col>
              <Col md={8}>
                <Form.Label className="custom-label">Guía de Alimentación</Form.Label>
                <Form.Control type="text" placeholder="Ej: 2 tazas de ProPlan al día (8am y 6pm)" onChange={e => setNuevaSolicitud({...nuevaSolicitud, guiaAlimentacion: e.target.value})} className="custom-input" required />
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label className="custom-label">Inventario de Pertenencias / Notas</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Cobija, juguetes, correa..." onChange={e => setNuevaSolicitud({...nuevaSolicitud, pertenencias: e.target.value})} className="custom-input" />
            </Form.Group>
            <button type="submit" className="btn w-100 text-white fw-bold py-3" style={{backgroundColor: '#10B981', borderRadius: '10px'}}>Crear Solicitud Pendiente</button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL 3: FICHA DE HUÉSPED Y CHECK-OUT --- */}
      <Modal show={showModalFicha} onHide={() => setShowModalFicha(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold">Ficha de Huésped</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {solicitudActiva && (
            <div>
              <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                <div>
                  <h3 className="fw-bold m-0">{solicitudActiva.mascotaNombre}</h3>
                  <p className="text-muted m-0">Habitación: <strong>{solicitudActiva.habitacion}</strong></p>
                </div>
                <Badge bg={colorSocializacion(solicitudActiva.nivelSocializacion)} className="d-flex align-items-center px-3" style={{fontSize: '14px'}}>{solicitudActiva.nivelSocializacion}</Badge>
              </div>

              <Row className="mb-4">
                <Col md={12}>
                  <div className="p-3 rounded border" style={{backgroundColor: '#FFFBEB'}}>
                    <h6 className="fw-bold text-warning-emphasis mb-2 d-flex align-items-center gap-1"><IoRestaurant/> ALIMENTACIÓN DIARIA</h6>
                    <p className="m-0 text-dark">{solicitudActiva.guiaAlimentacion}</p>
                  </div>
                </Col>
              </Row>
              <Row className="mb-4">
                 <Col md={12}>
                  <div className="p-3 bg-light rounded border">
                    <h6 className="fw-bold text-muted mb-2">PERTENENCIAS Y NOTAS</h6>
                    <p className="m-0 text-dark">{solicitudActiva.pertenencias || 'Sin pertenencias registradas.'}</p>
                  </div>
                </Col>
              </Row>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <button onClick={() => { deleteDoc(doc(db, 'hospedaje', solicitudActiva.id)); setShowModalFicha(false); }} className="btn btn-outline-danger d-flex align-items-center gap-2 border-0">
                  <IoTrash /> Borrar Registro
                </button>
                <button onClick={() => darDeAlta(solicitudActiva.id)} className="btn btn-dark fw-bold px-4 py-2 d-flex align-items-center gap-2">
                  <IoCheckmarkDone size={20} /> Entregar Mascota (Check-out)
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}