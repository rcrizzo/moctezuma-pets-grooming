import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Badge, ProgressBar, Card, Button, ButtonGroup, Modal, Form } from 'react-bootstrap';
// IMPORTANTE: Se agregó getDoc a las importaciones
import { collection, onSnapshot, query, orderBy, where, doc, deleteDoc, updateDoc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  IoTrendingUp, IoPaw, IoCut, IoHome, IoAlertCircle, 
  IoCalendarClear, IoNotifications, IoCart, IoChevronBack, IoChevronForward, IoToday,
  IoLogoWhatsapp, IoTrash, IoPencil, IoTime, IoInformationCircle
} from 'react-icons/io5';

// HORARIOS
const HORAS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; 
const DIAS_TEXTO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// HELPERS PARA EVITAR ERRORES DE TIMEZONE
const obtenerFechaYMD = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const obtenerHoraInt = (horaString) => {
  if (!horaString) return null;
  const [time, modifier] = horaString.split(' ');
  if (!time) return null;
  let [h] = time.split(':');
  let hour = parseInt(h, 10);
  if (hour === 12) hour = 0;
  if (modifier && modifier.toUpperCase() === 'PM') hour += 12;
  return hour;
};

export default function Resumen() {
  // ESTADOS PARA LOS KPIs ORIGINALES
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [alertasInventario, setAlertasInventario] = useState([]);
  const [huespedesActivos, setHuespedesActivos] = useState(0);
  const [turnosGrooming, setTurnosGrooming] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ESTADOS PARA LA AGENDA SEMANAL
  const [citasGrooming, setCitasGrooming] = useState([]);
  const [citasVet, setCitasVet] = useState([]);
  
  // ESTADOS PARA INTERACCIÓN DEL MODAL
  const [showModal, setShowModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [editando, setEditando] = useState(false);
  const [telefonoCliente, setTelefonoCliente] = useState('');

  const [lunesActual, setLunesActual] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const cambiarSemana = (offset) => {
    const nueva = new Date(lunesActual);
    nueva.setDate(nueva.getDate() + offset);
    setLunesActual(nueva);
  };

  const irAHoy = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setLunesActual(new Date(d.setDate(diff)));
  };

  const obtenerDiasSemana = () => [0, 1, 2, 3, 4, 5].map(offset => {
    const d = new Date(lunesActual);
    d.setDate(d.getDate() + offset);
    return d;
  });

  const dias = obtenerDiasSemana();
  const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const rangoTexto = `${dias[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} - ${dias[5].toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  useEffect(() => {
    // KPIs Globales
    const unsubMascotas = onSnapshot(collection(db, 'mascotas'), (snap) => setTotalMascotas(snap.size));
    const unsubInventario = onSnapshot(collection(db, 'inventario'), (snap) => {
      const prods = snap.docs.map(doc => doc.data());
      setAlertasInventario(prods.filter(p => p.stock <= p.stockMinimo));
    });
    const unsubHospedaje = onSnapshot(collection(db, 'hospedaje'), (snap) => {
      const estancias = snap.docs.map(doc => doc.data());
      setHuespedesActivos(estancias.filter(e => e.estado === 'Hospedado').length);
    });
    const qGroomingKPI = query(collection(db, 'grooming'), orderBy('fechaRegistro', 'desc'));
    const unsubGroomingKPI = onSnapshot(qGroomingKPI, (snap) => {
      const turns = snap.docs.map(doc => doc.data());
      setTurnosGrooming(turns.filter(t => t.estado === 'Pendiente' || t.estado === 'En la Mesa (Proceso)'));
    });

    // AGENDA SEMANAL
    const inicioSemana = new Date(lunesActual); inicioSemana.setHours(0, 0, 0, 0);
    const finSemana = new Date(dias[5]); finSemana.setHours(23, 59, 59, 999);

    const inicioQuery = new Date(inicioSemana); inicioQuery.setDate(inicioQuery.getDate() - 1);
    const finQuery = new Date(finSemana); finQuery.setDate(finQuery.getDate() + 1);

    const qGroomingAgenda = query(
      collection(db, 'grooming'),
      where('fechaTimestamp', '>=', inicioQuery),
      where('fechaTimestamp', '<=', finQuery)
    );
    const unsubGroomingAgenda = onSnapshot(qGroomingAgenda, (snap) => {
      setCitasGrooming(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), area: 'Grooming' })));
    });

    const qConsultasAgenda = query(
      collection(db, 'consultas'),
      where('fechaTimestamp', '>=', inicioQuery),
      where('fechaTimestamp', '<=', finQuery)
    );
    const unsubConsultasAgenda = onSnapshot(qConsultasAgenda, (snap) => {
      setCitasVet(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), area: 'Veterinaria' })));
      setCargando(false);
    });

    return () => {
      unsubMascotas(); unsubInventario(); unsubHospedaje(); unsubGroomingKPI();
      unsubGroomingAgenda(); unsubConsultasAgenda();
    };
  }, [lunesActual]);

  const citasSemana = [...citasGrooming, ...citasVet];

  // LÓGICA DE INTERACCIÓN OPTIMIZADA
  const abrirDetalle = async (cita) => {
    setCitaSeleccionada(cita);
    setEditando(false);
    setShowModal(true);
    setTelefonoCliente('');

    // BÚSQUEDA DEL CLIENTE (Maneja tanto App como Dashboard manual)
    const idBuscar = cita.clienteId || cita.duenoId || cita.dueñoId;
    
    if (idBuscar) {
      try {
        let telEncontrado = '';

        // 1. Buscamos primero en 'usuarios' por si la cita la hizo el dueño desde la App Móvil
        const docUser = await getDoc(doc(db, 'usuarios', idBuscar));
        if (docUser.exists() && docUser.data().telefono) {
          telEncontrado = docUser.data().telefono;
        } else {
          // A veces el idBuscar es el campo 'uid' y no el ID del documento en usuarios
          const qUser = query(collection(db, 'usuarios'), where('uid', '==', idBuscar));
          const snapUser = await getDocs(qUser);
          if (!snapUser.empty && snapUser.docs[0].data().telefono) {
            telEncontrado = snapUser.docs[0].data().telefono;
          } else {
            // 2. Si no estaba en usuarios de la app, buscamos en 'clientes' (los creados a mano en el dashboard)
            const docCliente = await getDoc(doc(db, 'clientes', idBuscar));
            if (docCliente.exists() && docCliente.data().telefono) {
              telEncontrado = docCliente.data().telefono;
            }
          }
        }
        
        if (telEncontrado) {
          setTelefonoCliente(telEncontrado);
        }
      } catch (error) {
        console.error("Error al buscar el teléfono:", error);
      }
    }
  };

  const eliminarCita = async () => {
    if (window.confirm("¿Estás seguro de eliminar esta cita permanentemente?")) {
      const coleccion = citaSeleccionada.area === 'Grooming' ? 'grooming' : 'consultas';
      await deleteDoc(doc(db, coleccion, citaSeleccionada.id));
      setShowModal(false);
    }
  };

  const guardarCambios = async () => {
    const coleccion = citaSeleccionada.area === 'Grooming' ? 'grooming' : 'consultas';
    const ref = doc(db, coleccion, citaSeleccionada.id);
    await updateDoc(ref, {
        servicio: citaSeleccionada.servicio || citaSeleccionada.tipo,
        notas: citaSeleccionada.notas || ''
    });
    setEditando(false);
  };

  const renderCitasCelda = (fecha, hora) => {
    const fechaStringYMD = obtenerFechaYMD(fecha);
    const fechaString = fecha.toDateString();
    
    const citas = citasSemana.filter(c => {
      let coincideFecha = false;
      let coincideHora = false;

      // FILTRO POR STRING O POR TIMESTAMP PARA EVITAR ERRORES DE TIMEZONE
      if (c.fecha) {
          coincideFecha = (c.fecha === fechaStringYMD);
      } else {
          const cDate = c.fechaTimestamp?.toDate ? c.fechaTimestamp.toDate() : new Date(c.fechaTimestamp);
          coincideFecha = (cDate?.toDateString() === fechaString);
      }

      if (c.hora) {
          coincideHora = (obtenerHoraInt(c.hora) === hora);
      } else {
          const cDate = c.fechaTimestamp?.toDate ? c.fechaTimestamp.toDate() : new Date(c.fechaTimestamp);
          coincideHora = (cDate?.getHours() === hora);
      }

      return coincideFecha && coincideHora;
    });

    return (
      <div className="d-flex flex-column gap-1 w-100 h-100 p-1">
        {citas.map((cita) => (
          <div 
            key={cita.id} 
            onClick={() => abrirDetalle(cita)}
            className="p-1 rounded shadow-sm text-truncate cita-interactiva"
            style={{ 
              fontSize: '10px', 
              backgroundColor: cita.area === 'Grooming' ? '#E0F2FE' : '#FEF3C7',
              borderLeft: `3px solid ${cita.area === 'Grooming' ? '#0284C7' : '#D97706'}`,
              color: '#1E293B',
              lineHeight: '1.2',
              cursor: 'pointer'
            }}
            title={`${cita.mascotaNombre} - ${cita.servicio || cita.tipo}`}
          >
            <span className="fw-bold">{cita.mascotaNombre}</span>
            <br />
            <small className="text-muted" style={{fontSize: '9px'}}>{cita.area}</small>
          </div>
        ))}
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '60vh'}}>
        <Spinner animation="border" style={{color: 'var(--accent)'}} />
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold m-0" style={{color: 'var(--text-dark)'}}>Panel de Control</h2>
          <p className="text-muted m-0 text-capitalize">{hoy}</p>
        </div>
      </div>

      {/* TARJETAS DE KPIs */}
      <Row className="mb-4 gx-3 gy-3">
        <Col md={3}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderTop: '4px solid #3B82F6'}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Pacientes</p>
                <h2 className="fw-bold m-0">{totalMascotas}</h2>
              </div>
              <div className="p-2 bg-light rounded"><IoPaw size={24} color="#3B82F6" /></div>
            </div>
          </div>
        </Col>

        <Col md={3}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderTop: '4px solid #10B981'}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Hotel / Guardería</p>
                <h2 className="fw-bold m-0">{huespedesActivos}</h2>
              </div>
              <div className="p-2 bg-light rounded"><IoHome size={24} color="#10B981" /></div>
            </div>
            <ProgressBar now={(huespedesActivos / 20) * 100} variant="success" className="mt-3" style={{height: '6px'}} />
            <small className="text-muted mt-1 d-block">Ocupación sobre 20 lugares</small>
          </div>
        </Col>

        <Col md={3}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderTop: '4px solid #F59E0B'}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Estética en Cola</p>
                <h2 className="fw-bold m-0">{turnosGrooming.length}</h2>
              </div>
              <div className="p-2 bg-light rounded"><IoCut size={24} color="#F59E0B" /></div>
            </div>
            <p className="text-muted small m-0 mt-2">Mascotas en baño o espera</p>
          </div>
        </Col>

        <Col md={3}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderTop: `4px solid ${alertasInventario.length > 0 ? '#EF4444' : '#94A3B8'}`}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Stock Crítico</p>
                <h2 className={`fw-bold m-0 ${alertasInventario.length > 0 ? 'text-danger' : 'text-muted'}`}>
                  {alertasInventario.length}
                </h2>
              </div>
              <div className="p-2 bg-light rounded"><IoAlertCircle size={24} color={alertasInventario.length > 0 ? "#EF4444" : "#94A3B8"} /></div>
            </div>
            {alertasInventario.length > 0 ? (
              <p className="text-danger small m-0 mt-2 fw-bold">Productos por agotarse</p>
            ) : (
              <p className="text-muted small m-0 mt-2">Inventario saludable</p>
            )}
          </div>
        </Col>
      </Row>

      {/* SECCIÓN DE OPERACIONES Y ALERTAS */}
      <Row className="gx-4 gy-4">
        <Col lg={8}>
          <div className="glass-card h-100 d-flex flex-column">
            <div className="p-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white" style={{borderRadius: '15px 15px 0 0'}}>
              <div>
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <IoCalendarClear color="var(--accent)" /> Agenda Semanal
                </h5>
                <p className="text-muted small m-0 mt-1">{rangoTexto}</p>
              </div>
              
              <ButtonGroup shadow-sm>
                <Button variant="outline-secondary" size="sm" onClick={() => cambiarSemana(-7)}><IoChevronBack /></Button>
                <Button variant="outline-secondary" size="sm" className="fw-bold" onClick={irAHoy}><IoToday className="me-1"/>Semana Actual</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => cambiarSemana(7)}><IoChevronForward /></Button>
              </ButtonGroup>
            </div>

            <div className="p-0 overflow-auto bg-light flex-grow-1" style={{borderRadius: '0 0 15px 15px'}}>
              <div style={{ minWidth: '800px' }}>
                <div className="d-flex border-bottom bg-white sticky-top">
                  <div style={{ width: '80px', flexShrink: 0 }} className="p-2 text-center fw-bold text-muted small border-end">HORA</div>
                  {dias.map((dia, i) => {
                    const esHoy = dia.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className={`flex-grow-1 p-2 text-center border-end ${esHoy ? 'today-highlight' : ''}`} style={{ width: 'calc(100% / 6)' }}>
                        <span className={`d-block fw-bold ${esHoy ? 'text-warning' : ''}`} style={{fontSize: '12px'}}>{DIAS_TEXTO[i]}</span>
                        <small className={esHoy ? 'text-warning fw-bold' : 'text-muted'} style={{fontSize: '11px'}}>{dia.getDate()}</small>
                      </div>
                    )
                  })}
                </div>

                {/* CUERPO AGENDA */}
                {HORAS.map(hora => (
                  <div key={hora} className="d-flex border-bottom align-items-stretch" style={{ minHeight: '80px' }}>
                    <div style={{ width: '80px', flexShrink: 0 }} className="p-2 text-center border-end bg-white small fw-bold text-muted d-flex align-items-center justify-content-center">
                      {hora === 12 ? '12:00 PM' : hora > 12 ? `${hora - 12}:00 PM` : `${hora}:00 AM`}
                    </div>
                    {dias.map((dia, i) => {
                      const esHoy = dia.toDateString() === new Date().toDateString();
                      return (
                        <div key={i} className={`flex-grow-1 border-end bg-white ${esHoy ? 'today-highlight' : ''}`} style={{ width: 'calc(100% / 6)' }}>
                          {renderCitasCelda(dia, hora)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>

        {/* COLUMNA DERECHA: NOTIFICACIONES */}
        <Col lg={4}>
          <div className="glass-card p-4 h-100" style={{backgroundColor: '#FAFAFA'}}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <IoNotifications color="#EF4444" /> Alertas
            </h5>

            {/* INVENTARIO */}
            <div className="mb-5">
              <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                <IoCart size={18} /> Reposición de Inventario
              </h6>
              {alertasInventario.length > 0 ? (
                <ul className="list-unstyled m-0">
                  {alertasInventario.slice(0, 6).map((prod, idx) => (
                    <li key={idx} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <span className="small text-dark fw-bold text-truncate" style={{maxWidth: '160px'}}>{prod.nombre}</span>
                      <Badge bg="danger">Stock: {prod.stock}</Badge>
                    </li>
                  ))}
                  {alertasInventario.length > 6 && (
                     <li className="text-center mt-3"><small className="text-primary fw-bold">+{alertasInventario.length - 6} artículos más...</small></li>
                  )}
                </ul>
              ) : (
                <div className="p-3 rounded text-center border" style={{backgroundColor: '#F0FDF4', borderColor: '#BBF7D0'}}>
                  <small className="text-success fw-bold">Inventario al corriente. No hay escasez.</small>
                </div>
              )}
            </div>

            <div>
              <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                <IoHome size={18} /> Estatus del Hotel
              </h6>
              <div className="p-4 border rounded text-center shadow-sm bg-white">
                <h1 className="fw-bold m-0" style={{color: 'var(--accent)', fontSize: '3rem'}}>{huespedesActivos}</h1>
                <p className="text-muted small m-0 fw-bold text-uppercase mt-1">Mascotas Hospedadas</p>
              </div>
            </div>

          </div>
        </Col>
      </Row>

      {/* DETALLE DE CITA CON WHATSAPP */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <IoInformationCircle color="var(--accent)"/> Detalle de la Cita
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {citaSeleccionada && (
            <>
              <div className="text-center mb-4">
                <div className="bg-light d-inline-block p-3 rounded-circle mb-2"><IoPaw size={40} color="var(--accent)"/></div>
                <h4 className="fw-bold m-0">{citaSeleccionada.mascotaNombre}</h4>
                <p className="text-muted">Dueño: {citaSeleccionada.duenoNombre || citaSeleccionada.cliente}</p>
              </div>

              <div className="p-3 rounded border bg-light mb-4">
                {editando ? (
                    <Form.Group>
                        <Form.Label className="custom-label">Servicio / Tipo</Form.Label>
                        <Form.Control 
                            className="custom-input mb-2"
                            value={citaSeleccionada.servicio || citaSeleccionada.tipo}
                            onChange={(e) => setCitaSeleccionada({...citaSeleccionada, servicio: e.target.value, tipo: e.target.value})}
                        />
                        <Form.Label className="custom-label mt-2">Notas</Form.Label>
                        <Form.Control 
                            as="textarea"
                            rows={2}
                            className="custom-input mb-2"
                            value={citaSeleccionada.notas || ''}
                            onChange={(e) => setCitaSeleccionada({...citaSeleccionada, notas: e.target.value})}
                        />
                    </Form.Group>
                ) : (
                    <>
                        <div className="d-flex justify-content-between mb-2">
                            <span className="text-muted small fw-bold">SERVICIO</span>
                            <Badge bg={citaSeleccionada.area === 'Grooming' ? 'primary' : 'warning'}>{citaSeleccionada.area}</Badge>
                        </div>
                        <h6 className="fw-bold">{citaSeleccionada.servicio || citaSeleccionada.tipo}</h6>
                        {citaSeleccionada.notas && (
                           <p className="small text-muted mt-2 mb-0"><strong>Notas:</strong> {citaSeleccionada.notas}</p>
                        )}
                    </>
                )}
                <div className="d-flex align-items-center gap-2 text-muted small mt-3 pt-3 border-top">
                    <IoTime size={18} /> <strong>Hora programada:</strong> {citaSeleccionada.hora || new Date(citaSeleccionada.fechaTimestamp?.toDate?.() || citaSeleccionada.fechaTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>

              <div className="d-grid gap-2">
                {/* BOTÓN DE WHATSAPP INTEGRADO */}
                {telefonoCliente && (
                    <Button 
                        href={`https://wa.me/52${telefonoCliente}`} 
                        target="_blank"
                        variant="success" 
                        className="fw-bold py-2 d-flex align-items-center justify-content-center gap-2 mb-2"
                    >
                        <IoLogoWhatsapp size={20}/> Contactar al Dueño
                    </Button>
                )}
                
                <div className="d-flex gap-2">
                    {editando ? (
                        <Button onClick={guardarCambios} variant="dark" className="flex-grow-1 fw-bold">Guardar Cambios</Button>
                    ) : (
                        <Button onClick={() => setEditando(true)} variant="outline-dark" className="flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2">
                            <IoPencil/> Editar Datos
                        </Button>
                    )}
                    <Button onClick={eliminarCita} variant="outline-danger" className="fw-bold d-flex align-items-center gap-2">
                        <IoTrash/>
                    </Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}