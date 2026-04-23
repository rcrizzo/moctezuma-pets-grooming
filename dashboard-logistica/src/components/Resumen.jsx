import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Badge, ProgressBar, Card, Button, ButtonGroup } from 'react-bootstrap';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  IoTrendingUp, IoPaw, IoCut, IoHome, IoAlertCircle, 
  IoCalendarClear, IoNotifications, IoCart, IoChevronBack, IoChevronForward, IoToday
} from 'react-icons/io5';

// Horarios de la jornada laboral (10 AM a 7 PM)
const HORAS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]; 
const DIAS_TEXTO = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function Resumen() {
  // --- ESTADOS PARA LOS KPIs ORIGINALES ---
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [alertasInventario, setAlertasInventario] = useState([]);
  const [huespedesActivos, setHuespedesActivos] = useState(0);
  const [turnosGrooming, setTurnosGrooming] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- ESTADOS PARA LA AGENDA SEMANAL ---
  const [citasGrooming, setCitasGrooming] = useState([]);
  const [citasVet, setCitasVet] = useState([]);
  
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
    // 1. KPIs Globales
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

    // 2. AGENDA SEMANAL: Escuchar ambas colecciones simultáneamente
    const inicioSemana = new Date(lunesActual); inicioSemana.setHours(0, 0, 0, 0);
    const finSemana = new Date(dias[5]); finSemana.setHours(23, 59, 59, 999);

    // Consulta para Grooming
    const qGroomingAgenda = query(
      collection(db, 'grooming'),
      where('fechaTimestamp', '>=', inicioSemana),
      where('fechaTimestamp', '<=', finSemana)
    );
    const unsubGroomingAgenda = onSnapshot(qGroomingAgenda, (snap) => {
      setCitasGrooming(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), area: 'Grooming' })));
    });

    // Consulta para Veterinaria
    const qConsultasAgenda = query(
      collection(db, 'consultas'),
      where('fechaTimestamp', '>=', inicioSemana),
      where('fechaTimestamp', '<=', finSemana)
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

  // Unimos ambas listas de citas
  const citasSemana = [...citasGrooming, ...citasVet];

  // Función para renderizar la celda correcta
  const renderCitasCelda = (fecha, hora) => {
    const fechaString = fecha.toDateString();
    
    const citas = citasSemana.filter(c => {
      // Manejo seguro por si Firebase lo devuelve como JS Date o Firestore Timestamp
      const cDate = c.fechaTimestamp?.toDate ? c.fechaTimestamp.toDate() : new Date(c.fechaTimestamp);
      return cDate?.toDateString() === fechaString && cDate?.getHours() === hora;
    });

    return (
      <div className="d-flex flex-column gap-1 w-100 h-100 p-1">
        {citas.map((cita) => (
          <div 
            key={cita.id} 
            className="p-1 rounded shadow-sm text-truncate"
            style={{ 
              fontSize: '10px', 
              backgroundColor: cita.area === 'Grooming' ? '#E0F2FE' : '#FEF3C7',
              borderLeft: `3px solid ${cita.area === 'Grooming' ? '#0284C7' : '#D97706'}`,
              color: '#1E293B',
              lineHeight: '1.2'
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
      {/* --- ENCABEZADO --- */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold m-0" style={{color: 'var(--dark)'}}>Panel de Control</h2>
          <p className="text-muted m-0 text-capitalize">{hoy}</p>
        </div>
      </div>

      {/* --- TARJETAS DE KPIs (INTACTAS) --- */}
      <Row className="mb-4 gx-3 gy-3">
        <Col md={3}>
          <div className="glass-card p-4 h-100 d-flex flex-column justify-content-center" style={{borderTop: '4px solid #3B82F6'}}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <p className="text-muted small fw-bold mb-1 text-uppercase">Pacientes Activos</p>
                <h2 className="fw-bold m-0">{totalMascotas}</h2>
              </div>
              <div className="p-2 bg-light rounded"><IoPaw size={24} color="#3B82F6" /></div>
            </div>
            <p className="text-success small m-0 mt-2 fw-bold d-flex align-items-center gap-1">
              <IoTrendingUp /> Base de datos global
            </p>
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

      {/* --- SECCIÓN DE OPERACIONES Y ALERTAS --- */}
      <Row className="gx-4 gy-4">
        {/* COLUMNA IZQUIERDA: AGENDA OPERATIVA SEMANAL (UNIFICADA) */}
        <Col lg={8}>
          <div className="glass-card h-100 d-flex flex-column">
            <div className="p-4 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white" style={{borderRadius: '15px 15px 0 0'}}>
              <div>
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <IoCalendarClear color="var(--accent)" /> Agenda Logística Semanal
                </h5>
                <p className="text-muted small m-0 mt-1">{rangoTexto}</p>
              </div>
              
              <ButtonGroup shadow-sm>
                <Button variant="outline-secondary" size="sm" onClick={() => cambiarSemana(-7)}><IoChevronBack /></Button>
                <Button variant="outline-secondary" size="sm" className="fw-bold" onClick={irAHoy}><IoToday className="me-1"/>Hoy</Button>
                <Button variant="outline-secondary" size="sm" onClick={() => cambiarSemana(7)}><IoChevronForward /></Button>
              </ButtonGroup>
            </div>

            <div className="p-0 overflow-auto bg-light flex-grow-1" style={{borderRadius: '0 0 15px 15px'}}>
              <div style={{ minWidth: '800px' }}>
                {/* Header Días */}
                <div className="d-flex border-bottom bg-white sticky-top">
                  <div style={{ width: '80px', flexShrink: 0 }} className="p-2 text-center fw-bold text-muted small border-end">HORA</div>
                  {dias.map((dia, i) => (
                    <div key={i} className="flex-grow-1 p-2 text-center border-end" style={{ width: 'calc(100% / 6)' }}>
                      <span className="d-block fw-bold" style={{fontSize: '12px'}}>{DIAS_TEXTO[i]}</span>
                      <small className="text-muted" style={{fontSize: '11px'}}>{dia.getDate()}</small>
                    </div>
                  ))}
                </div>

                {/* Cuerpo Agenda */}
                {HORAS.map(hora => (
                  <div key={hora} className="d-flex border-bottom align-items-stretch" style={{ minHeight: '80px' }}>
                    <div style={{ width: '80px', flexShrink: 0 }} className="p-2 text-center border-end bg-white small fw-bold text-muted d-flex align-items-center justify-content-center">
                      {hora === 12 ? '12:00 PM' : hora > 12 ? `${hora - 12}:00 PM` : `${hora}:00 AM`}
                    </div>
                    {dias.map((dia, i) => (
                      <div key={i} className="flex-grow-1 border-end bg-white" style={{ width: 'calc(100% / 6)' }}>
                        {renderCitasCelda(dia, hora)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Col>

        {/* COLUMNA DERECHA: Notificaciones de Logística (INTACTA) */}
        <Col lg={4}>
          <div className="glass-card p-4 h-100" style={{backgroundColor: '#FAFAFA'}}>
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <IoNotifications color="#EF4444" /> Alertas de Logística
            </h5>

            {/* Inventario */}
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

            {/* Hospedaje Status */}
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
    </div>
  );
}