import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Table, Spinner, Badge } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { IoCalendar, IoShieldCheckmark, IoSearch, IoAdd, IoEye, IoPencil, IoTrash, IoTime } from 'react-icons/io5';

// --- CATÁLOGOS SINCRONIZADOS ---
const TIPOS_PREVENTIVO = ['Vacunación', 'Desparasitación Interna', 'Desparasitación Externa'];
const PRODUCTOS_ESTANDAR = ['Sextuple Canine', 'Triple Felina', 'Rabia', 'Bordetella', 'Giardia', 'Endogard', 'Simparica', 'Bravecto'];
const HORARIOS_DISPONIBLES = ['09:00 AM', '11:00 AM', '01:00 PM', '04:00 PM'];

export default function Veterinaria() {
  const [mascotas, setMascotas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [preventivos, setPreventivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [showModalNuevaCita, setShowModalNuevaCita] = useState(false);
  const [showModalSellar, setShowModalSellar] = useState(false);
  const [showModalAtender, setShowModalAtender] = useState(false);
  const [showModalDetalle, setShowModalDetalle] = useState(false);

  const [nuevaCita, setNuevaCita] = useState({
    mascotaId: '', mascotaNombre: '', dueñoNombre: '', tipo: 'Consulta General',
    sintomas: [], notas: '', fechaCita: '', horaCita: '', estado: 'Pendiente'
  });

  const [nuevoSello, setNuevoSello] = useState({
    mascotaId: '', mascotaNombre: '', dueñoNombre: '', tipo: 'Vacunación', producto: '', 
    lote: '', mvz: 'MVZ. López S.', cedula: '11536014', proximaDosis: ''
  });

  const [citaActiva, setCitaActiva] = useState(null);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    // 1. Escuchar Mascotas (Trayendo el dueño de una vez)
    const unsubMascotas = onSnapshot(query(collection(db, 'mascotas')), (snap) => {
      setMascotas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Escuchar Consultas
    const qConsultas = query(collection(db, 'consultas'), orderBy('createdAt', 'desc'));
    const unsubConsultas = onSnapshot(qConsultas, (snap) => {
      setCitas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Escuchar Preventivos (Cartilla)
    const qCarnets = query(collection(db, 'carnets'), orderBy('createdAt', 'desc'));
    const unsubCarnets = onSnapshot(qCarnets, (snap) => {
      setPreventivos(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });

    return () => { unsubMascotas(); unsubConsultas(); unsubCarnets(); };
  }, []);

  // --- FUNCIONES DE ACCIÓN ---

  const agendarCita = async (e) => {
    e.preventDefault();
    if (!nuevaCita.mascotaId) return alert("Selecciona una mascota");
    try {
      await addDoc(collection(db, 'consultas'), {
        ...nuevaCita,
        createdAt: serverTimestamp()
      });
      setShowModalNuevaCita(false);
      setNuevaCita({
        mascotaId: '', mascotaNombre: '', dueñoNombre: '', tipo: 'Consulta General',
        sintomas: [], notas: '', fechaCita: '', horaCita: '', estado: 'Pendiente'
      });
    } catch (err) { console.error("Error al agendar:", err); }
  };

  const handleSellarCartilla = async (e) => {
    e.preventDefault();
    if (!nuevoSello.mascotaId) return alert("Selecciona una mascota");
    try {
      await addDoc(collection(db, 'carnets'), {
        ...nuevoSello,
        fechaAplicacion: new Date().toLocaleDateString('es-MX'),
        createdAt: serverTimestamp()
      });
      setShowModalSellar(false);
      setNuevoSello({ ...nuevoSello, mascotaId: '', mascotaNombre: '', dueñoNombre: '', producto: '', lote: '', proximaDosis: '' });
    } catch (err) { console.error(err); }
  };

  const finalizarAtencion = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'consultas', citaActiva.id), {
        diagnosticoFinal: citaActiva.diagnosticoFinal,
        estado: 'Completada',
        finalizadoAt: serverTimestamp()
      });
      setShowModalAtender(false);
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      {/* SECCIÓN SUPERIOR: MONITOR */}
      <Row className="mb-4 gx-4">
        <Col lg={8}>
          <div className="glass-card p-4 h-100" style={{borderLeft: '4px solid var(--accent)'}}>
            <h4 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{fontSize: '16px', color: 'var(--accent)'}}>
              <IoTime size={22} /> Citas en Espera
            </h4>
            <div className="d-flex flex-column gap-2" style={{maxHeight: '180px', overflowY: 'auto'}}>
              {citas.filter(c => c.estado === 'Pendiente').map(cita => (
                <div key={cita.id} className="p-3 rounded border d-flex justify-content-between align-items-center" style={{backgroundColor: '#FFFBEB'}}>
                  <div>
                    <span className="fw-bold d-block">{cita.mascotaNombre} <Badge bg="dark">{cita.horaCita}</Badge></span>
                    <small className="text-muted">Dueño: <strong>{cita.dueñoNombre}</strong> • Motivo: {cita.notas}</small>
                  </div>
                  <button onClick={() => {setCitaActiva({...cita, diagnosticoFinal: ''}); setShowModalAtender(true);}} className="btn btn-dark fw-bold px-3">Atender</button>
                </div>
              ))}
              {citas.filter(c => c.estado === 'Pendiente').length === 0 && <p className="text-muted small">No hay citas pendientes.</p>}
            </div>
          </div>
        </Col>
        
        <Col lg={4}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderLeft: '4px solid #10B981'}}>
            <p className="text-muted fw-bold m-0 mb-3" style={{fontSize: '11px', textTransform: 'uppercase'}}>Acción Inmediata</p>
            <button onClick={() => setShowModalSellar(true)} className="btn text-white fw-bold d-flex align-items-center justify-content-center gap-2 py-3" style={{backgroundColor: '#10B981', borderRadius: '10px'}}>
              <IoShieldCheckmark size={20} /> Sellar Cartilla Digital
            </button>
          </div>
        </Col>
      </Row>

      {/* EXPEDIENTE UNIFICADO */}
      <div className="glass-card mb-4">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <h3 className="fw-bold m-0" style={{fontSize: '18px'}}>Expediente Unificado</h3>
          <div className="d-flex gap-2">
            <div className="position-relative">
              <IoSearch className="position-absolute" style={{left: '12px', top: '15px', color: '#94A3B8'}} />
              <Form.Control type="text" placeholder="Buscar por mascota o dueño..." className="custom-input ps-5" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </div>
            <button onClick={() => setShowModalNuevaCita(true)} className="btn btn-outline-dark fw-bold">Agendar Cita</button>
          </div>
        </div>

        <Table borderless hover responsive className="beauty-table m-0 align-middle">
          <thead>
            <tr>
              <th>Paciente / Dueño</th>
              <th>Registro</th>
              <th>Producto / Diagnóstico</th>
              <th>Estado / Próxima</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="5" className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
            ) : (
              <>
                {preventivos.filter(p => p.mascotaNombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.dueñoNombre?.toLowerCase().includes(busqueda.toLowerCase())).map((p) => (
                  <tr key={p.id} style={{backgroundColor: 'rgba(16, 185, 129, 0.03)'}}>
                    <td><span className="fw-bold">{p.mascotaNombre}</span><br/><small className="text-muted">Dueño: {p.dueñoNombre}</small></td>
                    <td><Badge bg="success" style={{fontSize: '10px'}}>{p.tipo}</Badge><br/><small className="text-muted">{p.fechaAplicacion}</small></td>
                    <td><strong>{p.producto}</strong><br/><small className="text-muted">Lote: {p.lote}</small></td>
                    <td><span className="text-success fw-bold">Próx: {p.proximaDosis}</span></td>
                    <td className="text-end small text-muted">MVZ: {p.mvz}</td>
                  </tr>
                ))}
                {citas.filter(c => c.mascotaNombre?.toLowerCase().includes(busqueda.toLowerCase()) || c.dueñoNombre?.toLowerCase().includes(busqueda.toLowerCase())).map((c) => (
                  <tr key={c.id}>
                    <td><span className="fw-bold">{c.mascotaNombre}</span><br/><small className="text-muted">Dueño: {c.dueñoNombre}</small></td>
                    <td><Badge bg="primary" style={{fontSize: '10px'}}>Consulta</Badge><br/><small className="text-muted">{c.fechaCita}</small></td>
                    <td className="text-truncate" style={{maxWidth: '200px'}}>{c.diagnosticoFinal || "Pendiente de diagnóstico"}</td>
                    <td><Badge bg={c.estado === 'Completada' ? 'secondary' : 'warning'}>{c.estado}</Badge></td>
                    <td className="text-end">
                      <button onClick={() => {setCitaSeleccionada(c); setShowModalDetalle(true);}} className="btn btn-sm btn-light border p-2"><IoEye size={16} /></button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </Table>
      </div>

      {/* MODAL: SELLAR CARTILLA (CORREGIDO CON DUEÑOS) */}
      <Modal show={showModalSellar} onHide={() => setShowModalSellar(false)} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className="fw-bold">Sellar Cartilla Digital</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSellarCartilla}>
            <Form.Group className="mb-3">
              <Form.Label className="custom-label">Mascota (Asociada a Dueño)</Form.Label>
              <Form.Select onChange={e => {
                const pet = mascotas.find(m => m.id === e.target.value);
                setNuevoSello({...nuevoSello, mascotaId: e.target.value, mascotaNombre: pet?.nombre, dueñoNombre: pet?.dueñoNombre});
              }} className="custom-input" required>
                <option value="">Seleccionar mascota...</option>
                {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} (Dueño: {m.dueñoNombre})</option>)}
              </Form.Select>
            </Form.Group>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="custom-label">Tipo</Form.Label>
                <Form.Select value={nuevoSello.tipo} onChange={e => setNuevoSello({...nuevoSello, tipo: e.target.value})} className="custom-input">
                  {TIPOS_PREVENTIVO.map(t => <option key={t} value={t}>{t}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="custom-label">Producto</Form.Label>
                <Form.Select onChange={e => setNuevoSello({...nuevoSello, producto: e.target.value})} className="custom-input" required>
                  <option value="">Seleccionar...</option>
                  {PRODUCTOS_ESTANDAR.map(v => <option key={v} value={v}>{v}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Label className="custom-label">Número de Lote</Form.Label>
                <Form.Control type="text" placeholder="Ej. 84729A" onChange={e => setNuevoSello({...nuevoSello, lote: e.target.value})} className="custom-input" required />
              </Col>
              <Col md={6}>
                <Form.Label className="custom-label">Próxima Fecha</Form.Label>
                <Form.Control type="date" onChange={e => setNuevoSello({...nuevoSello, proximaDosis: e.target.value})} className="custom-input" required />
              </Col>
            </Row>
            <button type="submit" className="btn w-100 text-white fw-bold py-3" style={{backgroundColor: '#10B981', borderRadius: '10px'}}>Sellar Cartilla</button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL: AGENDAR CITA (CORREGIDO CON DUEÑOS) */}
      <Modal show={showModalNuevaCita} onHide={() => setShowModalNuevaCita(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold">Agendar Nueva Cita</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={agendarCita}>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Label className="custom-label">Mascota (Asociada a Dueño)</Form.Label>
                <Form.Select onChange={e => {
                  const pet = mascotas.find(m => m.id === e.target.value);
                  setNuevaCita({...nuevaCita, mascotaId: e.target.value, mascotaNombre: pet?.nombre, dueñoNombre: pet?.dueñoNombre});
                }} className="custom-input" required>
                  <option value="">Seleccionar mascota...</option>
                  {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre} (Dueño: {m.dueñoNombre})</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="custom-label">Fecha</Form.Label>
                <Form.Control type="date" onChange={e => setNuevaCita({...nuevaCita, fechaCita: e.target.value})} className="custom-input" required />
              </Col>
              <Col md={6}>
                <Form.Label className="custom-label">Horario</Form.Label>
                <Form.Select onChange={e => setNuevaCita({...nuevaCita, horaCita: e.target.value})} className="custom-input" required>
                  <option value="">Selecciona horario...</option>
                  {HORARIOS_DISPONIBLES.map(h => <option key={h} value={h}>{h}</option>)}
                </Form.Select>
              </Col>
            </Row>
            <Form.Group className="mb-4">
              <Form.Label className="custom-label">Notas / Motivo</Form.Label>
              <Form.Control as="textarea" rows={2} onChange={e => setNuevaCita({...nuevaCita, notas: e.target.value})} className="custom-input" required />
            </Form.Group>
            <button type="submit" className="btn w-100 text-white fw-bold py-3" style={{backgroundColor: 'var(--accent)', borderRadius: '10px'}}>Confirmar Cita</button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL: ATENDER */}
      <Modal show={showModalAtender} onHide={() => setShowModalAtender(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold">Consulta: {citaActiva?.mascotaNombre}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {citaActiva && (
            <Form onSubmit={finalizarAtencion}>
               <p className="small text-muted mb-4">Mascota de: <strong>{citaActiva.dueñoNombre}</strong></p>
              <Form.Group className="mb-4">
                <Form.Label className="custom-label">Diagnóstico Final</Form.Label>
                <Form.Control as="textarea" rows={6} value={citaActiva.diagnosticoFinal} onChange={e => setCitaActiva({...citaActiva, diagnosticoFinal: e.target.value})} className="custom-input" required />
              </Form.Group>
              <button type="submit" className="btn w-100 text-white fw-bold py-3" style={{backgroundColor: '#10B981', borderRadius: '10px'}}>Finalizar Consulta</button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL: DETALLE EXPEDIENTE */}
      <Modal show={showModalDetalle} onHide={() => setShowModalDetalle(false)} centered size="lg">
        <Modal.Header closeButton><Modal.Title className="fw-bold">Expediente Clínico</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {citaSeleccionada && (
            <div>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h4 className="fw-bold m-0">{citaSeleccionada.mascotaNombre}</h4>
                  <p className="text-muted">Dueño: {citaSeleccionada.dueñoNombre}</p>
                </div>
                <Badge bg="primary">{citaSeleccionada.tipo}</Badge>
              </div>
              <div className="p-3 bg-light rounded border mb-3">
                <small className="text-muted fw-bold d-block mb-1">MOTIVO DE ENTRADA:</small>
                {citaSeleccionada.notas}
              </div>
              <div className="p-3 rounded border" style={{backgroundColor: '#F0F9FF', borderColor: '#BAE6FD'}}>
                <small className="text-primary fw-bold d-block mb-1">DIAGNÓSTICO Y TRATAMIENTO:</small>
                {citaSeleccionada.diagnosticoFinal || "Sin diagnóstico registrado."}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}