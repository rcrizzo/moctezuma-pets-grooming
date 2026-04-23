import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Table, Spinner, Badge, Card, Button } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { IoCut, IoSearch, IoAdd, IoEye, IoTime, IoWarning, IoCheckmarkCircle, IoCheckmarkDone, IoTrash, IoWater } from 'react-icons/io5';

// --- CATÁLOGOS DE ESTÉTICA ---
const SERVICIOS_GROOMING = [
  'Baño Básico', 'Baño Medicado', 'Corte de Pelo (Estilismo)', 
  'Deslanado', 'Corte de Uñas y Limpieza', 'Paquete Spa Completo'
];
const HORARIOS = [
  '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', 
  '06:00 PM', '07:00 PM'
];

// --- TABULADOR DE PRECIOS BASE ---
const PRECIOS_BASE = {
  'Pelo Largo': {
    'Mini': { 'Baño': 280, 'Grooming': 380 },
    'Chico': { 'Baño': 300, 'Grooming': 400 },
    'Mediano': { 'Baño': 380, 'Grooming': 480 },
    'Grande': { 'Baño': 450, 'Grooming': 580 },
    'Gigante': { 'Baño': 600, 'Grooming': 700 }
  },
  'Pelo Corto': {
    'Mini': { 'Baño': 200, 'Grooming': 250 }, 
    'Chico': { 'Baño': 250, 'Grooming': 300 },
    'Mediano': { 'Baño': 300, 'Grooming': 350 },
    'Grande': { 'Baño': 350, 'Grooming': 400 },
    'Gigante': { 'Baño': 450, 'Grooming': 500 }
  }
};

// --- TERMÓMETRO DE NUDOS ---
const NIVELES_NUDOS = [
  { label: 'Ninguno / Cepillado Normal', recargo: 0 },
  { label: 'Leve (Superficiales, 10-20%)', recargo: 0.10 },
  { label: 'Moderado (Frecuentes, 30-50%)', recargo: 0.30 },
  { label: 'Severo (Compactos, 60-80%)', recargo: 0.60 },
  { label: 'Crítico (Manto de lana/Rastas, 90-100%)', recargo: 1.00 }
];

export default function Grooming() {
  const [mascotas, setMascotas] = useState([]);
  const [dueños, setDueños] = useState([]); // Nuevo estado para los dueños
  const [citasGrooming, setCitasGrooming] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Modales
  const [showModalTurno, setShowModalTurno] = useState(false);
  const [showModalFicha, setShowModalFicha] = useState(false);
  const [citaActiva, setCitaActiva] = useState(null);
  const [mascotaActiva, setMascotaActiva] = useState(null);

  // Estado del formulario de nueva cita (Añadido 'fecha')
  const estadoInicial = {
    duenoNombre: '', 
    mascotaId: '',   
    mascotaNombre: '',
    servicio: 'Corte de Pelo (Estilismo)',
    fecha: '', // <--- CORRECCIÓN: Campo de fecha agregado
    horario: '',
    instrucciones: '',
    estado: 'Pendiente',
    nivelNudos: 0, 
    precioCalculado: 0
  };
  const [nuevoTurno, setNuevoTurno] = useState(estadoInicial);

  useEffect(() => {
    // Escuchar Mascotas para armar los catálogos
    const unsubMascotas = onSnapshot(collection(db, 'mascotas'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMascotas(docs);
      
      // Extraemos una lista de dueños únicos para el primer desplegable
      const uniqueOwners = Array.from(new Set(docs.map(m => m.duenoNombre).filter(Boolean)));
      setDueños(uniqueOwners.sort());
    });

    // Escuchar Citas
    const qCitas = query(collection(db, 'grooming'), orderBy('fechaRegistro', 'desc'));
    const unsubCitas = onSnapshot(qCitas, (snapshot) => {
      setCitasGrooming(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setCargando(false);
    });

    return () => { unsubMascotas(); unsubCitas(); };
  }, []);

  // --- LÓGICA DE COTIZACIÓN AUTOMÁTICA ---
  const calcularPrecio = (mascotaId, servicioNombre, indiceNudos) => {
    const mascota = mascotas.find(m => m.id === mascotaId);
    if (!mascota || !mascota.talla || !mascota.tipoPelo) return 0;

    const tipoTarifa = servicioNombre.includes('Baño') ? 'Baño' : 'Grooming';
    const precioBase = PRECIOS_BASE[mascota.tipoPelo]?.[mascota.talla]?.[tipoTarifa] || 0;
    
    const porcentajeRecargo = NIVELES_NUDOS[indiceNudos].recargo;
    const precioFinal = precioBase + (precioBase * porcentajeRecargo);

    return precioFinal;
  };

  // Manejador del cambio de DUEÑO
  const handleCambioDueno = (nombreDueno) => {
    setNuevoTurno({
      ...nuevoTurno,
      duenoNombre: nombreDueno,
      mascotaId: '', // Limpiamos mascota al cambiar dueño
      mascotaNombre: '',
      precioCalculado: 0
    });
  };

  // Manejador general del formulario
  const handleCambioCotizacion = (campo, valor) => {
    const turnoActualizado = { ...nuevoTurno, [campo]: valor };
    
    if (campo === 'mascotaId') {
      const mascotaSel = mascotas.find(m => m.id === valor);
      if (mascotaSel) {
        turnoActualizado.mascotaNombre = mascotaSel.nombre;
      }
    }

    turnoActualizado.precioCalculado = calcularPrecio(
      turnoActualizado.mascotaId, 
      turnoActualizado.servicio, 
      turnoActualizado.nivelNudos
    );

    setNuevoTurno(turnoActualizado);
  };

  const handleAgendarTurno = async (e) => {
    e.preventDefault();
    if(!nuevoTurno.mascotaId || !nuevoTurno.horario || !nuevoTurno.fecha) {
      return alert('Por favor selecciona la mascota, fecha y horario.');
    }
    
    // Convertir horario string ("10:00 AM") a un Timestamp para que el Resumen lo detecte
    const [time, modifier] = nuevoTurno.horario.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

    const fechaTimestamp = new Date(nuevoTurno.fecha); // Toma la fecha seleccionada
    fechaTimestamp.setHours(hours, minutes, 0, 0);

    try {
      await addDoc(collection(db, 'grooming'), {
        ...nuevoTurno,
        fechaRegistro: new Date().toISOString(),
        fechaTimestamp: fechaTimestamp // Dato clave para el dashboard
      });
      setShowModalTurno(false);
      setNuevoTurno(estadoInicial);
    } catch (error) { 
      console.error(error); 
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'grooming', id), { estado: nuevoEstado });
      if(nuevoEstado === 'Entregado') setShowModalFicha(false);
    } catch (error) { 
      console.error(error); 
    }
  };

  const eliminarCita = async (id) => {
    if(window.confirm('¿Cancelar permanentemente este turno?')) {
      await deleteDoc(doc(db, 'grooming', id));
      setShowModalFicha(false);
    }
  };

  const abrirFicha = (cita) => {
    setCitaActiva(cita);
    const mascotaAsociada = mascotas.find(m => m.id === cita.mascotaId);
    setMascotaActiva(mascotaAsociada || null);
    setShowModalFicha(true);
  };

  // --- KPIs de los Contadores Superiores ---
  const conteoPendientes = citasGrooming.filter(c => c.estado === 'Pendiente').length;
  const conteoEnMesa = citasGrooming.filter(c => c.estado === 'En la Mesa (Proceso)').length;
  const conteoListos = citasGrooming.filter(c => c.estado === 'Listo para Recoger').length;

  const citasFiltradas = citasGrooming.filter(c => 
    c.mascotaNombre?.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.duenoNombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate__animated animate__fadeIn">

      {/* --- TARJETAS CONTADORAS (KPIs) SUPERIORES --- */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <div className="glass-card p-4 text-center h-100 border border-3 border-warning rounded-4 bg-white shadow-sm d-flex flex-column justify-content-center">
            <div className="text-warning mb-2"><IoTime size={24}/></div>
            <h2 className="fw-bold m-0" style={{color: 'var(--accent)', fontSize: '2.5rem'}}>{conteoPendientes}</h2>
            <p className="text-muted small fw-bold m-0 text-uppercase">Pendientes</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="glass-card p-4 text-center h-100 border border-3 border-primary rounded-4 bg-white shadow-sm d-flex flex-column justify-content-center">
            <div className="text-primary mb-2"><IoWater size={24}/></div>
            <h2 className="fw-bold m-0 text-primary" style={{fontSize: '2.5rem'}}>{conteoEnMesa}</h2>
            <p className="text-muted small fw-bold m-0 text-uppercase">En la mesa (Bañando)</p>
          </div>
        </Col>
        <Col md={3}>
          <div className="glass-card p-4 text-center h-100 border border-3 border-success rounded-4 bg-white shadow-sm d-flex flex-column justify-content-center">
            <div className="text-success mb-2"><IoCheckmarkCircle size={24}/></div>
            <h2 className="fw-bold m-0 text-success" style={{fontSize: '2.5rem'}}>{conteoListos}</h2>
            <p className="text-muted small fw-bold m-0 text-uppercase">Listos (Llamar Dueño)</p>
          </div>
        </Col>
        <Col md={3}>
          <div 
            className="p-4 text-center h-100 rounded-4 shadow-sm d-flex flex-column justify-content-center align-items-center" 
            style={{backgroundColor: 'var(--accent)', cursor: 'pointer', transition: 'transform 0.2s'}}
            onClick={() => setShowModalTurno(true)}
          >
            <IoAdd size={32} className="text-white mb-1"/>
            <h5 className="fw-bold text-white m-0">Agendar Turno</h5>
          </div>
        </Col>
      </Row>

      {/* --- TABLA DE AGENDA --- */}
      <Card className="glass-card border-0 shadow-sm mt-4">
        <Card.Body className="p-0">
          <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
            <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
              <IoCut size={20} className="text-muted"/> Agenda de Estética Canina y Felina
            </h6>
            <div className="position-relative" style={{width: '250px'}}>
              <IoSearch className="position-absolute text-muted" style={{top: '10px', left: '12px'}} />
              <Form.Control 
                className="ps-5 bg-white border-0 shadow-sm"
                placeholder="Buscar mascota..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{borderRadius: '20px', fontSize: '14px'}}
              />
            </div>
          </div>
          
          <Table responsive hover className="m-0 align-middle">
            <thead className="text-muted small" style={{backgroundColor: '#F9FAFB'}}>
              <tr>
                <th className="px-4 py-3">PACIENTE / DUEÑO</th>
                <th>FECHA Y HORARIO</th>
                <th>SERVICIO A REALIZAR</th>
                <th>ESTATUS DEL TURNO</th>
                <th className="text-end px-4">MESA DE TRABAJO</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.length > 0 ? (
                citasFiltradas.map(cita => (
                  <tr key={cita.id}>
                    <td className="px-4 py-3">
                      <p className="fw-bold mb-0 text-dark" style={{fontSize: '15px'}}>{cita.mascotaNombre}</p>
                      <small className="text-muted">Dueño: {cita.duenoNombre}</small>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <small className="text-muted">{cita.fecha}</small>
                        <Badge bg="dark" className="px-3 py-2 rounded-pill fw-normal shadow-sm w-auto align-self-start">
                          {cita.horario}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <p className="fw-bold m-0 text-dark" style={{fontSize: '14px'}}>{cita.servicio}</p>
                      <small className="text-muted">{NIVELES_NUDOS[cita.nivelNudos || 0]?.label.split(' ')[0]} Nudos</small>
                    </td>
                    <td>
                      <Badge bg={
                        cita.estado === 'Pendiente' ? 'warning' :
                        cita.estado === 'En la Mesa (Proceso)' ? 'primary' :
                        cita.estado === 'Listo para Recoger' ? 'success' : 'secondary'
                      } className="px-3 py-2 rounded-pill fw-bold">
                        {cita.estado}
                      </Badge>
                    </td>
                    <td className="text-end px-4">
                      {cita.estado !== 'Entregado' ? (
                        <Button 
                          style={{backgroundColor: 'var(--accent)', border: 'none'}} 
                          size="sm" 
                          className="fw-bold rounded px-3 py-2"
                          onClick={() => abrirFicha(cita)}
                        >
                          Abrir Ficha
                        </Button>
                      ) : (
                        <span className="text-muted small fw-bold d-flex align-items-center justify-content-end gap-1">
                          <IoCheckmarkDone/> Finalizado
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">No hay citas registradas.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* --- MODAL: AGENDAR TURNO CON COTIZADOR --- */}
      <Modal show={showModalTurno} onHide={() => setShowModalTurno(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Agendar Turno de Estética</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleAgendarTurno}>
            
            {/* LÓGICA DUEÑO -> MASCOTA */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label text-uppercase text-muted small fw-bold">Dueño (Cliente)</Form.Label>
                  <Form.Select 
                    className="custom-input bg-light border-0 shadow-sm"
                    value={nuevoTurno.duenoNombre}
                    onChange={(e) => handleCambioDueno(e.target.value)}
                  >
                    <option value="">Seleccionar dueño...</option>
                    {dueños.map((d, idx) => <option key={idx} value={d}>{d}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label text-uppercase text-muted small fw-bold">Mascota</Form.Label>
                  <Form.Select 
                    className="custom-input bg-light border-0 shadow-sm"
                    value={nuevoTurno.mascotaId}
                    onChange={(e) => handleCambioCotizacion('mascotaId', e.target.value)}
                    disabled={!nuevoTurno.duenoNombre} // Bloqueado si no hay dueño
                  >
                    <option value="">Seleccionar mascota...</option>
                    {mascotas
                      .filter(m => m.duenoNombre === nuevoTurno.duenoNombre)
                      .map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label text-uppercase text-muted small fw-bold">Servicio Requerido</Form.Label>
                  <Form.Select 
                    className="custom-input"
                    value={nuevoTurno.servicio}
                    onChange={(e) => handleCambioCotizacion('servicio', e.target.value)}
                  >
                    {SERVICIOS_GROOMING.map(s => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label text-uppercase text-muted small fw-bold">Fecha</Form.Label>
                  <Form.Control 
                    type="date"
                    className="custom-input"
                    value={nuevoTurno.fecha}
                    onChange={(e) => setNuevoTurno({...nuevoTurno, fecha: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label text-uppercase text-muted small fw-bold">Horario</Form.Label>
                  <Form.Select 
                    className="custom-input"
                    value={nuevoTurno.horario}
                    onChange={(e) => setNuevoTurno({...nuevoTurno, horario: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* --- TERMÓMETRO DE NUDOS --- */}
            <div className="p-3 mb-3 rounded" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <Form.Group>
                <Form.Label className="custom-label fw-bold text-dark d-flex align-items-center gap-2">
                  <IoCut /> Termómetro de Nudos (Evaluación Inicial)
                </Form.Label>
                <Form.Select 
                  className="custom-input bg-white"
                  value={nuevoTurno.nivelNudos}
                  onChange={(e) => handleCambioCotizacion('nivelNudos', parseInt(e.target.value))}
                >
                  {NIVELES_NUDOS.map((nivel, index) => (
                    <option key={index} value={index}>{nivel.label}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted small mt-2 d-block">
                  *El precio se ajusta automáticamente según el tamaño y tipo de pelo del paciente.
                </Form.Text>
              </Form.Group>
            </div>

            <Row className="align-items-center mb-4">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="custom-label text-uppercase text-muted small fw-bold">Instrucciones Especiales del Dueño</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={2}
                    className="custom-input"
                    placeholder="Ej: Corte tipo osito, moños rosas, no cortar bigotes..."
                    value={nuevoTurno.instrucciones}
                    onChange={(e) => setNuevoTurno({...nuevoTurno, instrucciones: e.target.value})}
                  />
                </Form.Group>
              </Col>
              
              {/* DISPLAY DEL PRECIO COTIZADO */}
              <Col md={4}>
                <div className="p-3 bg-white rounded text-center border shadow-sm">
                  <small className="text-success fw-bold d-block mb-1 text-uppercase" style={{fontSize: '11px'}}>Costo Estimado</small>
                  <h2 className="fw-bold m-0" style={{ color: '#166534' }}>
                    ${nuevoTurno.precioCalculado.toFixed(2)}
                  </h2>
                </div>
              </Col>
            </Row>

            <Button type="submit" className="w-100 fw-bold py-3 text-white border-0" style={{backgroundColor: 'var(--accent)', borderRadius: '12px'}}>
              Confirmar Turno
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* --- MODAL: FICHA DE ESTILISMO --- */}
      <Modal show={showModalFicha} onHide={() => setShowModalFicha(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
        <Modal.Body className="p-4 pt-0">
          {citaActiva && (
            <div>
              <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                  <h3 className="fw-bold m-0 text-dark">{citaActiva.mascotaNombre}</h3>
                  <p className="text-muted m-0 mt-1">Dueño: {citaActiva.duenoNombre}</p>
                </div>
                <Badge bg="dark" className="px-3 py-2" style={{fontSize: '12px'}}>{citaActiva.servicio}</Badge>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded border h-100">
                    <small className="fw-bold text-muted d-block mb-2 text-uppercase">Instrucciones de Corte / Baño:</small>
                    <p className="m-0 text-dark small">{citaActiva.instrucciones || 'Baño estándar. Sin instrucciones específicas.'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100" style={{backgroundColor: '#FEF2F2', borderColor: '#FECACA'}}>
                    <small className="fw-bold text-danger d-flex align-items-center gap-1 mb-2 text-uppercase">
                      <IoWarning/> Historial Clínico (Alertas):
                    </small>
                    <div className="d-flex flex-wrap gap-1">
                      {mascotaActiva?.etiquetas?.length > 0 ? (
                        mascotaActiva.etiquetas.map(tag => (
                          <Badge bg="danger" key={tag} className="fw-normal">{tag}</Badge>
                        ))
                      ) : (
                        <p className="m-0 text-dark small">Sin alertas.</p>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* COBRO */}
              <div className="text-center mb-4">
                 <small className="fw-bold text-muted text-uppercase d-block mb-1">Monto a Cobrar</small>
                 <h2 className="fw-bold text-success m-0">${citaActiva.precioCalculado?.toFixed(2)}</h2>
              </div>

              {/* CONTROLES DE ESTADO */}
              <div className="text-center mb-3">
                <small className="fw-bold text-muted d-block mb-2 text-uppercase">Actualizar Flujo de Trabajo</small>
              </div>
              <div className="d-flex justify-content-center gap-3 mb-4">
                <Button 
                  variant={citaActiva.estado === 'En la Mesa (Proceso)' ? 'primary' : 'outline-primary'}
                  className="fw-bold px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => cambiarEstado(citaActiva.id, 'En la Mesa (Proceso)')} 
                >
                  <IoWater /> Iniciar Baño
                </Button>
                
                <Button 
                  variant={citaActiva.estado === 'Listo para Recoger' ? 'success' : 'outline-success'}
                  className="fw-bold px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => cambiarEstado(citaActiva.id, 'Listo para Recoger')} 
                >
                  <IoCheckmarkCircle /> Marcar Listo (Llamar Dueño)
                </Button>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-4">
                <Button 
                  variant="link" 
                  className="text-danger text-decoration-none fw-bold p-0 d-flex align-items-center gap-1"
                  onClick={() => eliminarCita(citaActiva.id)}
                >
                  <IoTrash /> Cancelar Cita
                </Button>
                <Button 
                  variant="dark" 
                  className="fw-bold px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => cambiarEstado(citaActiva.id, 'Entregado')} 
                >
                  <IoCheckmarkDone size={20}/> Mascota Entregada
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

    </div>
  );
}