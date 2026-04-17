import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  IoTrendingUp, IoPaw, IoCut, IoHome, IoAlertCircle, 
  IoCalendarClear, IoNotifications, IoCart
} from 'react-icons/io5';

export default function Resumen() {
  // --- ESTADOS PARA LOS KPIs ---
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [alertasInventario, setAlertasInventario] = useState([]);
  const [huespedesActivos, setHuespedesActivos] = useState(0);
  const [citasHoy, setCitasHoy] = useState([]);
  const [turnosGrooming, setTurnosGrooming] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Fecha actual formateada
  const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    // 1. Escuchar Mascotas (Total de pacientes/clientes)
    const unsubMascotas = onSnapshot(collection(db, 'mascotas'), (snap) => {
      setTotalMascotas(snap.size); 
    });

    // 2. Escuchar Inventario (Alertas de stock crítico)
    const unsubInventario = onSnapshot(collection(db, 'inventario'), (snap) => {
      const prods = snap.docs.map(doc => doc.data());
      setAlertasInventario(prods.filter(p => p.stock <= p.stockMinimo));
    });

    // 3. Escuchar Hospedaje (Ocupación actual del hotel)
    const unsubHospedaje = onSnapshot(collection(db, 'hospedaje'), (snap) => {
      const estancias = snap.docs.map(doc => doc.data());
      setHuespedesActivos(estancias.filter(e => e.estado === 'Hospedado').length);
    });

    // 4. Escuchar Consultas Veterinarias (Citas Pendientes de Triage/Agenda)
    const qConsultas = query(collection(db, 'consultas'), orderBy('createdAt', 'desc'));
    const unsubConsultas = onSnapshot(qConsultas, (snap) => {
      const cons = snap.docs.map(doc => doc.data());
      setCitasHoy(cons.filter(c => c.estado === 'Pendiente'));
    });

    // 5. Escuchar Grooming (Turnos de Estética activos)
    const qGrooming = query(collection(db, 'grooming'), orderBy('createdAt', 'desc'));
    const unsubGrooming = onSnapshot(qGrooming, (snap) => {
      const turns = snap.docs.map(doc => doc.data());
      setTurnosGrooming(turns.filter(t => t.estado === 'Pendiente' || t.estado === 'En la Mesa (Proceso)'));
      setCargando(false);
    });

    // Limpieza de listeners al desmontar el componente
    return () => {
      unsubMascotas(); unsubInventario(); unsubHospedaje(); unsubConsultas(); unsubGrooming();
    };
  }, []);

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

      {/* --- TARJETAS DE KPIs --- */}
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
        {/* COLUMNA IZQUIERDA: Agenda Operativa */}
        <Col lg={8}>
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <IoCalendarClear color="var(--accent)" /> Agenda Operativa del Día
            </h5>
            
            <h6 className="fw-bold text-muted small text-uppercase mb-3">Consultas Veterinarias (Triage / Pendientes)</h6>
            {citasHoy.length > 0 ? (
              <div className="d-flex flex-column gap-2 mb-4">
                {citasHoy.slice(0, 4).map((cita, idx) => (
                  <div key={idx} className="p-3 border rounded d-flex justify-content-between align-items-center" style={{backgroundColor: '#F8FAFC'}}>
                    <div>
                      <span className="fw-bold d-block text-dark">{cita.mascotaNombre} <Badge bg="primary" className="ms-1">{cita.tipo}</Badge></span>
                      <small className="text-muted">Motivo: {cita.notas || cita.motivo || 'Revisión general'}</small>
                    </div>
                    <Badge bg="dark" className="px-3 py-2">{cita.horaCita || 'En espera'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small italic mb-4 p-3 bg-light rounded text-center">No hay consultas médicas en espera.</p>
            )}

            <h6 className="fw-bold text-muted small text-uppercase mb-3 mt-4">Estética y Grooming</h6>
            {turnosGrooming.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {turnosGrooming.slice(0, 4).map((turno, idx) => (
                  <div key={idx} className="p-3 border rounded d-flex justify-content-between align-items-center" style={{backgroundColor: '#FFFBEB', borderColor: '#FDE68A'}}>
                    <div>
                      <span className="fw-bold d-block text-dark">{turno.mascotaNombre} <Badge bg="warning" text="dark" className="ms-1">{turno.servicio}</Badge></span>
                      <small className="text-muted">Fase actual: <strong>{turno.estado}</strong></small>
                    </div>
                    <span className="fw-bold text-muted small">{turno.horaCita}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small italic p-3 bg-light rounded text-center">No hay turnos de estética activos en este momento.</p>
            )}
          </div>
        </Col>

        {/* COLUMNA DERECHA: Notificaciones de Logística */}
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