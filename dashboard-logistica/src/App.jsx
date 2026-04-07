import React, { useState } from 'react';
import Resumen from './components/Resumen';
import LogisticaTable from './components/LogisticaTable';
import NuevaCita from './components/NuevaCita';
import './index.css';

function App() {
  const [vistaActual, setVistaActual] = useState('logistica');

  return (
    <div className="app-container">
      
      {/* SIDEBAR FIJO */}
      <aside className="sidebar pt-4">
        <div className="px-4 mb-5 d-flex align-items-center gap-3">
          <div style={{fontSize: '28px'}}>🐾</div>
          <h1 className="m-0 text-white fw-bold" style={{fontSize: '18px', letterSpacing: '0.5px'}}>
            Moctezuma Dashboard
          </h1>
        </div>

        <nav className="d-flex flex-column gap-2">
          <div className={`nav-item-custom ${vistaActual === 'resumen' ? 'active' : ''}`} onClick={() => setVistaActual('resumen')}>
            📊 Resumen
          </div>
          <div className={`nav-item-custom ${vistaActual === 'logistica' ? 'active' : ''}`} onClick={() => setVistaActual('logistica')}>
            📋 Solicitudes
          </div>
          <div className={`nav-item-custom ${vistaActual === 'nuevaCita' ? 'active' : ''}`} onClick={() => setVistaActual('nuevaCita')}>
            🐶 Mascotas
          </div>
        </nav>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="main-wrapper">
        
        {/* HEADER SUPERIOR CON PADDING GENEROSO */}
        <header className="top-header">
          <h2 className="m-0 fw-bold" style={{fontSize: '22px', color: 'var(--text-dark)'}}>
            {vistaActual === 'resumen' ? 'Resumen Operativo' : vistaActual === 'logistica' ? 'Revisión de Solicitudes' : 'Gestión de Perfil Logístico'}
          </h2>
          
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <p className="m-0 fw-bold" style={{fontSize: '14px'}}>Carlos Martínez</p>
              <p className="m-0 text-muted" style={{fontSize: '12px'}}>Administrador</p>
            </div>
            <div style={{width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'}}>
              C
            </div>
          </div>
        </header>

        {/* ÁREA DE TRABAJO (CON MUCHO MARGIN/PADDING) */}
        <section className="content-area">
          {vistaActual === 'resumen' && <Resumen />}
          {vistaActual === 'logistica' && <LogisticaTable />}
          {vistaActual === 'nuevaCita' && <NuevaCita />}
        </section>

      </main>
    </div>
  );
}

export default App;