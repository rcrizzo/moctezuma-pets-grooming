import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Table, Spinner, Badge } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { IoCut, IoSearch, IoAdd, IoEye, IoTime, IoWarning, IoCheckmarkCircle, IoCheckmarkDone, IoTrash, IoWater } from 'react-icons/io5';

// --- CATÁLOGOS DE ESTÉTICA ---
const SERVICIOS_GROOMING = [
  'Baño Básico', 'Baño Medicado', 'Corte de Pelo (Estilismo)', 
  'Deslanado', 'Corte de Uñas y Limpieza', 'Paquete Spa Completo'
];
const ESTADOS_GROOMING = ['Pendiente', 'En la Mesa (Proceso)', 'Listo para Recoger', 'Entregado'];
const HORARIOS = ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'];

export default function Grooming() {
  const [mascotas, setMascotas] = useState([]);
  const [citasGrooming, setCitasGrooming] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [showModalCita, setShowModalCita] = useState(false);
  const [showModalAtender, setShowModalAtender] = useState(false);

  const estadoInicial = {
    mascotaId: '', mascotaNombre: '', dueñoNombre: '', 
    servicio: 'Paquete Spa Completo',
    fechaCita: new Date().toLocaleDateString('es-MX'), // Hoy por defecto
    horaCita: '',
    notasEstilista: '', // Instrucciones de corte
    estado: 'Pendiente'
  };

  const [nuevaCita, setNuevaCita] = useState(estadoInicial);
  const [citaActiva, setCitaActiva] = useState(null);
  const [mascotaDetalle, setMascotaDetalle] = useState(null); // Para ver las alergias de la BD

  useEffect(() => {
    // 1. Escuchar Mascotas (Para jalar etiquetas y dueños)
    const unsubMascotas = onSnapshot(query(collection(db, 'mascotas')), (snap) => {
      setMascotas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Escuchar Citas de Grooming
    const qGrooming = query(collection(db, 'grooming'), orderBy('createdAt', 'desc'));
    const unsubGrooming = onSnapshot(qGrooming, (snap) => {
      setCitasGrooming(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });

    return () => { unsubMascotas(); unsubGrooming(); };
  }, []);

  // --- ACCIONES ---
  const agendarCita = async (e) => {
    e.preventDefault();
    if (!nuevaCita.mascotaId || !nuevaCita.horaCita) return alert("Faltan datos obligatorios.");
    try {
      await addDoc(collection(db, 'grooming'), {
        ...nuevaCita,
        createdAt: serverTimestamp()
      });
      setShowModalCita(false);
      setNuevaCita(estadoInicial);
    } catch (err) { console.error(err); }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'grooming', id), { estado: nuevoEstado, updatedAt: serverTimestamp() });
      if (nuevoEstado === 'Entregado') setShowModalAtender(false); // Cierra modal si ya se entregó
    } catch (err) { console.error(err); }
  };

  const eliminarCita = async (id) => {
    if (window.confirm("¿Cancelar y eliminar esta cita de estética?")) {
      await deleteDoc(doc(db, 'grooming', id));
      setShowModalAtender(false);
    }
  };

  const abrirMesaDeTrabajo = (cita) => {
    setCitaActiva(cita);
    // Buscamos el expediente médico/perfil de la mascota para ver si tiene etiquetas
    const perfilMascota = mascotas.find(m => m.id === cita.mascotaId);
    setMascotaDetalle(perfilMascota);
    setShowModalAtender(true);
  };

  // Filtros de estado para KPIs
  const hoy = new Date().toLocaleDateString('es-MX');
  const pendientes = citasGrooming.filter(c => c.estado === 'Pendiente');
  const enProceso = citasGrooming.filter(c => c.estado === 'En la Mesa (Proceso)');
  const listos = citasGrooming.filter(c => c.estado === 'Listo para Recoger');

  // Estilos de Badge por Estado
  const badgeEstado = (estado) => {
    switch(estado) {
      case 'Pendiente': return 'warning';
      case 'En la Mesa (Proceso)': return 'primary';
      case 'Listo para Recoger': return 'success';
      default: return 'secondary'; // Entregado
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. DASHBOARD DE FLUJO DE TRABAJO (SPA PIPELINE) */}
      <Row className="mb-4 gx-3">
        <Col md={3}>
          <div className="glass-card p-4 h-100 border-bottom border-warning border-4 text-center">
            <IoTime size={32} color="#F59E0B" className="mb-2" />
            <h2 className="fw-bold m-0">{pendientes.length}</h2>
            <p className="text-muted small fw-bold mb-0 text-uppercase">Pendientes</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="glass-card p-4 h-100 border-bottom border-primary border-4 text-center">
            <IoWater size={32} color="#3B82F6" className="mb-2" />
            <h2 className="fw-bold m-0 text-primary">{enProceso.length}</h2>
            <p className="text-muted small fw-bold mb-0 text-uppercase">En la Mesa (Bañando)</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="glass-card p-4 h-100 border-bottom border-success border-4 text-center">
            <IoCheckmarkCircle size={32} color="#10B981" className="mb-2" />
            <h2 className="fw-bold m-0 text-success">{listos.length}</h2>
            <p className="text-muted small fw-bold mb-0 text-uppercase">Listos (Llamar Dueño)</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center">
            <button onClick={() => setShowModalCita(true)} className="btn w-100 h-100 text-white fw-bold d-flex flex-column align-items-center justify-content-center gap-2" style={{backgroundColor: 'var(--accent)', borderRadius: '10px'}}>
              <IoAdd size={28} /> Agendar Turno
            </button>
          </div>
        </Col>
      </Row>

      {/* 2. AGENDA DE ESTÉTICA */}
      <div className="glass-card mb-4">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h3 className="fw-bold m-0 d-flex align-items-center gap-2" style={{fontSize: '18px'}}>
            <IoCut /> Agenda de Estética Canina y Felina
          </h3>
          <div className="position-relative">
            <IoSearch className="position-absolute" style={{left: '12px', top: '12px', color: '#94A3B8'}} />
            <Form.Control type="text" placeholder="Buscar mascota..." className="custom-input ps-5" style={{width: '250px'}} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
        </div>

        <Table borderless hover responsive className="beauty-table m-0 align-middle">
          <thead>
            <tr>
              <th>Paciente / Dueño</th>
              <th>Horario</th>
              <th>Servicio a Realizar</th>
              <th>Estatus del Turno</th>
              <th className="text-end">Mesa de Trabajo</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
            ) : citasGrooming.filter(c => c.mascotaNombre?.toLowerCase().includes(busqueda.toLowerCase())).map((cita) => (
              <tr key={cita.id} style={{ opacity: cita.estado === 'Entregado' ? 0.5 : 1 }}>
                <td>
                  <span className="fw-bold d-block">{cita.mascotaNombre}</span>
                  <small className="text-muted">Dueño: {cita.dueñoNombre}</small>
                </td>
                <td>
                  <Badge bg="dark" className="d-block mb-1" style={{width: 'fit-content'}}>{cita.horaCita}</Badge>
                  <small className="text-muted">{cita.fechaCita}</small>
                </td>
                <td>
                  <span className="fw-bold d-block text-dark" style={{fontSize: '13px'}}>{cita.servicio}</span>
                  <small className="text-muted text-truncate d-block" style={{maxWidth: '180px'}}>{cita.notasEstilista}</small>
                </td>
                <td>
                  <Badge bg={badgeEstado(cita.estado)} className="px-3 py-2" style={{borderRadius: '20px'}}>
                    {cita.estado}
                  </Badge>
                </td>
                <td className="text-end">
                  {cita.estado !== 'Entregado' ? (
                    <button onClick={() => abrirMesaDeTrabajo(cita)} className="btn btn-sm fw-bold px-3 py-2 text-white shadow-sm" style={{backgroundColor: 'var(--accent)', borderRadius: '8px'}}>
                      Abrir Ficha
                    </button>
                  ) : (
                    <Badge bg="light" text="dark" className="border px-3 py-2"><IoCheckmarkDone size={16}/> Finalizado</Badge>
                  )}
                </td>
              </tr>
            ))}
            {citasGrooming.length === 0 && !cargando && (
              <tr><td colSpan="5" className="text-center py-5 text-muted">No hay turnos de estética programados.</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* --- MODAL: AGENDAR CITA --- */}
      <Modal show={showModalCita} onHide={() => setShowModalCita(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold">Agendar Turno de Estética</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={agendarCita}>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Mascota (Cliente)</Form.Label>
              <Form.Select onChange={e => {
                const pet = mascotas.find(m => m.id === e.target.value);
                setNuevaCita({...nuevaCita, mascotaId: e.target.value, mascotaNombre: pet?.nombre, dueñoNombre: pet?.dueñoNombre});
              }} className="custom-input" required>
                <option value="">Seleccionar mascota...</option>
                {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} (Dueño: {m.dueñoNombre})</option>)}
              </Form.Select>
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="custom-label">Servicio Requerido</Form.Label>
                <Form.Select value={nuevaCita.servicio} onChange={e => setNuevaCita({...nuevaCita, servicio: e.target.value})} className="custom-input">
                  {SERVICIOS_GROOMING.map(s => <option key={s} value={s}>{s}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="custom-label">Horario</Form.Label>
                <Form.Select onChange={e => setNuevaCita({...nuevaCita, horaCita: e.target.value})} className="custom-input" required>
                  <option value="">Seleccionar...</option>
                  {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Form.Label className="custom-label">Instrucciones Especiales del Dueño (Corte, Moños, Perfume)</Form.Label>
                <Form.Control as="textarea" rows={2} placeholder="Ej: Corte tipo osito, moños rosas, no cortar bigotes..." onChange={e => setNuevaCita({...nuevaCita, notasEstilista: e.target.value})} className="custom-input" />
              </Col>
            </Row>
            <button type="submit" className="btn w-100 text-white fw-bold py-3" style={{backgroundColor: 'var(--accent)', borderRadius: '10px'}}>Confirmar Turno</button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL: MESA DE TRABAJO (FICHA DEL ESTILISTA) --- */}
      <Modal show={showModalAtender} onHide={() => setShowModalAtender(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold d-flex align-items-center gap-2"><IoCut /> Ficha de Estilismo</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {citaActiva && (
            <div>
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                  <h3 className="fw-bold m-0">{citaActiva.mascotaNombre}</h3>
                  <p className="text-muted m-0">Dueño: {citaActiva.dueñoNombre}</p>
                </div>
                <Badge bg="dark" className="px-3 py-2" style={{fontSize: '14px'}}>{citaActiva.servicio}</Badge>
              </div>

              <Row className="mb-4">
                <Col md={7}>
                  <h6 className="fw-bold text-muted small text-uppercase mb-2">Instrucciones de Corte / Baño:</h6>
                  <div className="p-3 bg-light border rounded h-100">
                    <p className="m-0 text-dark" style={{fontSize: '15px'}}>{citaActiva.notasEstilista || 'Baño estándar. Sin instrucciones específicas.'}</p>
                  </div>
                </Col>
                
                {/* LA MAGIA: Integración con el Expediente Veterinario */}
                <Col md={5}>
                  <h6 className="fw-bold text-muted small text-uppercase mb-2">Historial Clínico (Alertas):</h6>
                  <div className="p-3 border rounded h-100" style={{backgroundColor: '#FEF2F2', borderColor: '#FCA5A5'}}>
                    {mascotaDetalle?.notas && mascotaDetalle.notas.length > 0 ? (
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2 text-danger fw-bold">
                          <IoWarning size={20} /> <span style={{fontSize: '13px'}}>PRECAUCIÓN</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {Array.isArray(mascotaDetalle.notas) 
                            ? mascotaDetalle.notas.map((n, i) => <Badge key={i} bg="danger" className="border-0">{n}</Badge>)
                            : <Badge bg="danger">{mascotaDetalle.notas}</Badge>
                          }
                        </div>
                        {/* Si encontramos etiquetas de alergia/piel, sugerimos el shampoo medicado del Inventario */}
                        {(JSON.stringify(mascotaDetalle.notas).toLowerCase().includes('alergia') || JSON.stringify(mascotaDetalle.notas).toLowerCase().includes('piel')) && (
                           <p className="mt-2 mb-0 text-danger" style={{fontSize: '11px'}}>*Sugerencia del sistema: Usar Shampoo Medicado u Organogal.</p>
                        )}
                      </div>
                    ) : (
                      <p className="m-0 text-muted small italic">Mascota sin historial de alergias o comportamiento riesgoso.</p>
                    )}
                  </div>
                </Col>
              </Row>

              {/* PANEL DE CONTROL DE ESTADOS */}
              <h6 className="fw-bold text-center text-muted small text-uppercase mb-3 mt-4 pt-3 border-top">Actualizar Flujo de Trabajo</h6>
              
              <div className="d-flex justify-content-center gap-3 mb-4">
                <button 
                  onClick={() => cambiarEstado(citaActiva.id, 'En la Mesa (Proceso)')} 
                  className={`btn fw-bold px-4 ${citaActiva.estado === 'En la Mesa (Proceso)' ? 'btn-primary shadow' : 'btn-outline-primary'}`}
                >
                  <IoWater className="me-2"/> Iniciar Baño
                </button>
                
                <button 
                  onClick={() => cambiarEstado(citaActiva.id, 'Listo para Recoger')} 
                  className={`btn fw-bold px-4 ${citaActiva.estado === 'Listo para Recoger' ? 'btn-success shadow' : 'btn-outline-success'}`}
                >
                  <IoCheckmarkCircle className="me-2"/> Marcar Listo (Llamar Dueño)
                </button>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                <button onClick={() => eliminarCita(citaActiva.id)} className="btn btn-light text-danger border d-flex align-items-center gap-1">
                  <IoTrash /> Cancelar Cita
                </button>
                <button onClick={() => cambiarEstado(citaActiva.id, 'Entregado')} className="btn btn-dark fw-bold px-4">
                  <IoCheckmarkDone size={20} className="me-2"/> Mascota Entregada
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}