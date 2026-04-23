import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; 
import { Spinner } from 'react-bootstrap';
import { IoPaw, IoBarChart, IoCut, IoMedical, IoBed, IoPeople, IoStorefront, IoLogOut } from 'react-icons/io5';

// Componentes
import Login from './components/LogIn';
import Resumen from './components/Resumen';
import Grooming from './components/Grooming';
import Veterinaria from './components/Veterinaria';
import Hospedaje from './components/Hospedaje';
import Clientes from './components/Clientes';
import Mascotas from './components/Mascotas';
import Inventario from './components/Inventario';
import Pedidos from './components/Pedidos';

import './index.css';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);
  const [vistaActual, setVistaActual] = useState('resumen');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setVerificandoAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  if (verificandoAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: 'var(--main-bg)'}}>
        <Spinner animation="border" style={{color: 'var(--accent)'}} />
      </div>
    );
  }

  if (!usuario) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* SIDEBAR FIJO: Nunca desaparece al cambiar de vistas */}
      <aside className="sidebar pt-4 d-flex flex-column" style={{ overflowY: 'auto' }}>
        <div className="px-4 mb-4 d-flex align-items-center gap-3">
          <IoPaw size={28} color="var(--accent)" />
          <h1 className="m-0 text-white fw-bold" style={{fontSize: '18px', letterSpacing: '0.5px'}}>
            Moctezuma Pet's
          </h1>
        </div>

        <nav className="d-flex flex-column gap-1 flex-grow-1">
          <div className="px-4 pt-3 pb-2 text-uppercase fw-bold" style={{fontSize: '11px', color: '#6B7280', letterSpacing: '1px'}}>Principal</div>
          <div className={`nav-item-custom ${vistaActual === 'resumen' ? 'active' : ''}`} onClick={() => setVistaActual('resumen')}>
            <IoBarChart size={18} /> Resumen General
          </div>
          
          <div className="px-4 pt-4 pb-2 text-uppercase fw-bold" style={{fontSize: '11px', color: '#6B7280', letterSpacing: '1px'}}>Operación</div>
          <div className={`nav-item-custom ${vistaActual === 'grooming' ? 'active' : ''}`} onClick={() => setVistaActual('grooming')}>
            <IoCut size={18} /> Grooming & Estética
          </div>
          <div className={`nav-item-custom ${vistaActual === 'veterinaria' ? 'active' : ''}`} onClick={() => setVistaActual('veterinaria')}>
            <IoMedical size={18} /> Salud Veterinaria
          </div>
          <div className={`nav-item-custom ${vistaActual === 'hospedaje' ? 'active' : ''}`} onClick={() => setVistaActual('hospedaje')}>
            <IoBed size={18} /> Hospedaje / Hotel
          </div>

          <div className="px-4 pt-4 pb-2 text-uppercase fw-bold" style={{fontSize: '11px', color: '#6B7280', letterSpacing: '1px'}}>Administración</div>
          <div className={`nav-item-custom ${vistaActual === 'clientes' ? 'active' : ''}`} onClick={() => setVistaActual('clientes')}>
            <IoPeople size={18} /> Directorio Clientes
          </div>
          <div className={`nav-item-custom ${vistaActual === 'mascotas' ? 'active' : ''}`} onClick={() => setVistaActual('mascotas')}>
            <IoPaw size={18} /> Perfiles Mascotas
          </div>
          {/* Al darle click al inventario, o si estás en pedidos, mantiene iluminada esta sección */}
          <div className={`nav-item-custom ${vistaActual === 'inventario' || vistaActual === 'pedidos' ? 'active' : ''}`} onClick={() => setVistaActual('inventario')}>
            <IoStorefront size={18} /> Inventario y Tienda
          </div>
        </nav>

        <div className="p-4 mt-auto border-top" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
          <button onClick={handleCerrarSesion} className="btn w-100 text-start d-flex align-items-center gap-2" style={{color: '#9CA3AF', backgroundColor: 'transparent'}}>
            <IoLogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="main-wrapper">
        <header className="top-header">
          <h2 className="m-0 fw-bold" style={{fontSize: '22px', color: 'var(--text-dark)'}}>
            {vistaActual === 'pedidos' ? 'Bandeja de Pedidos' : 'Panel Administrativo'}
          </h2>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <p className="m-0 fw-bold" style={{fontSize: '14px'}}>Administrador</p>
              <p className="m-0 text-muted" style={{fontSize: '12px'}}>{usuario.email}</p>
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
          
          {/* PASAMOS LA FUNCIÓN setVistaActual A TUS COMPONENTES ORIGINALES */}
          {vistaActual === 'inventario' && <Inventario setVistaActual={setVistaActual} />}
          {vistaActual === 'pedidos' && <Pedidos setVistaActual={setVistaActual} />}
        </section>
      </main>
    </div>
  );
}

export default App;