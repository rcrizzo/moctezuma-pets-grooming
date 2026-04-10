import React, { useState } from 'react';
import { Form, Spinner } from 'react-bootstrap';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Importamos tu conexión de auth

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Intentamos iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      // Si es exitoso, Firebase avisará automáticamente a App.jsx y la pantalla cambiará
    } catch (err) {
      console.error(err);
      setError('Credenciales incorrectas o usuario no encontrado.');
      setCargando(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="glass-card shadow-lg" style={{ maxWidth: '450px', width: '100%', padding: '50px 40px' }}>
        
        <div className="text-center mb-5">
          <div style={{fontSize: '48px', color: 'var(--accent)'}}>🐾</div>
          <h2 className="fw-bold mt-2" style={{color: 'var(--text-dark)'}}>Moctezuma Center</h2>
          <p className="text-muted">Acceso exclusivo para personal</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{fontSize: '14px', borderRadius: '8px'}}>
            {error}
          </div>
        )}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-4">
            <Form.Label className="custom-label">Correo Electrónico</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="admin@moctezuma.com" 
              className="custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </Form.Group>

          <Form.Group className="mb-5">
            <Form.Label className="custom-label">Contraseña</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="••••••••" 
              className="custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </Form.Group>

          <button 
            type="submit" 
            className="btn w-100 py-3 fw-bold text-white d-flex justify-content-center align-items-center gap-2" 
            style={{ backgroundColor: 'var(--accent)', borderRadius: '10px' }}
            disabled={cargando}
          >
            {cargando ? <Spinner size="sm" animation="border" /> : 'Iniciar Sesión'}
          </button>
        </Form>
        
      </div>
    </div>
  );
}