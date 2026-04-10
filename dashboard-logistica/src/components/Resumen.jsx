import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function Resumen() {
  return (
    <div>
      {/* 1. KPIs (Tarjetas Superiores) - Como lo pediste en tus notas */}
      <Row className="mb-4 gx-4">
        <Col md={4}>
          <div className="glass-card p-4 d-flex justify-content-between align-items-center" style={{borderLeft: '4px solid #6B7280'}}>
            <div>
              <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Total Agendados</p>
              <h2 className="fw-bold m-0 mt-1" style={{fontSize: '32px', color: 'var(--text-dark)'}}>12</h2>
            </div>
            <div style={{fontSize: '32px', opacity: '0.2'}}>📅</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 d-flex justify-content-between align-items-center" style={{borderLeft: '4px solid #3B82F6'}}>
            <div>
              <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>En Proceso</p>
              <h2 className="fw-bold m-0 mt-1" style={{fontSize: '32px', color: '#3B82F6'}}>5</h2>
            </div>
            <div style={{fontSize: '32px', opacity: '0.2'}}>🛁</div>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 d-flex justify-content-between align-items-center" style={{borderLeft: '4px solid #10B981'}}>
            <div>
              <p className="text-muted fw-bold m-0" style={{fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Listos para Entregar</p>
              <h2 className="fw-bold m-0 mt-1" style={{fontSize: '32px', color: '#10B981'}}>3</h2>
            </div>
            <div style={{fontSize: '32px', opacity: '0.2'}}>✅</div>
          </div>
        </Col>
      </Row>

      {/* 2. Agenda y Estadísticas */}
      <Row className="gx-4">
        
        {/* Agenda Semanal */}
        <Col md={7} lg={8}>
          <div className="glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0" style={{fontSize: '18px'}}>Agenda Semanal</h4>
              <button className="btn btn-sm text-muted" style={{backgroundColor: '#F3F4F6', fontWeight: '600'}}>Ver Calendario Completo</button>
            </div>
            
            {/* Simulación visual de próximos eventos */}
            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded" style={{backgroundColor: '#F9FAFB', border: '1px solid var(--border-light)'}}>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{color: 'var(--text-dark)'}}>Hoy, 10:00 AM - Cita Veterinaria</span>
                  <span className="badge" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6'}}>Salud</span>
                </div>
                <p className="m-0 mt-1 text-muted" style={{fontSize: '13px'}}>Max (Golden Retriever) - Vacuna Anual • Dra. Ramírez</p>
              </div>

              <div className="p-3 rounded" style={{backgroundColor: '#F9FAFB', border: '1px solid var(--border-light)'}}>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{color: 'var(--text-dark)'}}>Mañana, 09:00 AM - Check-in Hotel</span>
                  <span className="badge" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6'}}>Hospedaje</span>
                </div>
                <p className="m-0 mt-1 text-muted" style={{fontSize: '13px'}}>Luna (Poodle) - Estancia de 3 días • Jaula Premium B</p>
              </div>

              <div className="p-3 rounded" style={{backgroundColor: '#F9FAFB', border: '1px solid var(--border-light)'}}>
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{color: 'var(--text-dark)'}}>Jueves, 02:00 PM - Grooming Completo</span>
                  <span className="badge" style={{backgroundColor: 'rgba(217, 119, 6, 0.1)', color: 'var(--accent)'}}>Estética</span>
                </div>
                <p className="m-0 mt-1 text-muted" style={{fontSize: '13px'}}>Rocky (Husky) - Baño y Deslanado</p>
              </div>
            </div>
          </div>
        </Col>

        {/* Estadísticas */}
        <Col md={5} lg={4}>
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold mb-4" style={{fontSize: '18px'}}>Estadísticas de Ingresos</h4>
            
            {/* Aquí en el futuro iría una gráfica real (ej. Chart.js o Recharts) */}
            <div className="d-flex flex-column justify-content-center align-items-center h-75 text-center p-3 rounded" style={{backgroundColor: '#F9FAFB', border: '1px dashed #D1D5DB'}}>
              <div style={{fontSize: '40px', marginBottom: '10px'}}>📈</div>
              <p className="fw-bold m-0 text-muted" style={{fontSize: '14px'}}>Área de Gráficos</p>
              <p className="text-muted m-0 mt-2" style={{fontSize: '12px'}}>Sincronizaremos Chart.js para mostrar ventas de tienda vs servicios.</p>
            </div>
          </div>
        </Col>

      </Row>
    </div>
  );
}