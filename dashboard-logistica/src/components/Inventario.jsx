import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Form, Table, Spinner, Badge, Card } from 'react-bootstrap';
import { collection, onSnapshot, addDoc, query, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { IoCube, IoAlertCircle, IoAdd, IoSearch, IoPencil, IoTrash, IoEye, IoCart } from 'react-icons/io5';

// --- CATEGORÍAS PARA FILTRADO ---
const CATEGORIAS = ['Salud', 'Higiene', 'Alimento', 'Accesorios', 'Farmacia'];

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  
  // Modales y Estados de Edición
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  
  const estadoInicial = {
    nombre: '',
    descripcion: '',
    categoria: 'Salud',
    stock: 0,
    stockMinimo: 5,
    precioVenta: 0,
    imagen: 'https://via.placeholder.com/150' // Placeholder para la App
  };

  const [productoActual, setProductoActual] = useState(estadoInicial);

  // --- ESCUCHAR FIREBASE ---
  useEffect(() => {
    const q = query(collection(db, 'inventario'), orderBy('nombre', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(lista);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  // --- FUNCIONES ---
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateDoc(doc(db, 'inventario', productoActual.id), {
          ...productoActual,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'inventario'), {
          ...productoActual,
          createdAt: serverTimestamp()
        });
      }
      setShowModal(false);
      setProductoActual(estadoInicial);
      setEditando(false);
    } catch (err) { console.error("Error al guardar producto:", err); }
  };

  const prepararEdicion = (prod) => {
    setProductoActual(prod);
    setEditando(true);
    setShowModal(true);
  };

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Deseas eliminar este producto del catálogo?")) {
      await deleteDoc(doc(db, 'inventario', id));
    }
  };

  // Lógica de filtrado
  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    return coincideNombre && coincideCat;
  });

  return (
    <div className="animate__animated animate__fadeIn">
      {/* 1. DASHBOARD DE ESTADÍSTICAS */}
      <Row className="mb-4 gx-3">
        <Col md={4}>
          <div className="glass-card p-4 text-center border-bottom border-primary border-4">
            <p className="text-muted small fw-bold mb-1 text-uppercase">Total Productos</p>
            <h2 className="fw-bold m-0">{productos.length}</h2>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 text-center border-bottom border-danger border-4">
            <p className="text-muted small fw-bold mb-1 text-uppercase">Stock Crítico (Menos de 5)</p>
            <h2 className="fw-bold m-0 text-danger">{productos.filter(p => p.stock <= p.stockMinimo).length}</h2>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 text-center border-bottom border-success border-4">
            <p className="text-muted small fw-bold mb-1 text-uppercase">Valor del Inventario</p>
            <h2 className="fw-bold m-0 text-success">
              ${productos.reduce((acc, p) => acc + (p.stock * p.precioVenta), 0).toLocaleString()}
            </h2>
          </div>
        </Col>
      </Row>

      {/* 2. BARRA DE HERRAMIENTAS */}
      <div className="glass-card p-4 mb-4">
        <Row className="align-items-center">
          <Col md={4}>
            <div className="position-relative">
              <IoSearch className="position-absolute" style={{left: '12px', top: '12px', color: '#94A3B8'}} />
              <Form.Control 
                type="text" placeholder="Buscar en bodega..." className="custom-input ps-5" 
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </Col>
          <Col md={3}>
            <Form.Select className="custom-input" value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
              <option value="Todas">Todas las categorías</option>
              {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Form.Select>
          </Col>
          <Col md={5} className="text-end">
            <button 
              onClick={() => { setEditando(false); setProductoActual(estadoInicial); setShowModal(true); }}
              className="btn btn-dark fw-bold px-4 py-2 d-inline-flex align-items-center gap-2"
              style={{borderRadius: '10px'}}
            >
              <IoAdd size={20} /> Nuevo Producto
            </button>
          </Col>
        </Row>
      </div>

      {/* 3. TABLA DE GESTIÓN */}
      <div className="glass-card">
        <Table borderless hover responsive className="beauty-table m-0 align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio Venta</th>
              <th>Stock Actual</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan="5" className="text-center py-5"><Spinner animation="border" color="primary" /></td></tr>
            ) : productosFiltrados.map((prod) => (
              <tr key={prod.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light p-2 rounded"><IoCube color="#64748B" /></div>
                    <div>
                      <span className="fw-bold d-block">{prod.nombre}</span>
                      <small className="text-muted text-truncate d-block" style={{maxWidth: '200px'}}>{prod.descripcion}</small>
                    </div>
                  </div>
                </td>
                <td><Badge bg="light" text="dark" className="border">{prod.categoria}</Badge></td>
                <td><span className="fw-bold text-success">${prod.precioVenta}</span></td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`fw-bold ${prod.stock <= prod.stockMinimo ? 'text-danger' : ''}`}>
                      {prod.stock} unidades
                    </span>
                    {prod.stock <= prod.stockMinimo && <IoAlertCircle color="#EF4444" title="Stock bajo" />}
                  </div>
                </td>
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button onClick={() => prepararEdicion(prod)} className="btn btn-sm btn-light border p-2"><IoPencil size={16} /></button>
                    <button onClick={() => eliminarProducto(prod.id)} className="btn btn-sm btn-light border p-2 text-danger"><IoTrash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* 4. MODAL DE EDICIÓN Y VISTA PREVIA (APP CLIENTE) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="xl">
        <Modal.Header closeButton><Modal.Title className="fw-bold">{editando ? 'Editar Producto' : 'Registrar Nuevo Producto'}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4 p-md-5">
          <Row>
            {/* Formulario de Edición */}
            <Col lg={7} className="border-end pe-lg-5">
              <Form onSubmit={handleGuardar}>
                <h6 className="text-muted text-uppercase small fw-bold mb-3">Datos del Producto</h6>
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label">Título del Producto</Form.Label>
                  <Form.Control 
                    type="text" value={productoActual.nombre} 
                    onChange={e => setProductoActual({...productoActual, nombre: e.target.value})} 
                    placeholder="Ej. Vacuna Sextuple" className="custom-input" required 
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label className="custom-label">Descripción (App Cliente)</Form.Label>
                  <Form.Control 
                    as="textarea" rows={3} value={productoActual.descripcion} 
                    onChange={e => setProductoActual({...productoActual, descripcion: e.target.value})} 
                    placeholder="Describe los beneficios para la mascota..." className="custom-input" required 
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Label className="custom-label">Categoría</Form.Label>
                    <Form.Select 
                      value={productoActual.categoria} 
                      onChange={e => setProductoActual({...productoActual, categoria: e.target.value})} 
                      className="custom-input"
                    >
                      {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </Form.Select>
                  </Col>
                  <Col md={6}>
                    <Form.Label className="custom-label">Costo de Venta ($)</Form.Label>
                    <Form.Control 
                      type="number" value={productoActual.precioVenta} 
                      onChange={e => setProductoActual({...productoActual, precioVenta: parseFloat(e.target.value)})} 
                      className="custom-input" required 
                    />
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Label className="custom-label">Stock Actual</Form.Label>
                    <Form.Control 
                      type="number" value={productoActual.stock} 
                      onChange={e => setProductoActual({...productoActual, stock: parseInt(e.target.value)})} 
                      className="custom-input" required 
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Label className="custom-label">Alerta Stock Bajo</Form.Label>
                    <Form.Control 
                      type="number" value={productoActual.stockMinimo} 
                      onChange={e => setProductoActual({...productoActual, stockMinimo: parseInt(e.target.value)})} 
                      className="custom-input" 
                    />
                  </Col>
                </Row>

                <button type="submit" className="btn w-100 text-white fw-bold py-3" style={{backgroundColor: 'var(--accent)', borderRadius: '10px'}}>
                  {editando ? 'Actualizar en Catálogo' : 'Añadir al Inventario'}
                </button>
              </Form>
            </Col>

            {/* VISTA PREVIA DE LA APP (CLIENTE) */}
            <Col lg={5} className="ps-lg-5 mt-4 mt-lg-0">
              <h6 className="text-muted text-uppercase small fw-bold mb-3 d-flex align-items-center gap-2">
                <IoEye /> Previsualización en App Móvil
              </h6>
              <div className="d-flex justify-content-center">
                <Card className="shadow-sm border-0" style={{ width: '280px', borderRadius: '25px', overflow: 'hidden', background: '#f8f9fa' }}>
                  <div style={{ height: '180px', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IoCube size={60} color="#adb5bd" />
                  </div>
                  <Card.Body className="p-4 bg-white">
                    <Badge bg="warning" text="dark" className="mb-2" style={{fontSize: '10px'}}>{productoActual.categoria.toUpperCase()}</Badge>
                    <Card.Title className="fw-bold" style={{fontSize: '18px', color: '#1a1a1a'}}>{productoActual.nombre || 'Título del Producto'}</Card.Title>
                    <Card.Text className="text-muted mb-3" style={{fontSize: '12px', lineHeight: '1.4'}}>
                      {productoActual.descripcion || 'Aquí aparecerá la descripción que los clientes leerán en su smartphone.'}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="fw-bold" style={{fontSize: '20px', color: '#f39c12'}}>${productoActual.precioVenta}</span>
                      <button className="btn btn-dark btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center">
                        <IoCart size={18} />
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
              <p className="text-center text-muted small mt-3 px-4">
                "Esta es la apariencia exacta que tendrá el producto para tus clientes en la tienda móvil."
              </p>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
}