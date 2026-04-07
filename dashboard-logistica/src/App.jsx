import React from 'react';
import LogisticaTable from './LogisticaTable'; // Importamos tu componente

function App() {
  return (
    // Este div actúa como el fondo de toda tu pantalla
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: '20px' }}>
      
      {/* Barra superior sencilla para darle contexto de aplicación */}
      <header style={{ 
        backgroundColor: '#fff', 
        padding: '15px 20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          🐾 Panel Administrativo
        </h1>
      </header>

      {/* Aquí cargamos la tabla que ya programaste */}
      <main style={{ 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <LogisticaTable />
      </main>

    </div>
  );
}

export default App;