import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; // <-- Importamos auth
import { Spinner } from 'react-bootstrap';

// Importación de tus componentes
import Login from './components/LogIn';
import Resumen from './components/Resumen';
import Grooming from './components/Grooming';
import Veterinaria from './components/Veterinaria';
import Hospedaje from './components/Hospedaje';
import Clientes from './components/Clientes';
import Mascotas from './components/Mascotas';
import Inventario from './components/Inventario';

import './index.css';

function App() {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [usuario, setUsuario] = useState(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);
  
  // --- ESTADOS DEL DASHBOARD ---
  const [vistaActual, setVistaActual] = useState('resumen');

  // EFECTO: Escuchar si hay alguien logueado al abrir la página
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user); // Si user tiene datos, hay sesión. Si es null, no hay.
      setVerificandoAuth(false); // Terminamos de revisar
    });
    return () => unsubscribe();
  }, []);

  // FUNCIÓN: Cerrar sesión
  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  // 1. PANTALLA DE CARGA (Mientras Firebase decide si tienes sesión o no)
  if (verificandoAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: 'var(--bg-main)'}}>
        <Spinner animation="border" style={{color: 'var(--accent)'}} />
      </div>
    );
  }

  // 2. PANTALLA DE LOGIN (Si Firebase dice que NO hay sesión)
  if (!usuario) {
    return <Login />;
  }

  // 3. EL DASHBOARD PRIVADO (Si llegamos aquí, el usuario está autorizado)
  return (
    <div className="app-container">
      <aside className="sidebar pt-4 d-flex flex-column" style={{ overflowY: 'auto' }}>
        <div className="px-4 mb-4 d-flex align-items-center gap-3">
          <div style={{fontSize: '28px'}}>🐾</div>
          <h1 className="m-0 text-white fw-bold" style={{fontSize: '18px', letterSpacing: '0.5px'}}>
            Moctezuma Center
          </h1>
        </div>

        {/* ... (Todo tu menú de navegación exacto como lo teníamos) ... */}
        <nav className="d-flex flex-column gap-1 flex-grow-1">
          <div className="px-4 pt-3 pb-2 text-uppercase fw-bold" style={{fontSize: '11px', color: '#6B7280', letterSpacing: '1px'}}>Principal</div>
          <div className={`nav-item-custom ${vistaActual === 'resumen' ? 'active' : ''}`} onClick={() => setVistaActual('resumen')}>📊 Resumen General</div>
          
          <div className="px-4 pt-4 pb-2 text-uppercase fw-bold" style={{fontSize: '11px', color: '#6B7280', letterSpacing: '1px'}}>Operación</div>
          <div className={`nav-item-custom ${vistaActual === 'grooming' ? 'active' : ''}`} onClick={() => setVistaActual('grooming')}>✂️ Grooming & Estética</div>
          <div className={`nav-item-custom ${vistaActual === 'veterinaria' ? 'active' : ''}`} onClick={() => setVistaActual('veterinaria')}>🏥 Salud Veterinaria</div>
          <div className={`nav-item-custom ${vistaActual === 'hospedaje' ? 'active' : ''}`} onClick={() => setVistaActual('hospedaje')}>🏨 Hospedaje / Hotel</div>

          <div className="px-4 pt-4 pb-2 text-uppercase fw-bold" style={{fontSize: '11px', color: '#6B7280', letterSpacing: '1px'}}>Administración</div>
          <div className={`nav-item-custom ${vistaActual === 'clientes' ? 'active' : ''}`} onClick={() => setVistaActual('clientes')}>👥 Directorio Clientes</div>
          <div className={`nav-item-custom ${vistaActual === 'mascotas' ? 'active' : ''}`} onClick={() => setVistaActual('mascotas')}>🐶 Perfiles Mascotas</div>
          <div className={`nav-item-custom ${vistaActual === 'inventario' ? 'active' : ''}`} onClick={() => setVistaActual('inventario')}>📦 Inventario y Tienda</div>
        </nav>

        {/* BOTÓN DE CERRAR SESIÓN (Abajo del todo en el sidebar) */}
        <div className="p-4 mt-auto border-top" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
          <button onClick={handleCerrarSesion} className="btn w-100 text-start d-flex align-items-center gap-2" style={{color: '#9CA3AF', backgroundColor: 'transparent'}}>
            <span style={{fontSize: '18px'}}>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-wrapper">
        <header className="top-header">
          <h2 className="m-0 fw-bold" style={{fontSize: '22px', color: 'var(--text-dark)'}}>Panel Administrativo</h2>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <p className="m-0 fw-bold" style={{fontSize: '14px'}}>Administrador</p>
              <p className="m-0 text-muted" style={{fontSize: '12px'}}>{usuario.email}</p> {/* <-- Mostramos el correo real logueado */}
            </div>
            <div style={{width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'}}>
              {usuario.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="content-area">
          {vistaActual === 'resumen' && <Resumen />}
          {vistaActual === 'grooming' && <Grooming />}
          {vistaActual === 'veterinaria' && <Veterinaria />}
          {vistaActual === 'hospedaje' && <Hospedaje />}
          {vistaActual === 'clientes' && <Clientes />}
          {vistaActual === 'mascotas' && <Mascotas />}
          {vistaActual === 'inventario' && <Inventario />}
        </section>
      </main>
    </div>
  );
}

export default App;